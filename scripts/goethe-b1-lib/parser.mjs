import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { patchMdByPart } from './md-patches.mjs';

export function resolvePdftotext() {
  if (process.env.PDFTOTEXT_PATH && fs.existsSync(process.env.PDFTOTEXT_PATH)) {
    return process.env.PDFTOTEXT_PATH;
  }
  const winDefault = 'C:\\Program Files\\Git\\ucrt64\\bin\\pdftotext.exe';
  if (fs.existsSync(winDefault)) return winDefault;
  return 'pdftotext';
}

export function resolveFfmpeg() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  const winDefault = 'C:\\Program Files (x86)\\FormatFactory\\ffmpeg.exe';
  if (fs.existsSync(winDefault)) return winDefault;
  return 'ffmpeg';
}

export function extractPdfTextSimple2(pdfPath) {
  const pdftotext = resolvePdftotext();
  const tmpFile = path.join(
    os.tmpdir(),
    `shd-goethe-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`
  );
  try {
    execFileSync(pdftotext, ['-enc', 'UTF-8', '-simple2', pdfPath, tmpFile], { stdio: 'pipe' });
    return fs.readFileSync(tmpFile, 'utf8');
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
}

export function cleanPdfSimple2(raw, kind) {
  let text = raw.replace(/\u00a0/g, ' ').replace(/\f/g, '\n');
  const coverEnd = text.search(/Nicht vom Goethe-Institut herausgegeben/i);
  if (coverEnd !== -1) text = text.slice(coverEnd);

  const startMatch = text.match(
    new RegExp(`(?:\\bB1,\\s*${kind}\\b|Übung im Goethe-Prüfungsformat|\\b${kind}\\s*:?\\s*Teil\\s+1\\b)`, 'i')
  );
  if (startMatch) text = text.slice(startMatch.index);

  const abMatch = text.search(/^\s*Antwortbogen\s*$/im);
  if (abMatch !== -1) text = text.slice(0, abMatch);

  return text
    .split(/\r?\n/)
    .map((l) =>
      l
        .replace(/FAUST ACADEMY\s+(?:[0-9a-f]{6,}|B\d\s+(?:LESEN|HÖREN)(?:FLÄT)?)/gi, '')
        .replace(/\bFaust\s+Fertig\?\s*Scan this code:.*$/gi, '')
        .replace(/\bFaust\s+(?:Mark your answers instantly|Fertig\?)\b/gi, '')
        .replace(/\bMark your answers instantly\b/gi, '')
        .replace(/\bÜBUNGSSATZ\s+\d+\s+KANDIDATENB\S*/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter((l) => {
      if (!l) return false;
      if (/^Faust$/i.test(l)) return false;
      if (/^Nicht vom Goethe-Institut/i.test(l)) return false;
      if (/^Faust Academy,\s*Goethe-Zertifikat/i.test(l)) return false;
      if (/^faustacademy\.com\/\S+(?:\s+\d+)?$/i.test(l)) return false;
      if (/^ÜBUNGSSATZ\s+\d+(?:\s+\S+)?$/i.test(l)) return false;
      if (/^(?:LESEN|HÖREN|KANDIDATENB\S*)(?:\s+(?:HÖREN|LESEN|KANDIDATENB\S*))*$/i.test(l)) return false;
      if (/^B1,\s*(?:Lesen|Hören)$/i.test(l)) return false;
      if (/^Übung im Goethe-Prüfungsformat/i.test(l)) return false;
      if (/^Arbeitszeit:\s*\d+\s*Minuten$/i.test(l)) return false;
      if (/^Nach dem Hören haben Sie 5 Minuten Zeit/i.test(l)) return false;
      return true;
    })
    .join('\n');
}

export function splitSections(text, partNums, kind) {
  const normalized = text.replace(
    new RegExp(`(?:^|\\n)\\s*(?:${kind}\\s*:?\\s*)?Teil\\s+(${partNums.join('|')})(?=\\s|\\n|:|$)`, 'gi'),
    (m, num, offset) => {
      const after = text.slice(offset + m.length, offset + m.length + 25);
      if (/^[ \t]*(?:und|bis|des|im|der)\b/i.test(after)) return m;
      return `\n<<<PART_${num}>>>\n`;
    }
  );
  const parts = {};
  for (const p of partNums) {
    const marker = `<<<PART_${p}>>>`;
    const idx = normalized.indexOf(marker);
    if (idx === -1) throw new Error(`Missing ${kind} Teil ${p}`);
    const rest = normalized.slice(idx + marker.length);
    const nextIdx = partNums
      .filter((x) => x > p)
      .map((x) => rest.indexOf(`<<<PART_${x}>>>`))
      .filter((i) => i !== -1)
      .sort((a, b) => a - b)[0];
    parts[p] = (nextIdx !== undefined ? rest.slice(0, nextIdx) : rest).trim();
  }
  return parts;
}

function splitBySequentialNumbers(chunk, numbers) {
  let cursor = 0;
  const positions = [];
  for (const num of numbers) {
    const re = new RegExp(
      `(?:^|[\\s.])${num}\\.\\s+(?!(?:September|Oktober|November|Dezember|Januar|Februar|März|April|Mai|Juni|Juli|August|Uhr|Jahr|Jahre|Mal|Platz|Stock|Tag|Klasse|Preis|Prozent)\\b)`,
      'g'
    );
    re.lastIndex = cursor;
    const found = re.exec(chunk);
    if (!found) throw new Error(`Could not locate question ${num}`);
    const lead = chunk[found.index] === '.' || /\s/.test(chunk[found.index]) ? 1 : 0;
    positions.push({ num, start: found.index + lead, contentStart: found.index + found[0].length });
    cursor = found.index + found[0].length;
  }
  const items = [];
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].contentStart;
    const end = i + 1 < positions.length ? positions[i + 1].start : chunk.length;
    items.push({ num: positions[i].num, raw: chunk.slice(start, end).trim() });
  }
  return { prefix: chunk.slice(0, positions[0]?.start ?? chunk.length).trim(), items };
}

function parseMcq(raw, stopAtNewlineAfterC = false) {
  let cleaned = raw
    .replace(/\bHörtext\s+\d+\s*,?\s*Aufgaben\s+\d+\s+bis\s+\d+/gi, ' ')
    .replace(/\bLösung\s*:.*$/gim, ' ');
  if (!stopAtNewlineAfterC) cleaned = cleaned.replace(/\s+/g, ' ').trim();

  let markers = [];
  for (const id of ['a', 'b', 'c']) {
    const reParen = new RegExp(`(?:^|\\s)${id}\\)\\s+`, 'g');
    const m = reParen.exec(cleaned);
    if (m) markers.push({ id: id.toUpperCase(), idx: m.index, textStart: m.index + m[0].length });
  }
  if (markers.length !== 3) {
    markers = [];
    const minPos = Math.max(0, cleaned.search(/[?…]|\.\.\.|:\s*(?=[abc]\s)/));
    for (const id of ['a', 'b', 'c']) {
      const reBare = new RegExp(`(?:^|\\s)${id}\\s+(?=[A-ZÄÖÜ„]|[a-zäöüß]{2,})`, 'g');
      reBare.lastIndex = minPos;
      const m = reBare.exec(cleaned);
      if (m) markers.push({ id: id.toUpperCase(), idx: m.index, textStart: m.index + m[0].length });
    }
  }
  if (markers.length !== 3) {
    throw new Error(`Found ${markers.length}/3 options in: ${cleaned.slice(0, 160)}`);
  }
  markers.sort((x, y) => x.idx - y.idx);
  const prompt = cleaned
    .slice(0, markers[0].idx)
    .replace(/\s+(?:Richtig|Falsch)\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const byId = {};
  let tail = '';
  for (let i = 0; i < markers.length; i++) {
    const end = i + 1 < markers.length ? markers[i + 1].idx : cleaned.length;
    let optRaw = cleaned.slice(markers[i].textStart, end);
    if (stopAtNewlineAfterC && i === 2) {
      const nlIdx = optRaw.indexOf('\n');
      if (nlIdx !== -1) {
        tail = optRaw.slice(nlIdx + 1).trim();
        optRaw = optRaw.slice(0, nlIdx);
      }
    }
    byId[markers[i].id] = optRaw
      .replace(/\s+(?:Richtig|Falsch)(?:\s+(?:Richtig|Falsch))*\s*$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return {
    prompt,
    options: ['A', 'B', 'C'].map((id) => ({ id, text: byId[id] })),
    tail,
  };
}

export function parseLesenPdf(pdfPath) {
  const clean = cleanPdfSimple2(extractPdfTextSimple2(pdfPath), 'Lesen');
  const sec = splitSections(clean, [1, 2, 3, 4, 5], 'Lesen');

  // Part 1: Blog / E-Mail
  const p1Raw = sec[1];
  let p1PrefixRaw = p1Raw;
  let p1QsStart = p1Raw;
  const p1Q1Idx = p1Raw.search(/(?:^|\n)\s*1\.\s+/);
  const p1ExIdx = p1Raw.search(/^\s*Beispiel\s*$/im);
  if (p1ExIdx !== -1 && (p1Q1Idx === -1 || p1ExIdx < p1Q1Idx)) {
    p1PrefixRaw = p1Raw.slice(0, p1ExIdx);
    p1QsStart = p1Raw.slice(p1ExIdx);
  } else if (p1Q1Idx !== -1) {
    p1PrefixRaw = p1Raw.slice(0, p1Q1Idx);
    p1QsStart = p1Raw.slice(p1Q1Idx);
  }
  const cleanIntroPrefix = (block) => {
    let txt = block;
    // Strip embedded Beispiel 0 header before blog/rules body if present
    const exSolMatch = txt.match(/\bLösung\s*:\s*(?:Richtig|Falsch|Ja|Nein|[abc])\b[\s\S]*?(?=\n(?:[A-ZÄÖÜ][a-zäöüß-]+(?:'s|s)?\s+(?:\S+\s+){0,5}blog|E-Mail|Hausordnung|Willkommen|[A-ZÄÖÜ][\wäöüß -]{2,35}(?:blog|E-Mail)|\S+\s+Hausordnung)|$)/i);
    if (exSolMatch && /Beispiel\s*0\b/i.test(txt.slice(0, exSolMatch.index + exSolMatch[0].length))) {
      const afterEx = txt.slice(exSolMatch.index + exSolMatch[0].length).trim();
      if (afterEx.length > 100) txt = afterEx;
    }
    return txt
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => {
        if (!l) return false;
        if (/^(?:vorgeschlagene\s+)?Arbeitszeit:\s*\d+\s*Minuten\.?$/i.test(l)) return false;
        if (/^(?:Minuten\.|Lösung\.|falsch\?)$/i.test(l)) return false;
        if (/^(?:Lesen Sie (?:den|die)\b|Entscheiden Sie\b|Wählen Sie\b|Beachten Sie\b)/i.test(l)) return false;
        if (/^(?:Richtig\s+Falsch|Ja\s+Nein)$/i.test(l)) return false;
        if (/^Beispiel\s*0\b/i.test(l)) return false;
        return true;
      });
  };
  const unwrapLines = (lines) => {
    const out = [];
    for (const line of lines) {
      if (out.length === 0) {
        out.push(line);
        continue;
      }
      const prev = out[out.length - 1];
      const looksLikeHeading =
        prev.length < 48 &&
        !/[.!?]$/.test(prev) &&
        !/^(?:deshalb|weil|denn|dass|und|aber|oder|als|wenn|nachdem)\b/i.test(line);
      if (looksLikeHeading || /^(?:TEXT\s+\d+|Anzeige\s+[A-J]|Liebe\s+|Eure\s+|Hallo\s+)/.test(line) || /^(?:Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag)\b/i.test(prev)) {
        out.push(line);
      } else if (!/[.!?]$/.test(prev) && prev.length >= 45 && !/^[A-ZÄÖÜ][^.!?]{0,35}$/.test(prev)) {
        out[out.length - 1] = `${prev} ${line}`;
      } else {
        out.push(line);
      }
    }
    return out;
  };
  const p1BodyLines = unwrapLines(cleanIntroPrefix(p1PrefixRaw));
  const p1Qs = splitBySequentialNumbers(p1QsStart, [1, 2, 3, 4, 5, 6]).items.map(
    (it) => ({
      order: it.num,
      part: 1,
      questionType: 'binary',
      prompt: it.raw.replace(/\s+(?:Richtig|Falsch)\b/g, '').replace(/\s+/g, ' ').trim(),
      options: [
        { id: 'R', text: 'Richtig' },
        { id: 'F', text: 'Falsch' },
      ],
    })
  );

  // Part 2: Two press texts
  const p2Raw = sec[2];
  const p2BeforeQ7 = p2Raw.slice(0, Math.max(0, p2Raw.search(/\b7\.\s/)));
  const p2ExMatches = [...p2BeforeQ7.matchAll(/Lösung\s*:\s*[abc]\b/gi)];
  const p2LastEx = p2ExMatches[p2ExMatches.length - 1];
  const p2Body = p2LastEx ? p2Raw.slice(p2LastEx.index + p2LastEx[0].length).trim() : p2Raw;
  const p2Split = splitBySequentialNumbers(p2Body, [7, 8, 9, 10, 11, 12]);
  const text1 = unwrapLines(p2Split.prefix.trim().split('\n')).join('\n\n');
  const q7 = parseMcq(p2Split.items[0].raw);
  const q8 = parseMcq(p2Split.items[1].raw);
  const q9 = parseMcq(p2Split.items[2].raw, true);
  const text2 = unwrapLines((q9.tail || '').trim().split('\n')).join('\n\n');
  const q10 = parseMcq(p2Split.items[3].raw);
  const q11 = parseMcq(p2Split.items[4].raw);
  const q12 = parseMcq(p2Split.items[5].raw);

  // Part 3: Anzeigen A-J + 0
  const p3Raw = sec[3];
  const p3ExIdx = p3Raw.search(/^\s*Beispiel\s*$/im);
  const p3AdsLinesAll = (p3ExIdx !== -1 ? p3Raw.slice(0, p3ExIdx) : p3Raw).split('\n');
  const firstAdIdx = p3AdsLinesAll.findIndex((l) => /^Anzeige\s+A\b/i.test(l));
  const p3AdsLines = firstAdIdx !== -1 ? p3AdsLinesAll.slice(firstAdIdx) : p3AdsLinesAll.filter((l) => !/^(?:Arbeitszeit:|Lesen Sie die Situationen)/i.test(l));
  const p3Ads = unwrapLines(
    p3AdsLines
      .join('\n')
      .replace(/(?=Anzeige\s+[A-J]\b|[A-J]\)\s)/g, '\n')
      .replace(/^\n+/, '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
  )
    .join('\n')
    .replace(/(?=^(?:Anzeige\s+[A-J]\b|[A-J]\)\s))/gm, '\n')
    .replace(/^\n+/, '')
    .replace(/\n{2,}/g, '\n\n');
  const p3Opts = [
    ...['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((id) => ({
      id,
      text: `Anzeige ${id.toUpperCase()}`,
    })),
    { id: '0', text: 'Keine passende Anzeige (0)' },
  ];
  const p3Qs = splitBySequentialNumbers(p3ExIdx !== -1 ? p3Raw.slice(p3ExIdx) : p3Raw, [13, 14, 15, 16, 17, 18, 19]).items.map(
    (it) => ({
      order: it.num,
      part: 3,
      questionType: 'matching',
      prompt: `Situation ${it.num}: ` + it.raw.replace(/\s*Lösung\s*:\s*[_\-—.]*\s*$/i, '').replace(/\s+/g, ' ').trim(),
      options: p3Opts,
    })
  );

  // Part 4: Leserbriefe 20-26
  const p4Raw = sec[4];
  const p4ExIdx = p4Raw.search(/^\s*Beispiel\s*$/im);
  const p4Intro = (p4ExIdx !== -1 ? p4Raw.slice(0, p4ExIdx) : '')
    .split('\n')
    .filter((l) => !/^(?:vorgeschlagene\s+)?Arbeitszeit:/i.test(l))
    .join(' ')
    .replace(/^\s*vorgeschlagene Arbeitszeit:\s*\d+\s*Minuten\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  const p4StemMatch = p4Intro.match(/([^.!?]+\?\s*)$/);
  const p4Stem = p4StemMatch ? p4StemMatch[1].trim() : 'Ist die Person dafür?';
  const p4BeforeQ20 = p4Raw.slice(0, Math.max(0, p4Raw.search(/\b20(?:[.:]\s|\s+[A-ZÄÖÜ])/)));
  const p4ExMatches = [...p4BeforeQ20.matchAll(/Lösung\s*:\s*(?:Ja|Nein)\b[\s\S]*?(?=\n|$)/gi)];
  const p4LastEx = p4ExMatches[p4ExMatches.length - 1];
  const p4Rest = (p4LastEx ? p4Raw.slice(p4LastEx.index + p4LastEx[0].length) : p4Raw)
    .replace(/^\s*(?:Ja|Nein)(?:\s+(?:Ja|Nein))?\s*$/gim, '')
    .replace(/\b(?:Ja|Nein)\s+(?:Ja|Nein)\s+/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim();

  const hasColonMarkers = /(?:^|\n)20:\s+/.test(p4Rest) && /(?:^|\n)26:\s+/.test(p4Rest);
  const hasBareMarkers = !hasColonMarkers && /(?:^|\n)20\s+[A-ZÄÖÜ]/.test(p4Rest) && /(?:^|\n)26\s+[A-ZÄÖÜ]/.test(p4Rest);

  const p4Entries = [];
  if (hasColonMarkers || hasBareMarkers) {
    const markerSource = hasColonMarkers ? p4Rest : p4Rest.replace(/(?:^|\n)(2[0-6])\s+(?=[A-ZÄÖÜ])/g, '\n$1: ');
    const splitColon = splitBySequentialNumbers(markerSource.replace(/(?:^|\n)(2[0-6]):\s+/g, '\n$1. '), [20, 21, 22, 23, 24, 25, 26]);
    for (let idx = 0; idx < 7; idx++) {
      const order = 20 + idx;
      const itemRaw = splitColon.items[idx].raw;
      const firstToken = itemRaw.match(/^([A-ZÄÖÜ][a-zäöüß-]+)\b/)?.[1] ?? `Person ${order}`;
      let body = itemRaw.slice(firstToken.length).trim();
      // Remove duplicate bottom label like "\n20. Clara" or trailing question text
      body = body.replace(new RegExp(`\\n?${order}\\.\\s+${firstToken}[\\s\\S]*$`, 'i'), '').trim();
      p4Entries.push({ order, name: firstToken, comment: body.replace(/\s+/g, ' ').trim() });
    }
  } else {
    const p4Split = splitBySequentialNumbers(p4Rest, [20, 21, 22, 23, 24, 25, 26]);
    for (let idx = 0; idx < 7; idx++) {
      const order = 20 + idx;
      const name = p4Split.items[idx].raw.split('\n')[0].replace(/\s+(?:Ja|Nein)\b.*$/i, '').trim();
      const block = idx === 0 ? p4Split.prefix : p4Split.items[idx - 1].raw.split('\n').slice(1).join('\n').trim();
      const cleanedBlock = block.replace(/^(?:(?:Ja|Nein)\s+)+/i, '').trim();
      const bLines = cleanedBlock.split('\n');
      if (bLines[0] && bLines[0].trim().startsWith(name)) {
        const restFirst = bLines[0].trim().slice(name.length).trim();
        if (restFirst) bLines[0] = restFirst;
        else bLines.shift();
      }
      p4Entries.push({ order, name, comment: bLines.join(' ').replace(/\s+/g, ' ').trim() });
    }
  }

  // Part 5: Hausordnung / Regeln
  const p5Raw = sec[5];
  const p5Split = splitBySequentialNumbers(p5Raw, [27, 28, 29, 30]);
  let p5PrefixText = p5Split.prefix;
  const p5WahlMatch = p5PrefixText.match(/Wählen Sie[\s\S]{0,120}?(?:\.|c\.)\s*(?:Arbeitszeit:\s*\d+\s*Minuten\.)?\s*\n+/i);
  if (p5WahlMatch) {
    const afterInstr = p5PrefixText.slice(p5WahlMatch.index + p5WahlMatch[0].length).trim();
    if (afterInstr.length > 100) p5PrefixText = afterInstr;
  }
  const p5BodyLines = unwrapLines(
    p5PrefixText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !/^(?:vorgeschlagene\s+)?Arbeitszeit:\s*\d+\s*Minuten\.?$/i.test(l) && !/^(?:Lesen Sie|Sie (?:nehmen|haben|besuchen|möchten|übernachten)\b|möchten dort\b)/i.test(l))
  );
  const p5Qs = p5Split.items.map((it) => {
    const m = parseMcq(it.raw);
    return { order: it.num, part: 5, questionType: 'multiple_choice', prompt: m.prompt, options: m.options };
  });

  return {
    parts: [
      {
        part: 1,
        title: `Teil 1: ${p1BodyLines[0] ?? 'Blogbeitrag / E-Mail'}`,
        stimulusTitle: p1BodyLines[0] ?? 'Blogbeitrag',
        stimulusContent: p1BodyLines.join('\n\n'),
        durationMinutes: 10,
        questions: p1Qs,
      },
      {
        part: 2,
        title: `Teil 2: Pressetexte (Aufgaben 7–12)`,
        stimulusTitle: 'Zwei Pressetexte (Aufgaben 7–12)',
        stimulusContent: `TEXT 1\n\n${text1}\n\nTEXT 2\n\n${text2}`,
        durationMinutes: 20,
        questions: [
          { order: 7, part: 2, questionType: 'multiple_choice', prompt: q7.prompt, options: q7.options },
          { order: 8, part: 2, questionType: 'multiple_choice', prompt: q8.prompt, options: q8.options },
          { order: 9, part: 2, questionType: 'multiple_choice', prompt: q9.prompt, options: q9.options },
          { order: 10, part: 2, questionType: 'multiple_choice', prompt: q10.prompt, options: q10.options },
          { order: 11, part: 2, questionType: 'multiple_choice', prompt: q11.prompt, options: q11.options },
          { order: 12, part: 2, questionType: 'multiple_choice', prompt: q12.prompt, options: q12.options },
        ],
      },
      {
        part: 3,
        title: 'Teil 3: Anzeigen zuordnen (A–J & 0)',
        stimulusTitle: 'Anzeigenübersicht (Anzeigen A–J)',
        stimulusContent: p3Ads,
        durationMinutes: 10,
        questions: p3Qs,
      },
      {
        part: 4,
        title: 'Teil 4: Leserbriefe (Ja/Nein Meinungen)',
        stimulusTitle: 'Leserbriefe (Aufgaben 20–26)',
        stimulusContent: `${p4Intro}\n\n` + p4Entries.map((e) => `Leserbrief ${e.order} (${e.name}):\n${e.comment}`).join('\n\n'),
        durationMinutes: 15,
        questions: p4Entries.map((e) => ({
          order: e.order,
          part: 4,
          questionType: 'binary',
          prompt: `${e.name}: ${p4Stem}`,
          options: [
            { id: 'Ja', text: 'Ja' },
            { id: 'Nein', text: 'Nein' },
          ],
        })),
      },
      {
        part: 5,
        title: `Teil 5: ${p5BodyLines[0] ?? 'Regeln / Hausordnung'}`,
        stimulusTitle: p5BodyLines[0] ?? 'Hausordnung / Hinweise',
        stimulusContent: p5BodyLines.join('\n\n'),
        durationMinutes: 10,
        questions: p5Qs,
      },
    ],
  };
}

export function parseHoerenPdf(pdfPath) {
  const clean = cleanPdfSimple2(extractPdfTextSimple2(pdfPath), 'Hören');
  const sec = splitSections(clean, [1, 2, 3, 4], 'Hören');

  // Part 1: Q1-10
  const h1Start = sec[1].search(/Hörtext\s+1\b/i);
  const h1Split = splitBySequentialNumbers(h1Start !== -1 ? sec[1].slice(h1Start) : sec[1], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const h1Qs = h1Split.items.map((it) => {
    const textIdx = Math.ceil(it.num / 2);
    if (it.num % 2 === 1) {
      return {
        order: it.num,
        part: 1,
        questionType: 'binary',
        prompt: `Text ${textIdx}: ` + it.raw.replace(/\bHörtext\s+\d+[\s\S]*$/i, '').replace(/\s+(?:Richtig|Falsch)\b/g, '').replace(/\s+/g, ' ').trim(),
        options: [
          { id: 'R', text: 'Richtig' },
          { id: 'F', text: 'Falsch' },
        ],
      };
    }
    const m = parseMcq(it.raw);
    return {
      order: it.num,
      part: 1,
      questionType: 'multiple_choice',
      prompt: `Text ${textIdx}: ${m.prompt}`,
      options: m.options,
    };
  });

  // Part 2: Q11-15
  const h2Split = splitBySequentialNumbers(sec[2], [11, 12, 13, 14, 15]);
  const h2Qs = h2Split.items.map((it) => {
    const m = parseMcq(it.raw);
    return { order: it.num, part: 2, questionType: 'multiple_choice', prompt: m.prompt, options: m.options };
  });

  // Part 3: Q16-22 + dialogue speaker detection
  const h3Split = splitBySequentialNumbers(sec[3], [16, 17, 18, 19, 20, 21, 22]);
  const h3Intro = h3Split.prefix.replace(/\s+/g, ' ').trim();
  const betweenMatch = h3Intro.match(/(?:zwischen|wie sich)\s+([^,\n]+?)\s+und\s+([^,\n]+?)(?:\s+über|\s+im|\s+auf|\.|,|$)/i);
  const dialogueNames = betweenMatch
    ? [betweenMatch[1].trim(), betweenMatch[2].trim()]
    : ['Sprecherin', 'Sprecher'];
  const h3Qs = h3Split.items.map((it) => ({
    order: it.num,
    part: 3,
    questionType: 'binary',
    prompt: it.raw.replace(/\s+(?:Richtig|Falsch)\b/g, '').replace(/\s+/g, ' ').trim(),
    options: [
      { id: 'R', text: 'Richtig' },
      { id: 'F', text: 'Falsch' },
    ],
  }));

  // Part 4: Q23-30 + speaker names from Beispiel
  const h4ExIdx = sec[4].search(/^\s*Beispiel\s*$/im);
  const h4Intro = (h4ExIdx !== -1 ? sec[4].slice(0, h4ExIdx) : '').replace(/\s+/g, ' ').trim();
  const h4ExBlock = sec[4]
    .slice(h4ExIdx !== -1 ? h4ExIdx : 0, sec[4].search(/\b23\.\s/))
    .replace(/\bLösung\s*:[^\n]*/gi, ' ')
    .replace(/\s+/g, ' ');
  const h4OptA = h4ExBlock.match(/\ba\)?\s+([\s\S]+?)(?=\s+\bb\)?\s)/);
  const h4OptB = h4ExBlock.match(/\bb\)?\s+([\s\S]+?)(?=\s+\bc\)?\s)/);
  const h4OptC = h4ExBlock.match(/\bc\)?\s+([\s\S]+?)$/);
  const h4Speakers = [
    { id: 'A', text: (h4OptA?.[1] ?? 'Moderator').replace(/^\s*der\s+/i, '').trim() },
    { id: 'B', text: (h4OptB?.[1] ?? 'Dana Schneider').trim() },
    { id: 'C', text: (h4OptC?.[1] ?? 'Florian Bader').trim() },
  ];
  const h4Split = splitBySequentialNumbers(sec[4].slice(h4ExIdx !== -1 ? h4ExIdx : 0), [23, 24, 25, 26, 27, 28, 29, 30]);
  const h4Qs = h4Split.items.map((it) => ({
    order: it.num,
    part: 4,
    questionType: 'multiple_choice',
    prompt: it.raw.replace(/\s+(?:a\)|a\s)[\s\S]*$/i, '').replace(/\s+/g, ' ').trim(),
    options: h4Speakers,
  }));

  return {
    parts: [
      { part: 1, title: 'Teil 1: Fünf kurze Texte (Richtig/Falsch & A/B/C)', stimulusTitle: 'Fünf kurze Alltagstexte', durationMinutes: 10, questions: h1Qs },
      { part: 2, title: `Teil 2: Informationstext / Führung`, stimulusTitle: h2Split.prefix.split('\n')[0] || 'Führung / Präsentation', introDe: h2Split.prefix.replace(/\s+/g, ' ').trim(), durationMinutes: 8, questions: h2Qs },
      { part: 3, title: 'Teil 3: Alltagsgespräch zweier Personen (Richtig/Falsch)', stimulusTitle: h3Intro.split('.')[0] || 'Alltagsgespräch', introDe: h3Intro, dialogueNames, durationMinutes: 8, questions: h3Qs },
      { part: 4, title: 'Teil 4: Radiodiskussion mit Moderator und zwei Gästen (Zuordnung)', stimulusTitle: h4Intro.split('.')[0] || 'Radiodiskussion', introDe: h4Intro, speakers: h4Speakers, durationMinutes: 14, questions: h4Qs },
    ],
  };
}

