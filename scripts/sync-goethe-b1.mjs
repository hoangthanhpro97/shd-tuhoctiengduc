import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  parseHoerenPdf,
  parseLesenPdf,
  parseMdTranscript,
  probeAudioSilenceEnd,
  resolveFfmpeg,
} from './goethe-b1-lib/parser.mjs';
import { parseExamFixture } from '../packages/contracts/dist/esm/index.js';

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, 'apps/web/public/audio/raw-goethe-b1');
const AUDIO_OUT_DIR = path.join(ROOT, 'apps/web/public/audio/goethe-b1');
const DATA_DIR = path.join(ROOT, 'scripts/goethe-b1-data');
const EXAM_OUT_DIR = path.join(ROOT, 'content/exams');

const FORCE_AUDIO = process.argv.includes('--force-audio');
const CHECK_ONLY = process.argv.includes('--check-only');
const collectedErrors = [];

function collapseWs(text) {
  return String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pad2(num) {
  return String(num).padStart(2, '0');
}

function findHoerenSubdirs(rootHorenDir) {
  const map = new Map();
  if (!fs.existsSync(rootHorenDir)) return map;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const full = path.join(dir, entry.name);
      const match = entry.name.match(/(\d+)$/);
      if (match) {
        const files = fs.readdirSync(full);
        if (files.some((f) => /^TEIL\s*1\.wav$/i.test(f))) {
          map.set(pad2(Number(match[1])), full);
          continue;
        }
      }
      walk(full);
    }
  };
  walk(rootHorenDir);
  return map;
}

function probeMediaDurationSec(mediaPath) {
  const ffmpeg = resolveFfmpeg();
  const r = spawnSync(ffmpeg, ['-hide_banner', '-i', mediaPath, '-f', 'null', '-'], { encoding: 'utf8' });
  const stderr = r.stderr || '';
  const m = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) return 0;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

