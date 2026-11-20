import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const audioRoot = path.join(root, 'apps', 'web', 'public', 'audio');
const rawB1Dir = path.join(audioRoot, 'raw-b1');
const rawB2Dir = path.join(audioRoot, 'raw-b2');
const outB1Dir = path.join(audioRoot, 'osd-b1');
const outB2Dir = path.join(audioRoot, 'osd-b2');
const examsDir = path.join(root, 'content', 'exams');
const draftsDir = path.join(examsDir, '_drafts');

const B1_PLAY_COUNTS = [2, 1, 1, 2]; // Teil 1..4
const B2_PLAY_COUNTS = [1, 2];       // Aufgabe 1..2

const B1_HOEREN_TITLES = {
  1: 'Teil 1: Fünf kurze Ansagen / Nachrichten (Richtig/Falsch & A/B/C)',
  2: 'Teil 2: Führung / Präsentation (Multiple Choice A/B/C)',
  3: 'Teil 3: Alltagsgespräch zweier Personen (Richtig/Falsch)',
  4: 'Teil 4: Radiodiskussion mit Moderator und zwei Gästen (Zuordnung)',
};

const B2_HOEREN_TITLES = {
  1: 'Aufgabe 1: Radiosendung / Interview (Richtig/Falsch)',
  2: 'Aufgabe 2: Gespräch / Vergleichstabelle (Hörverstehen B2)',
};

function pad2(n) {
  return String(n).padStart(2, '0');
}

function parseTranscriptTurns(rawContent, defaultSpeaker = 'Sprecher/in') {
  if (!rawContent || typeof rawContent !== 'string') return undefined;
  const blocks = rawContent
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0 && !/^(?:AUDIO-TRANSKRIPTION|HÖRTEXT|VERGLEICHSTABELLE)/i.test(b));

  if (!blocks.length) return undefined;

  const turns = [];
  let cursorSec = 0;

  blocks.forEach((block, index) => {
    let speakerName = defaultSpeaker;
    let textDe = block;

    // Detect patterns like "[Text 1] '...'" or "Moderator: ..." or "Frau Berg: ..."
    const bracketMatch = block.match(/^\[([^\]]+)\]\s*(.+)$/s);
    const colonMatch = !bracketMatch ? block.match(/^([A-ZÄÖÜ][^:\n]{1,36}):\s*(.+)$/s) : null;

    if (bracketMatch) {
      speakerName = bracketMatch[1].trim();
      textDe = bracketMatch[2].trim();
    } else if (colonMatch) {
      speakerName = colonMatch[1].trim();
      textDe = colonMatch[2].trim();
    }

    textDe = textDe.replace(/^['"„“]|['"„“]$/g, '').trim();
    if (!textDe) return;

    const estimatedDuration = Math.max(8, Math.min(45, Math.round(textDe.split(/\s+/).length * 0.45)));
    turns.push({
      speakerId: `sp-${(index % 3) + 1}`,
      roleSide: index % 2 === 0 ? 'Left' : 'Right',
      speakerName,
      timestampStart: cursorSec,
      timestampEnd: cursorSec + estimatedDuration,
      textDe,
      textVi: `Bản dịch tham khảo đoạn ${index + 1} (${speakerName}) — bôi đen từ/cụm tiếng Đức để tra nghĩa 3 cấp độ.`,
    });
    cursorSec += estimatedDuration + 2;
  });

  return turns.length > 0 ? turns : undefined;
}

function sanitizeQuestion(q, fallbackPart) {
  const rawOptions = Array.isArray(q.options) ? q.options : [];
  const declared = String(q.taskType ?? q.questionType ?? '').toLowerCase();
  const isShortText =
    (rawOptions.length === 0 && /short_text|fill|blank|cloze/.test(declared)) ||
    (rawOptions.length > 0 && rawOptions.every((o) => o.id === 'TEXT'));

  const clean = {
    id: q.id,
    order: q.order,
    part: q.part ?? fallbackPart,
    prompt: q.prompt,
    options: isShortText
      ? []
      : rawOptions.map((o) => ({ id: String(o.id), text: String(o.text) })),
  };

  if (isShortText) {
    clean.taskType = 'short_text';
  } else if (q.taskType) {
    clean.taskType = q.taskType;
  } else if (q.questionType) {
    clean.questionType = q.questionType;
  }

  if (typeof q.sourcePage === 'number' && q.sourcePage > 0) {
    clean.sourcePage = q.sourcePage;
  }
  if (typeof q.publicExplanation === 'string' && q.publicExplanation.trim().length > 0) {
    clean.publicExplanation = q.publicExplanation.trim();
  }
  return clean;
}