function parseTimestampSec(ts) {
  const parts = ts.trim().split(':').map(Number);
  return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
}

export function parseMdTranscript(mdPath, hoerenInfo, setNum = '') {
  const md = fs.readFileSync(mdPath, 'utf8');
  const rawBlocks = md.split(/(?=^#)/m).filter((b) => b.trim());
  const byPart = {};

  for (const block of rawBlocks) {
    const headingMatch = block.match(/^#\s*(?:\*\*)?TEIL\s+(\d)\b/i);
    if (!headingMatch) continue;
    let partNum = Number(headingMatch[1]);
    // Fix Test 05 quirk where block labeled # **TEIL 3** is actually Teil 2 ("Teil zwei. Sie nehmen an einer Führung...")
    if (partNum === 3 && /Teil\s+(?:zwei|2)\b[\s\S]{0,120}Aufgaben\s+11\s+bis\s+15/i.test(block.slice(0, 350))) {
      partNum = 2;
    }

    const turnChunks = block.split(/\n(?=\d+:\d+\s*-\s*\d+:\d+\s*\r?\n)/).slice(1);
    const turns = [];
    for (const chunk of turnChunks) {
      const m = chunk.match(/^(\d+:\d+)\s*-\s*(\d+:\d+)\s*\r?\n+(Speaker\s+\d+)\s*\r?\n+([\s\S]+)$/i);
      if (!m) continue;
      const timestampStart = parseTimestampSec(m[1]);
      const timestampEnd = Math.max(timestampStart, parseTimestampSec(m[2]));
      const rawSpeaker = m[3].replace(/\s+/g, ' ').trim();
      const textDe = m[4].replace(/\r?\n+/g, ' ').replace(/\s+/g, ' ').trim();
      turns.push({ timestampStart, timestampEnd, rawSpeaker, textDe });
    }
    byPart[partNum] = turns;
  }

  if (setNum) patchMdByPart(setNum, byPart);
  return normalizeMdSpeakers(byPart, hoerenInfo);
}

function normalizeMdSpeakers(byPart, hoerenInfo) {
  const result = {};

  // Part 1
  result[1] = (byPart[1] || []).map((t, idx) => {
    const isAnnouncer = t.rawSpeaker === 'Speaker 0' || /^Teil\s+(?:eins|1)\b|^Aufgaben\s+\d+/i.test(t.textDe);
    return {
      speakerId: isAnnouncer ? 'ANSAGE' : `SPR_${t.rawSpeaker.replace(/\D/g, '') || idx}`,
      roleSide: isAnnouncer ? 'Left' : idx % 2 === 1 ? 'Right' : 'Left',
      speakerName: isAnnouncer ? 'Prüfungsansage' : 'Hörtext / Sprecher',
      timestampStart: t.timestampStart,
      timestampEnd: t.timestampEnd,
      textDe: t.textDe,
    };
  });

  // Part 2
  const part2Raw = byPart[2] || [];
  const guideIntro = part2Raw.find((t) => t.rawSpeaker !== 'Speaker 0')?.textDe || '';
  const guideNameMatch = guideIntro.match(/\bIch\s+(?:bin|heiße)\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)?)/);
  const guideLabel = guideNameMatch ? `${guideNameMatch[1]} (Führung)` : 'Führungsperson';
  result[2] = part2Raw.map((t) => {
    const isAnnouncer = t.rawSpeaker === 'Speaker 0';
    return {
      speakerId: isAnnouncer ? 'ANSAGE' : 'GUIDE',
      roleSide: isAnnouncer ? 'Left' : 'Right',
      speakerName: isAnnouncer ? 'Prüfungsansage' : guideLabel,
      timestampStart: t.timestampStart,
      timestampEnd: t.timestampEnd,
      textDe: t.textDe,
    };
  });

  // Part 3
  const part3Raw = byPart[3] || [];
  let [name1, name2] = hoerenInfo.parts[2]?.dialogueNames ?? ['Sprecherin', 'Sprecher'];
  const dialogueTurns = part3Raw.filter((t) => t.rawSpeaker !== 'Speaker 0');
  const firstSpk = dialogueTurns[0]?.rawSpeaker;
  const secondSpk = dialogueTurns.find((t) => t.rawSpeaker !== firstSpk)?.rawSpeaker;
  if (/^(?:Sprecherin|eine\s+Frau|einer\s+Frau)$/i.test(name1) && dialogueTurns.length > 0) {
    // Infer participant names from Hören Teil 3 questions ("Mara hat...", "Jonas hat...") or vocatives
    const promptText = (hoerenInfo.parts[2]?.questions || []).map((q) => q.prompt).join(' ');
    const promptNames = [...promptText.matchAll(/\b([A-ZÄÖÜ][a-zäöüß]{2,})\b(?=\s+(?:holt|hat|war|ist|fand|kann|konnte|muss|musste|will|wollte|möchte|sucht|suchte|zieht|bleibt|spielt|meint|sagt))/g)]
      .map((m) => m[1])
      .filter((w) => !/^(?:Die|Der|Das|Ein|Eine|Nach|Seit|Vor|Beim|Während|Durch|Für|Auch|Viele|Mitarbeiterin|Mitarbeiter|Person|Sprecher|Sprecherin|Kette)$/i.test(w));
    const uniquePromptNames = [...new Set(promptNames)];
    if (uniquePromptNames.length >= 2) {
      name1 = uniquePromptNames[0];
      name2 = uniquePromptNames[1];
    } else {
      const allDialogueText = dialogueTurns.map((t) => t.textDe).join(' ');
      const foundNames = [];
      for (const dt of dialogueTurns) {
        const mStart = dt.textDe.match(/^([A-ZÄÖÜ][a-zäöüß]{2,}),\s/);
        if (mStart && !/^(?:Ja|Nein|Genau|Also|Stimmt|Klar|Danke|Bitte|Hallo|Guten|Na|Ach|Gut|Schön|Super|Okay|Sicher|Natürlich|Übrigens|Eigentlich|Trotzdem|Entschuldige|Verstehe)$/i.test(mStart[1])) {
          if (!foundNames.includes(mStart[1])) foundNames.push(mStart[1]);
        }
        const mDanke = dt.textDe.match(/\b(?:Danke|Hallo|Hi|Tschüss),\s+([A-ZÄÖÜ][a-zäöüß]{2,})\b/);
        if (mDanke && !foundNames.includes(mDanke[1])) foundNames.push(mDanke[1]);
      }
      if (foundNames.length >= 2) {
        name1 = foundNames[0];
        name2 = foundNames[1];
      } else if (/Leila|Leyla/i.test(allDialogueText) && /Tobias/i.test(allDialogueText)) {
        name1 = 'Leyla';
        name2 = 'Tobias';
      }
    }
  }
  const firstName1 = name1.split(/\s+/)[0];
  const firstName2 = name2.split(/\s+/)[0];
  if (/^Kette$/i.test(name1) || /^Kette$/i.test(name2)) {
    const promptAll = (hoerenInfo.parts[2]?.questions || []).map((q) => q.prompt).join(' ');
    const fixedNames = [...promptAll.matchAll(/\b([A-ZÄÖÜ][a-zäöüß]{2,})\b(?=\s+(?:holt|hat|war|ist|fand|kann|konnte|muss|will|möchte|sucht|zieht|bleibt|meint|sagt))/g)]
      .map((m) => m[1])
      .filter((w) => !/^(?:Die|Der|Das|Ein|Eine|Nach|Seit|Vor|Beim|Während|Durch|Für|Auch|Viele|Kette)$/i.test(w));
    const uniqueFixed = [...new Set(fixedNames)];
    if (uniqueFixed.length >= 2) {
      name1 = uniqueFixed[0];
      name2 = uniqueFixed[1];
    }
  }
  const resolvedFirst1 = name1.split(/\s+/)[0];
  const resolvedFirst2 = name2.split(/\s+/)[0];
  let firstIsName2 = false;
  if (dialogueTurns[0]) {
    const t0 = dialogueTurns[0].textDe;
    const alt1 = resolvedFirst1.replace(/y/g, 'i');
    if (resolvedFirst1 && (new RegExp(`(?:Hallo|Hi|Morgen|Entschuldige|Hey|Tag)[,!]?\\s+${resolvedFirst1}\\b|^${resolvedFirst1},`, 'i').test(t0) || new RegExp(`(?:Hallo|Hi|Morgen|Entschuldige|Hey|Tag)[,!]?\\s+${alt1}\\b|^${alt1},`, 'i').test(t0))) {
      firstIsName2 = true;
    } else if (resolvedFirst2 && new RegExp(`(?:Hallo|Hi|Morgen|Entschuldige|Hey|Tag)[,!]?\\s+${resolvedFirst2}\\b|^${resolvedFirst2},`, 'i').test(t0)) {
      firstIsName2 = false;
    }
  }
  const leftName = firstIsName2 ? name2 : name1;
  const rightName = firstIsName2 ? name1 : name2;
  result[3] = part3Raw.map((t) => {
    if (t.rawSpeaker === 'Speaker 0') {
      return { speakerId: 'ANSAGE', roleSide: 'Left', speakerName: 'Prüfungsansage', timestampStart: t.timestampStart, timestampEnd: t.timestampEnd, textDe: t.textDe };
    }
    const isFirst = t.rawSpeaker === firstSpk || (!secondSpk && t.rawSpeaker !== 'Speaker 0');
    return {
      speakerId: isFirst ? 'SPK_A' : 'SPK_B',
      roleSide: isFirst ? 'Left' : 'Right',
      speakerName: isFirst ? leftName : rightName,
      timestampStart: t.timestampStart,
      timestampEnd: t.timestampEnd,
      textDe: t.textDe,
    };
  });

  // Part 4
  const part4Raw = byPart[4] || [];
  const modLabel = hoerenInfo.parts[3]?.speakers?.[0]?.text || 'Moderator';
  const guest1Label = hoerenInfo.parts[3]?.speakers?.[1]?.text || 'Dana Schneider';
  const guest2Label = hoerenInfo.parts[3]?.speakers?.[2]?.text || 'Florian Bader';
  const modTurns = [];
  for (const t of part4Raw) {
    // Split accidentally merged Reading 1 outro + Reading 2 intro if both appear in one turn
    const splitMarker = t.textDe.search(/(?:Stadtgespräch\.|Abend\.|Ausgabe[^.]{0,30}\.|Gespräch\.|Zuhören\.)\s*(?=(?:Guten\s+(?:Abend|Tag|Morgen)|Willkommen|Herzlich willkommen|Welcoming)\b)/i);
    if (splitMarker !== -1) {
      const sentenceEnd = t.textDe.slice(splitMarker).search(/(?=[A-ZÄÖÜ])(?:Guten|Willkommen|Herzlich|Welcoming)/);
      const cutAt = splitMarker + (sentenceEnd !== -1 ? sentenceEnd : 0);
      const partA = t.textDe.slice(0, cutAt).trim();
      const partB = t.textDe.slice(cutAt).trim();
      if (partA && partB) {
        const midTs = Math.floor((t.timestampStart + t.timestampEnd) / 2);
        modTurns.push({ ...t, timestampEnd: midTs, textDe: partA });
        modTurns.push({ ...t, timestampStart: midTs + 1, textDe: partB });
        continue;
      }
    }
    modTurns.push(t);
  }

  // Identify rawSpeaker assignments dynamically without trusting Speaker 0 blindly mid-discussion!
  const isAnnouncerText = (txt) => /^(?:Teil\s+(?:vier|4)\b|Aufgaben\s+2[23]\b|Sie haben jetzt (?:fünf|5) Minuten)/i.test(txt);
  let modSpk = null;
  let danaSpk = null;
  let florianSpk = null;
  for (const t of modTurns) {
    if (isAnnouncerText(t.textDe) || t.forcedRole) continue;
    if (/^(?:Guten\s+(?:Abend|Tag)|Willkommen|Herzlich willkommen|Damit sind wir am Ende)/i.test(t.textDe)) {
      if (!modSpk) modSpk = t.rawSpeaker;
    }
  }
  if (!modSpk) {
    modSpk = modTurns.find((t) => !isAnnouncerText(t.textDe) && !t.forcedRole)?.rawSpeaker ?? 'Speaker 1';
  }

  for (let i = 0; i < modTurns.length - 1; i++) {
    const cur = modTurns[i];
    const next = modTurns[i + 1];
    if (isAnnouncerText(next.textDe) || next.forcedRole) continue;
    if (next.rawSpeaker === modSpk) continue;
    if (/Frau Schneider\b[^.?]*[.?]\s*$/i.test(cur.textDe) || /Frau Schneider,/i.test(cur.textDe.slice(-70))) {
      if (!danaSpk) danaSpk = next.rawSpeaker;
    } else if (/Herr Bader\b[^.?]*[.?]\s*$/i.test(cur.textDe) || /Herr Bader,/i.test(cur.textDe.slice(-70))) {
      if (!florianSpk) florianSpk = next.rawSpeaker;
    }
  }

  result[4] = modTurns.map((t, idx) => {
    const isExamAnnouncer =
      (idx <= 1 && isAnnouncerText(t.textDe)) ||
      /^Sie haben jetzt (?:fünf|5) Minuten Zeit/i.test(t.textDe) ||
      (idx === modTurns.length - 1 && /Antwortbogen/i.test(t.textDe));
    if (isExamAnnouncer) {
      return { speakerId: 'ANSAGE', roleSide: 'Left', speakerName: 'Prüfungsansage', timestampStart: t.timestampStart, timestampEnd: t.timestampEnd, textDe: t.textDe };
    }
    if (t.forcedRole === 'MOD') {
      return { speakerId: 'MOD', roleSide: 'Left', speakerName: modLabel, timestampStart: t.timestampStart, timestampEnd: t.timestampEnd, textDe: t.textDe };
    }
    if (t.forcedRole === 'GAST_1') {
      return { speakerId: 'GAST_1', roleSide: 'Right', speakerName: guest1Label, timestampStart: t.timestampStart, timestampEnd: t.timestampEnd, textDe: t.textDe };
    }
    if (t.forcedRole === 'GAST_2') {
      return { speakerId: 'GAST_2', roleSide: 'Right', speakerName: guest2Label, timestampStart: t.timestampStart, timestampEnd: t.timestampEnd, textDe: t.textDe };
    }
    const isModPhrase = /^(?:Guten\s+(?:Abend|Tag)|Willkommen|Herzlich willkommen|Damit sind wir am Ende|Damit endet unsere heutige Sendung|Damit sind wir bei Erfahrungen angekommen|Wir haben also verschiedene Wege gehört|Wir haben heute verschiedene persönliche Erfahrungen gehört|Unsere Zeit ist um|Vielen Dank(?:,)?\s*(?:Frau Schneider|Herr Bader|Ihnen beiden|für die Einblicke|für diese Einblicke|für Ihre Zeit)|Zum Zustand gehört auch die Frage[\s\S]{0,80}Herr Bader)/i.test(t.textDe);
    if (isModPhrase || t.rawSpeaker === modSpk) {
      return { speakerId: 'MOD', roleSide: 'Left', speakerName: modLabel, timestampStart: t.timestampStart, timestampEnd: t.timestampEnd, textDe: t.textDe };
    }
    if (t.rawSpeaker === danaSpk) {
      return { speakerId: 'GAST_1', roleSide: 'Right', speakerName: guest1Label, timestampStart: t.timestampStart, timestampEnd: t.timestampEnd, textDe: t.textDe };
    }
    if (t.rawSpeaker === florianSpk) {
      return { speakerId: 'GAST_2', roleSide: 'Right', speakerName: guest2Label, timestampStart: t.timestampStart, timestampEnd: t.timestampEnd, textDe: t.textDe };
    }
    // Any remaining distinct non-moderator speaker maps to the unassigned guest slot
    if (danaSpk && !florianSpk) {
      return { speakerId: 'GAST_2', roleSide: 'Right', speakerName: guest2Label, timestampStart: t.timestampStart, timestampEnd: t.timestampEnd, textDe: t.textDe };
    }
    if (florianSpk && !danaSpk) {
      return { speakerId: 'GAST_1', roleSide: 'Right', speakerName: guest1Label, timestampStart: t.timestampStart, timestampEnd: t.timestampEnd, textDe: t.textDe };
    }
    return { speakerId: 'GAST', roleSide: 'Right', speakerName: guest1Label, timestampStart: t.timestampStart, timestampEnd: t.timestampEnd, textDe: t.textDe };
  });

  return result;
}

export function probeAudioSilenceEnd(wavPath) {
  const ffmpeg = resolveFfmpeg();
  const r = spawnSync(
    ffmpeg,
    ['-hide_banner', '-i', wavPath, '-af', 'silencedetect=noise=-40dB:d=10', '-f', 'null', '-'],
    { encoding: 'utf8' }
  );
  const stderr = r.stderr || '';
  const durMatch = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  const totalSec = durMatch ? Number(durMatch[1]) * 3600 + Number(durMatch[2]) * 60 + Number(durMatch[3]) : 0;
  const starts = [...stderr.matchAll(/silence_start:\s*([0-9.]+)/g)].map((m) => Number(m[1]));
  const ends = [...stderr.matchAll(/silence_end:\s*([0-9.]+)\s*\|\s*silence_duration:\s*([0-9.]+)/g)].map((m) => ({
    end: Number(m[1]),
    dur: Number(m[2]),
  }));
  // Check trailing long silence >= 60s ending near EOF
  const lastEnd = ends[ends.length - 1];
  const lastStart = starts[starts.length - 1];
  let trimToSec = null;
  if (lastEnd && lastEnd.dur >= 60 && totalSec - lastEnd.end < 3 && lastStart !== undefined) {
    trimToSec = Number((lastStart + 1.5).toFixed(2));
  }
  return { totalSec, trimToSec };
}