function encodeAudioIfNeeded(wavPath, mp3Path, trimToSec) {
  const wavBytes = fs.existsSync(wavPath) ? fs.statSync(wavPath).size : 0;
  if (!FORCE_AUDIO && fs.existsSync(mp3Path) && fs.statSync(mp3Path).size > 10_000) {
    return {
      wavBytes,
      mp3Bytes: fs.statSync(mp3Path).size,
      durationSec: Math.round(probeMediaDurationSec(mp3Path)),
      reused: true,
    };
  }
  const ffmpeg = resolveFfmpeg();
  const args = ['-y', '-i', wavPath];
  if (trimToSec !== null) {
    args.push('-t', String(trimToSec));
  }
  args.push('-codec:a', 'libmp3lame', '-b:a', '128k', '-ac', '1', mp3Path, '-loglevel', 'error');
  const res = spawnSync(ffmpeg, args, { encoding: 'utf8' });
  if (res.status !== 0) {
    throw new Error(`ffmpeg failed on ${wavPath}: ${res.stderr}`);
  }
  return {
    wavBytes,
    mp3Bytes: fs.statSync(mp3Path).size,
    durationSec: Math.round(probeMediaDurationSec(mp3Path)),
    reused: false,
  };
}

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function main() {
  const lesenDir = path.join(RAW_DIR, 'LESEN');
  const horenDir = path.join(RAW_DIR, 'HOREN');
  if (!fs.existsSync(lesenDir) || !fs.existsSync(horenDir)) {
    throw new Error(`Missing raw Goethe B1 folders under ${RAW_DIR}`);
  }

  fs.mkdirSync(AUDIO_OUT_DIR, { recursive: true });
  fs.mkdirSync(EXAM_OUT_DIR, { recursive: true });

  const lesenMap = new Map();
  for (const file of fs.readdirSync(lesenDir)) {
    const m = file.match(/(\d+)\.pdf$/i);
    if (m) lesenMap.set(pad2(Number(m[1])), path.join(lesenDir, file));
  }
  const horenMap = findHoerenSubdirs(horenDir);
  const commonSets = [...lesenMap.keys()]
    .filter((k) => horenMap.has(k))
    .sort((a, b) => Number(a) - Number(b));

  if (commonSets.length === 0) {
    throw new Error('No paired Lesen + Hören Goethe B1 exams found.');
  }

  const auditRows = [];

  for (const setNum of commonSets) {
    const lesenPdf = lesenMap.get(setNum);
    const hoerenFolder = horenMap.get(setNum);
    const hoerenFiles = fs.readdirSync(hoerenFolder);
    const hoerenPdfName = hoerenFiles.find((f) => /\.pdf$/i.test(f));
    const hoerenMdName = hoerenFiles.find((f) => /\.md$/i.test(f));
    if (!hoerenPdfName || !hoerenMdName) {
      throw new Error(`Set ${setNum}: missing PDF or MD inside ${hoerenFolder}`);
    }

    const dataPath = path.join(DATA_DIR, `set-${setNum}.json`);
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Missing curated dataset file ${dataPath}`);
    }
    const curated = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // 1. Ensure TEIL 1..4 MP3s exist (trimming silence on TEIL 4 when encoding)
    let wavTotal = 0;
    let mp3Total = 0;
    let teil4Dur = 0;
    const audioUrls = {};
    for (let p = 1; p <= 4; p++) {
      const wavName = hoerenFiles.find((f) => new RegExp(`^TEIL\\s*${p}\\.wav$`, 'i').test(f));
      if (!wavName) throw new Error(`Set ${setNum}: missing TEIL ${p}.wav`);
      const wavPath = path.join(hoerenFolder, wavName);
      const mp3Filename = `test-${setNum}-teil-${p}.mp3`;
      const mp3Path = path.join(AUDIO_OUT_DIR, mp3Filename);

      let trimToSec = null;
      if (p === 4 && (FORCE_AUDIO || !fs.existsSync(mp3Path))) {
        trimToSec = probeAudioSilenceEnd(wavPath).trimToSec;
      }
      const stat = encodeAudioIfNeeded(wavPath, mp3Path, trimToSec);
      wavTotal += stat.wavBytes;
      mp3Total += stat.mp3Bytes;
      if (p === 4) teil4Dur = stat.durationSec;
      audioUrls[p] = `/audio/goethe-b1/${mp3Filename}`;
    }

    // 2. Parse Lesen PDF, Hören PDF, and Hören MD transcript
    const lesenParsed = parseLesenPdf(lesenPdf);
    const hoerenParsed = parseHoerenPdf(path.join(hoerenFolder, hoerenPdfName));
    const transcriptsByPart = parseMdTranscript(path.join(hoerenFolder, hoerenMdName), hoerenParsed, setNum);

    if (lesenParsed.parts.length !== 5 || hoerenParsed.parts.length !== 4) {
      throw new Error(`Set ${setNum}: unexpected part counts.`);
    }

    const lesenKeyMap = new Map(curated.keys.lesen.map((k) => [k.order, k]));
    const hoerenKeyMap = new Map(curated.keys.hoeren.map((k) => [k.order, k]));
    if (lesenKeyMap.size !== 30 || hoerenKeyMap.size !== 30) {
      throw new Error(`Set ${setNum}: expected 30 Lesen + 30 Hören keys (got ${lesenKeyMap.size}/${hoerenKeyMap.size})`);
    }

    const serverGradingKeys = [];
    const sections = [];

    // Build 5 Lesen sections
    for (const partObj of lesenParsed.parts) {
      const stimulusContent = partObj.stimulusContent;
      const stimulusHaystack = collapseWs(stimulusContent).toLowerCase();
      const questions = partObj.questions.map((q) => {
        const questionId = `GOETHE_B1_T${setNum}_L_Q${pad2(q.order)}`;
        const keyInfo = lesenKeyMap.get(q.order);
        if (!keyInfo) {
          collectedErrors.push(`Set ${setNum} Lesen Q${q.order}: missing key`);
          return { id: questionId, order: q.order, part: partObj.part, prompt: q.prompt, options: q.options };
        }
        if (keyInfo.citation.includes('...')) {
          collectedErrors.push(`Set ${setNum} Lesen Q${q.order}: citation contains '...'`);
        }
        const needle = collapseWs(keyInfo.citation).toLowerCase();
        if (!stimulusHaystack.includes(needle)) {
          collectedErrors.push(`Set ${setNum} Lesen Q${q.order} (Teil ${partObj.part}): citation not found -> "${keyInfo.citation}"`);
        }
        const optExists = q.options.some((o) => o.id === keyInfo.correctOption);
        if (!optExists) {
          collectedErrors.push(`Set ${setNum} Lesen Q${q.order}: invalid correctOption "${keyInfo.correctOption}"`);
        }

        serverGradingKeys.push({
          questionId,
          correctOption: keyInfo.correctOption,
          points: 1,
          citation: keyInfo.citation,
          trapExplanationVi: keyInfo.trapExplanationVi,
          tags: [`Lesen`, `Teil ${partObj.part}`, `Goethe B1`],
        });

        const taskType =
          q.questionType === 'binary'
            ? partObj.part === 4
              ? 'binary_opinion'
              : 'binary'
            : q.questionType === 'matching'
              ? 'matching'
              : 'multiple_choice';

        return {
          id: questionId,
          order: q.order,
          part: partObj.part,
          prompt: q.prompt,
          options: q.options,
          taskType,
          ...(q.order <= 2 ? { publicExplanation: keyInfo.publicExplanation ?? keyInfo.trapExplanationVi } : {}),
        };
      });

      sections.push({
        sectionId: `sec_goethe_b1_t${setNum}_lesen_p${partObj.part}`,
        skill: 'Lesen',
        title: partObj.title,
        durationMinutes: partObj.durationMinutes,
        totalQuestions: questions.length,
        stimulus: {
          type: 'text',
          title: partObj.stimulusTitle,
          content: stimulusContent,
        },
        questions,
      });
    }

    // Build 4 Hören sections
    for (const partObj of hoerenParsed.parts) {
      const p = partObj.part;
      const deTurns = transcriptsByPart[p] || [];
      const viTurns = curated.transcriptVi[String(p)] || [];
      if (deTurns.length !== viTurns.length) {
        collectedErrors.push(
          `Set ${setNum} Hören Teil ${p}: transcript turn count mismatch (MD=${deTurns.length}, curatedVi=${viTurns.length})`
        );
      }
      const dialogueTranscript = deTurns.map((t, idx) => ({
        speakerId: t.speakerId,
        roleSide: t.roleSide,
        speakerName: t.speakerName,
        timestampStart: t.timestampStart,
        timestampEnd: t.timestampEnd,
        textDe: t.textDe,
        textVi: viTurns[idx] || '[TODO]',
      }));
      const transcriptHaystack = collapseWs(dialogueTranscript.map((t) => t.textDe).join(' ')).toLowerCase();

      const questions = partObj.questions.map((q) => {
        const questionId = `GOETHE_B1_T${setNum}_H_Q${pad2(q.order)}`;
        const keyInfo = hoerenKeyMap.get(q.order);
        if (!keyInfo) {
          collectedErrors.push(`Set ${setNum} Hören Q${q.order}: missing key`);
          return { id: questionId, order: q.order, part: p, prompt: q.prompt, options: q.options };
        }
        if (keyInfo.citation.includes('...')) {
          collectedErrors.push(`Set ${setNum} Hören Q${q.order}: citation contains '...'`);
        }
        const needle = collapseWs(keyInfo.citation).toLowerCase();
        if (!transcriptHaystack.includes(needle)) {
          collectedErrors.push(`Set ${setNum} Hören Q${q.order} (Teil ${p}): citation not found -> "${keyInfo.citation}"`);
        }
        const optExists = q.options.some((o) => o.id === keyInfo.correctOption);
        if (!optExists) {
          collectedErrors.push(`Set ${setNum} Hören Q${q.order}: invalid correctOption "${keyInfo.correctOption}"`);
        }

        serverGradingKeys.push({
          questionId,
          correctOption: keyInfo.correctOption,
          points: 1,
          citation: keyInfo.citation,
          trapExplanationVi: keyInfo.trapExplanationVi,
          tags: [`Hören`, `Teil ${p}`, `Goethe B1`],
        });

        return {
          id: questionId,
          order: q.order,
          part: p,
          prompt: q.prompt,
          options: q.options,
          taskType: q.questionType === 'binary' ? 'binary' : 'multiple_choice',
          ...(q.order <= 2 ? { publicExplanation: keyInfo.publicExplanation ?? keyInfo.trapExplanationVi } : {}),
        };
      });

      const preRepeated = p === 1 || p === 4;
      sections.push({
        sectionId: `sec_goethe_b1_t${setNum}_hoeren_p${p}`,
        skill: 'Hoeren',
        title: partObj.title,
        durationMinutes: partObj.durationMinutes,
        totalQuestions: questions.length,
        stimulus: {
          type: 'audio',
          title: partObj.stimulusTitle,
          content: partObj.introDe || partObj.title,
          audioUrl: audioUrls[p],
          dialogueTranscript,
          annotations: {
            maxPlayCount: preRepeated ? 2 : 1,
            audioIncludesRepetition: preRepeated,
            playbackNote: preRepeated
              ? 'File âm thanh đề chuẩn Goethe B1 cho Teil này đã ghép sẵn 2 lần đọc liên tiếp.'
              : 'Theo quy chuẩn đề thi Goethe-Zertifikat B1, Teil này chỉ được nghe 1 lần duy nhất.',
          },
        },
        questions,
      });
    }

    const examId = `goethe-b1-test-${setNum}`;
    const fixture = {
      examMetadata: {
        examId,
        slug: examId,
        title: `Goethe-Zertifikat B1 - Modellsatz ${setNum}`,
        cefrLevel: 'B1',
        providerFormat: 'Goethe',
        disclaimer: `Bộ đề ôn luyện chuẩn Goethe-Zertifikat B1 (Modellsatz ${setNum} – ${curated.topicDe}) gồm đủ 5 phần Đọc (Lesen · 30 câu · 65 phút) và 4 phần Nghe (Hören · 30 câu · 40 phút), kèm khóa đáp án kiểm chứng 100% và bản chép lời song ngữ Đức–Việt.`,
        totalDurationMinutes: 105,
        passPercentage: 60,
        scoringPolicy: {
          lesenMaxPoints: 30,
          hoerenMaxPoints: 30,
          minPassingScorePerSkill: 18,
        },
      },
      sections,
      serverGradingKeys,
    };

    if (collectedErrors.length === 0) {
      // Strict validation via @shd/contracts
      parseExamFixture(fixture);

      const outPath = path.join(EXAM_OUT_DIR, `${examId}.json`);
      if (!CHECK_ONLY) {
        fs.writeFileSync(outPath, JSON.stringify(fixture, null, 2));
      }
    }

    auditRows.push({
      setNum,
      topic: curated.topicDe,
      wavSize: formatMb(wavTotal),
      mp3Size: formatMb(mp3Total),
      teil4Sec: `${teil4Dur}s`,
      keys: serverGradingKeys.length,
    });
  }

  if (collectedErrors.length > 0) {
    console.error(`\n[ERROR] Found ${collectedErrors.length} verification issue(s):`);
    for (const err of collectedErrors) console.error('  -', err);
    process.exit(1);
  }

  console.log('\n=== GOETHE B1 SYNC & AUDIT REPORT ===');
  console.log(`Synced exams: ${auditRows.length} (${auditRows[0]?.setNum}..${auditRows[auditRows.length - 1]?.setNum})`);
  console.table(auditRows);
}

main();