function sanitizeGradingKey(k, questionById) {
  let correctOption = String(k.correctOption).trim();
  const q = questionById?.get(String(k.questionId));
  if (q && Array.isArray(q.options) && q.options.length > 0) {
    if (!q.options.some((o) => o.id === correctOption)) {
      const ciMatch = q.options.find((o) => o.id.toLowerCase() === correctOption.toLowerCase());
      if (ciMatch) correctOption = ciMatch.id;
    }
  }
  const clean = {
    questionId: String(k.questionId),
    correctOption,
    points: Number(k.points),
    citation: String(k.citation || 'Lösungsschlüssel ÖSD'),
    trapExplanationVi: String(k.trapExplanationVi || 'Đối chiếu dẫn chứng trong ngữ liệu gốc.'),
  };
  if (Array.isArray(k.tags) && k.tags.length > 0) {
    clean.tags = k.tags.map(String);
  }
  return clean;
}

async function syncAudioFiles() {
  await fs.mkdir(outB1Dir, { recursive: true });
  await fs.mkdir(outB2Dir, { recursive: true });

  // 1. Sync 60 B1 MP3 files
  const b1Files = (await fs.readdir(rawB1Dir)).filter((f) => f.toLowerCase().endsWith('.mp3'));
  let b1Copied = 0;
  for (const fileName of b1Files) {
    const match = fileName.match(/^_(\d+)_Hoeren_Teil_(\d+)\.mp3$/i);
    if (!match) {
      console.warn(`[WARN] Unrecognized B1 audio filename: ${fileName}`);
      continue;
    }
    const testNum = parseInt(match[1], 10);
    const teilNum = parseInt(match[2], 10);
    const destName = `test-${pad2(testNum)}-teil-${teilNum}.mp3`;
    await fs.copyFile(path.join(rawB1Dir, fileName), path.join(outB1Dir, destName));
    b1Copied++;
  }

  // 2. Sync 20 B2 MP3 files (strip extra whitespace before .mp3)
  const b2Files = (await fs.readdir(rawB2Dir)).filter((f) => f.toLowerCase().endsWith('.mp3'));
  let b2Copied = 0;
  for (const fileName of b2Files) {
    const match = fileName.match(/^Track\s+No(\d+)\s*\.mp3$/i);
    if (!match) {
      console.warn(`[WARN] Unrecognized B2 audio filename: ${fileName}`);
      continue;
    }
    const trackNum = parseInt(match[1], 10);
    const testNum = Math.ceil(trackNum / 2);
    const aufgabeNum = trackNum % 2 === 1 ? 1 : 2;
    const destName = `test-${pad2(testNum)}-aufgabe-${aufgabeNum}.mp3`;
    await fs.copyFile(path.join(rawB2Dir, fileName), path.join(outB2Dir, destName));
    b2Copied++;
  }

  console.log(`\n[AUDIO SYNC] Copied ${b1Copied} B1 MP3s -> /audio/osd-b1/ | ${b2Copied} B2 MP3s -> /audio/osd-b2/ (Total: ${b1Copied + b2Copied}/80)\n`);
}

function convertDraftExam(raw, level, testNum) {
  const slug = `osd-${level.toLowerCase()}-test-${pad2(testNum)}`;
  const meta = raw.examMetadata;
  const cleanMeta = {
    examId: meta.examId || slug,
    slug,
    title: meta.title,
    cefrLevel: level,
    providerFormat: meta.providerFormat || 'ÖSD',
    disclaimer: meta.disclaimer,
    totalDurationMinutes: meta.totalDurationMinutes,
    passPercentage: meta.passPercentage,
    scoringPolicy: {
      lesenMaxPoints: meta.scoringPolicy.lesenMaxPoints,
      hoerenMaxPoints: meta.scoringPolicy.hoerenMaxPoints,
      minPassingScorePerSkill: meta.scoringPolicy.minPassingScorePerSkill,
    },
  };

  const flattenedSections = [];
  for (const sec of raw.sections) {
    const parts = Array.isArray(sec.parts) && sec.parts.length > 0 ? sec.parts : null;
    if (!parts) continue;

    const perPartDuration = Math.max(1, Math.round((sec.durationMinutes || 40) / parts.length));

    for (const partObj of parts) {
      const partNum = Number(partObj.part);
      const questions = (partObj.questions || []).map((q) => sanitizeQuestion(q, partNum));
      const sectionId = `${sec.sectionId}_p${partNum}`;

      if (sec.skill === 'Lesen') {
        const stim = partObj.stimulus || {};
        flattenedSections.push({
          sectionId,
          skill: 'Lesen',
          title: partObj.title || `Teil ${partNum}`,
          durationMinutes: partObj.durationMinutes || perPartDuration,
          totalQuestions: questions.length,
          stimulus: {
            type: 'text',
            title: stim.title || partObj.title || `Teil ${partNum}`,
            content: stim.content || 'Ngữ liệu đang được cập nhật.',
          },
          questions,
        });
      } else if (sec.skill === 'Hoeren') {
        const stim = partObj.stimulus || {};
        const audioUrl =
          level === 'B1'
            ? `/audio/osd-b1/test-${pad2(testNum)}-teil-${partNum}.mp3`
            : `/audio/osd-b2/test-${pad2(testNum)}-aufgabe-${Math.min(2, Math.max(1, partNum))}.mp3`;
        const playCount =
          level === 'B1'
            ? B1_PLAY_COUNTS[partNum - 1] ?? 2
            : B2_PLAY_COUNTS[partNum - 1] ?? 2;

        const transcript = parseTranscriptTurns(stim.content, `Teil ${partNum}`);
        const audioStimulus = {
          type: 'audio',
          title: stim.title || partObj.title || `Teil ${partNum}`,
          audioUrl,
          annotations: { playCount },
        };
        if (stim.content) audioStimulus.content = stim.content;
        if (transcript) audioStimulus.dialogueTranscript = transcript;

        flattenedSections.push({
          sectionId,
          skill: 'Hoeren',
          title: partObj.title || `Teil ${partNum}`,
          durationMinutes: partObj.durationMinutes || perPartDuration,
          totalQuestions: questions.length,
          stimulus: audioStimulus,
          questions,
        });
      }
    }
  }

  const questionById = new Map(
    flattenedSections.flatMap((s) => s.questions).map((q) => [q.id, q])
  );

  return {
    examMetadata: cleanMeta,
    sections: flattenedSections,
    serverGradingKeys: (raw.serverGradingKeys || []).map((k) => sanitizeGradingKey(k, questionById)),
  };
}

async function publishDrafts() {
  const draftFiles = (await fs.readdir(draftsDir)).filter((f) => f.endsWith('.json')).sort();
  let published = 0;

  for (const fileName of draftFiles) {
    const match = fileName.match(/^osd-(b1|b2)-test-(\d+)\.json$/i);
    if (!match) continue;
    const level = match[1].toUpperCase();
    const testNum = parseInt(match[2], 10);
    const raw = JSON.parse(await fs.readFile(path.join(draftsDir, fileName), 'utf8'));
    const normalized = convertDraftExam(raw, level, testNum);
    const destPath = path.join(examsDir, fileName);
    await fs.writeFile(destPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
    published++;
  }

  console.log(`[DRAFTS] Normalized & published ${published} exams from _drafts/ into content/exams/`);
}

async function syncExistingExamsAudio() {
  const existingSpecs = [
    { file: 'b1-osd-mock-01.json', level: 'B1', testNum: 1 },
    { file: 'osd-b1-test-02.json', level: 'B1', testNum: 2 },
    { file: 'osd-b1-test-03.json', level: 'B1', testNum: 3 },
    { file: 'osd-b1-test-04.json', level: 'B1', testNum: 4 },
    { file: 'b2-osd-mock-01.json', level: 'B2', testNum: 1 },
    { file: 'osd-b2-test-02.json', level: 'B2', testNum: 2 },
    { file: 'osd-b2-test-03.json', level: 'B2', testNum: 3 },
    { file: 'osd-b2-test-04.json', level: 'B2', testNum: 4 },
  ];

  for (const spec of existingSpecs) {
    const filePath = path.join(examsDir, spec.file);
    const exam = JSON.parse(await fs.readFile(filePath, 'utf8'));

    // Keep all Lesen sections completely untouched so contract tests stay 100% compatible
    const lesenSections = exam.sections.filter((s) => s.skill !== 'Hoeren');
    const hoerenSections = exam.sections.filter((s) => s.skill === 'Hoeren');

    let updatedHoeren = [];

    if (spec.level === 'B1') {
      if (hoerenSections.length >= 4) {
        // Already split into 4 Teile (e.g. b1-osd-mock-01.json)
        updatedHoeren = hoerenSections.map((sec, idx) => {
          const partNum = sec.questions?.[0]?.part ?? idx + 1;
          const playCount = B1_PLAY_COUNTS[partNum - 1] ?? 2;
          return {
            ...sec,
            stimulus: {
              ...(sec.stimulus || {}),
              type: 'audio',
              title: sec.stimulus?.title || sec.title,
              audioUrl: `/audio/osd-b1/test-${pad2(spec.testNum)}-teil-${partNum}.mp3`,
              annotations: {
                ...(sec.stimulus?.annotations || {}),
                playCount,
              },
            },
          };
        });
      } else {
        // Split combined B1 Hoeren section into 4 per-Teil sections with dedicated audioUrl & playCount
        const combined = hoerenSections[0];
        const parts = [...new Set((combined?.questions || []).map((q) => q.part))].sort((a, b) => a - b);
        const dur = Math.max(5, Math.round((combined?.durationMinutes || 40) / Math.max(1, parts.length)));
        updatedHoeren = parts.map((partNum) => {
          const qs = combined.questions.filter((q) => q.part === partNum);
          const playCount = B1_PLAY_COUNTS[partNum - 1] ?? 2;
          return {
            sectionId: `${combined.sectionId}_teil_${partNum}`,
            skill: 'Hoeren',
            title: B1_HOEREN_TITLES[partNum] || `Teil ${partNum}: Hörverstehen B1`,
            durationMinutes: dur,
            totalQuestions: qs.length,
            stimulus: {
              type: 'audio',
              title: B1_HOEREN_TITLES[partNum]?.split(':').slice(1).join(':').trim() || `Hören · Teil ${partNum}`,
              audioUrl: `/audio/osd-b1/test-${pad2(spec.testNum)}-teil-${partNum}.mp3`,
              annotations: { playCount },
            },
            questions: qs,
          };
        });
      }
    } else {
      // B2 exams (test-01..04): split/map Hoeren into Aufgabe 1 & Aufgabe 2 pointing to /audio/osd-b2/
      const allHoerenQs = hoerenSections.flatMap((s) => s.questions || []);
      const baseSec = hoerenSections[0];
      const existingTranscript = baseSec?.stimulus?.dialogueTranscript;
      const existingTitle = baseSec?.stimulus?.title;

      // Map parts cleanly into Aufgabe 1 (part 1) and Aufgabe 2 (part >= 2)
      const qAufgabe1 = allHoerenQs.filter((q) => q.part === 1);
      const qAufgabe2 = allHoerenQs.filter((q) => q.part >= 2).map((q) => ({ ...q, part: 2 }));

      const groups = [
        { aufgabe: 1, questions: qAufgabe1 },
        { aufgabe: 2, questions: qAufgabe2 },
      ].filter((g) => g.questions.length > 0);

      const dur = Math.max(10, Math.round((baseSec?.durationMinutes || 40) / Math.max(1, groups.length)));

      updatedHoeren = groups.map((g, idx) => {
        const playCount = B2_PLAY_COUNTS[g.aufgabe - 1] ?? 2;
        const stimulus = {
          type: 'audio',
          title: idx === 0 && existingTitle ? existingTitle : B2_HOEREN_TITLES[g.aufgabe],
          audioUrl: `/audio/osd-b2/test-${pad2(spec.testNum)}-aufgabe-${g.aufgabe}.mp3`,
          annotations: { playCount },
        };
        if (idx === 0 && existingTranscript) {
          stimulus.dialogueTranscript = existingTranscript;
        }
        return {
          sectionId: groups.length === 1 ? baseSec.sectionId : `${baseSec.sectionId}_aufgabe_${g.aufgabe}`,
          skill: 'Hoeren',
          title: idx === 0 && existingTitle ? `Aufgabe 1: ${existingTitle}` : B2_HOEREN_TITLES[g.aufgabe],
          durationMinutes: dur,
          totalQuestions: g.questions.length,
          stimulus,
          questions: g.questions,
        };
      });
    }

    exam.sections = [...lesenSections, ...updatedHoeren];
    await fs.writeFile(filePath, `${JSON.stringify(exam, null, 2)}\n`, 'utf8');
  }

  console.log(`[EXISTING EXAMS] Updated audioUrl & playCount on 8 existing B1/B2 exam JSONs`);
}

async function auditAllExams() {
  const files = (await fs.readdir(examsDir)).filter((f) => f.endsWith('.json')).sort();
  const seenSlugs = new Set();
  const seenQuestionIds = new Set();
  const errors = [];
  const rows = [];

  for (const fileName of files) {
    const filePath = path.join(examsDir, fileName);
    const exam = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const meta = exam.examMetadata;

    if (seenSlugs.has(meta.slug)) {
      errors.push(`[DUPLICATE SLUG] ${meta.slug} in ${fileName}`);
    }
    seenSlugs.add(meta.slug);

    const lesenSections = exam.sections.filter((s) => s.skill === 'Lesen');
    const hoerenSections = exam.sections.filter((s) => s.skill === 'Hoeren');
    const lesenQs = lesenSections.flatMap((s) => s.questions || []);
    const hoerenQs = hoerenSections.flatMap((s) => s.questions || []);

    for (const q of [...lesenQs, ...hoerenQs]) {
      if (seenQuestionIds.has(q.id)) {
        errors.push(`[DUPLICATE QID] ${q.id} in ${fileName}`);
      }
      seenQuestionIds.add(q.id);
    }

    // Check stimuli
    for (const s of lesenSections) {
      if (!s.stimulus || !s.stimulus.content) {
        errors.push(`[MISSING LESEN STIMULUS] ${fileName} -> ${s.sectionId}`);
      }
    }

    let audioOkCount = 0;
    let audioTotalCount = 0;
    for (const s of hoerenSections) {
      audioTotalCount++;
      const url = s.stimulus?.audioUrl;
      if (!url) {
        errors.push(`[MISSING AUDIO URL] ${fileName} -> ${s.sectionId}`);
        continue;
      }
      const diskPath = path.join(root, 'apps', 'web', 'public', url.replace(/^\//, ''));
      try {
        const st = await fs.stat(diskPath);
        if (st.size > 0) audioOkCount++;
        else errors.push(`[EMPTY AUDIO FILE] ${diskPath}`);
      } catch {
        errors.push(`[MISSING AUDIO FILE] ${url} referenced in ${fileName}`);
      }
    }

    // Check scoring policy vs grading keys
    const keyMap = new Map((exam.serverGradingKeys || []).map((k) => [k.questionId, k]));
    const lesenPts = lesenQs.reduce((sum, q) => sum + (keyMap.get(q.id)?.points ?? 0), 0);
    const hoerenPts = hoerenQs.reduce((sum, q) => sum + (keyMap.get(q.id)?.points ?? 0), 0);
    if (Math.abs(lesenPts - meta.scoringPolicy.lesenMaxPoints) > 0.01) {
      errors.push(`[POINTS MISMATCH LESEN] ${fileName}: ${lesenPts} !== ${meta.scoringPolicy.lesenMaxPoints}`);
    }
    if (Math.abs(hoerenPts - meta.scoringPolicy.hoerenMaxPoints) > 0.01) {
      errors.push(`[POINTS MISMATCH HOEREN] ${fileName}: ${hoerenPts} !== ${meta.scoringPolicy.hoerenMaxPoints}`);
    }

    rows.push({
      file: fileName,
      slug: meta.slug,
      level: meta.cefrLevel,
      lesen: `${lesenSections.length}s/${lesenQs.length}q`,
      hoeren: `${hoerenSections.length}s/${hoerenQs.length}q`,
      audio: `${audioOkCount}/${audioTotalCount} OK`,
      points: `L:${lesenPts}/${meta.scoringPolicy.lesenMaxPoints} H:${hoerenPts}/${meta.scoringPolicy.hoerenMaxPoints}`,
    });
  }

  const b1Count = rows.filter((r) => r.level === 'B1').length;
  const b2Count = rows.filter((r) => r.level === 'B2').length;

  console.log('\n================= EXAM & AUDIO INTEGRITY AUDIT REPORT =================');
  console.log(`Total Exams: ${rows.length} (B1: ${b1Count}, B2: ${b2Count}) | Unique Questions: ${seenQuestionIds.size}`);
  console.table(rows);

  if (errors.length > 0) {
    console.error('\n[AUDIT FAILED] Errors found:');
    for (const err of errors) console.error('  -', err);
    process.exit(1);
  }
  console.log('\n[AUDIT PASSED] 100% exams valid, 0 duplicate slugs/IDs, 100% MP3 references verified > 0 bytes!\n');
}

async function main() {
  await syncAudioFiles();
  await publishDrafts();
  await syncExistingExamsAudio();
  await auditAllExams();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
