import type {
  AttemptStatePayload,
  ExamPublicPayload,
  PublicQuestion,
} from '@shd/contracts';
import type { DeepLearningExercise } from '../../../data/deep-learning-fixtures';
import { getReadingStimulus } from '../../../data/reading-stimuli';
import type {
  WorkstationLevel,
  WorkstationListeningStimulus,
  WorkstationPayload,
  WorkstationProvider,
  WorkstationReadingStimulus,
  WorkstationSection,
  WorkstationSkill,
  WorkstationTranscriptTurn,
} from './types';

const B1_HOEREN_TEIL_TITLES: Record<number, { title: string; sectionLabel: string }> = {
  1: {
    title: 'Kurze Alltagsansagen',
    sectionLabel: 'Teil 1: Fünf kurze Ansagen / Nachrichten (Richtig/Falsch & A/B/C)',
  },
  2: {
    title: 'Führung / Präsentation',
    sectionLabel: 'Teil 2: Führung / Präsentation (Multiple Choice A/B/C)',
  },
  3: {
    title: 'Alltagsgespräch zweier Personen',
    sectionLabel: 'Teil 3: Alltagsgespräch zweier Personen (Richtig/Falsch)',
  },
  4: {
    title: 'Radiodiskussion (Zuordnung)',
    sectionLabel: 'Teil 4: Radiodiskussion mit Moderator und zwei Gästen (Zuordnung)',
  },
};

const B2_HOEREN_TEIL_TITLES: Record<number, { title: string; sectionLabel: string }> = {
  1: {
    title: 'Radiosendung / Interview',
    sectionLabel: 'Teil 1: Radiosendung / Interview (Hörverstehen B2)',
  },
  2: {
    title: 'Vortrag / Gespräch',
    sectionLabel: 'Teil 2: Vortrag / Gespräch (Hörverstehen B2)',
  },
  3: {
    title: 'Alltagsdialog / Stellungnahme',
    sectionLabel: 'Teil 3: Alltagsdialog / Stellungnahme (Hörverstehen B2)',
  },
  4: {
    title: 'Diskussionsrunde (Zuordnung)',
    sectionLabel: 'Teil 4: Diskussionsrunde (Hörverstehen B2)',
  },
};

const B1_LESEN_TEIL_TITLES: Record<number, string> = {
  1: 'Teil 1: Blogbeitrag / E-Mail (Richtig/Falsch)',
  2: 'Teil 2: Informationstext / Presseartikel (Multiple Choice)',
  3: 'Teil 3: Anzeigen & Situationen (Zuordnung)',
  4: 'Teil 4: Leserbriefe / Meinungen (Ja/Nein)',
  5: 'Teil 5: Regeln / Hinweise (Multiple Choice)',
};

const B2_LESEN_TEIL_TITLES: Record<number, string> = {
  1: 'Teil 1: Sachtext / Artikel (Leseverstehen B2)',
  2: 'Teil 2: Meinungstext / Kommentar (Leseverstehen B2)',
  3: 'Teil 3: Zuordnung / Überschriften (Leseverstehen B2)',
  4: 'Teil 4: Sprachbausteine / Lückentext (Leseverstehen B2)',
};

function resolveProvider(raw: string): WorkstationProvider {
  const lower = raw.toLowerCase();
  if (lower.includes('telc')) return 'TELC';
  if (lower.includes('goethe')) return 'GOETHE';
  return 'OSD';
}

function resolveLevel(raw: string): WorkstationLevel {
  if (raw === 'A1' || raw === 'A2' || raw === 'B1' || raw === 'B2') return raw;
  return 'B2';
}

function formatExamDisplayTitle(slug: string, level: WorkstationLevel, fallbackTitle: string): string {
  const lowerSlug = slug.toLowerCase();
  const numMatch = lowerSlug.match(/(?:mock|test)-0?(\d+)$/i);
  if (lowerSlug.includes('osd') && numMatch) {
    const testNum = parseInt(numMatch[1], 10);
    return `ÖSD Zertifikat ${level} – Modelltest ${testNum}`;
  }
  return fallbackTitle;
}

function isGenericCombinedSectionTitle(title: string | undefined): boolean {
  if (!title) return true;
  const lower = title.toLowerCase();
  return (
    lower.includes('kỹ năng đọc hiểu') ||
    lower.includes('kỹ năng nghe hiểu') ||
    lower.startsWith('leseverstehen') ||
    lower.startsWith('hörverstehen')
  );
}

function buildSectionTitle(
  skill: WorkstationSkill,
  level: WorkstationLevel,
  part: number,
  rawSectionTitle: string | undefined,
  isCombinedSection: boolean
): string {
  if (rawSectionTitle && !isCombinedSection && !isGenericCombinedSectionTitle(rawSectionTitle)) {
    return rawSectionTitle;
  }
  if (skill === 'hoeren') {
    const map = level === 'B2' ? B2_HOEREN_TEIL_TITLES : B1_HOEREN_TEIL_TITLES;
    return map[part]?.sectionLabel ?? `Teil ${part}: Hörverstehen ${level}`;
  }
  const map = level === 'B2' ? B2_LESEN_TEIL_TITLES : B1_LESEN_TEIL_TITLES;
  return map[part] ?? `Teil ${part}: Leseverstehen ${level}`;
}

function resolveListeningPlayCount(
  level: WorkstationLevel,
  part: number,
  annotations?: Record<string, unknown>
): 1 | 2 {
  const annotated = annotations?.playCount;
  if (annotated === 1 || annotated === 2) return annotated;
  if (level === 'B1') {
    // ÖSD Zertifikat B1: Teil 1 (2x), Teil 2 (1x), Teil 3 (1x), Teil 4 (2x)
    return part === 2 || part === 3 ? 1 : 2;
  }
  if (level === 'B2') {
    // ÖSD Mittelstufe Deutsch B2: Aufgabe 1 (1x), Aufgabe 2 (2x)
    return part === 1 ? 1 : 2;
  }
  return 2;
}

function buildListeningStimulusTitle(
  level: WorkstationLevel,
  part: number,
  rawStimulusTitle: string | undefined,
  isCombinedSection: boolean
): string {
  if (rawStimulusTitle && !isCombinedSection && !isGenericCombinedSectionTitle(rawStimulusTitle)) {
    return rawStimulusTitle;
  }
  const map = level === 'B2' ? B2_HOEREN_TEIL_TITLES : B1_HOEREN_TEIL_TITLES;
  return map[part]?.title ?? `Hören · Teil ${part}`;
}

export function convertExamToWorkstationPayload(
  exam: ExamPublicPayload,
  state: AttemptStatePayload,
  forceSkill?: WorkstationSkill
): WorkstationPayload {
  const isListeningAttempt =
    forceSkill === 'hoeren' ||
    (forceSkill !== 'lesen' &&
      (state.sectionFilter === 'hoeren' ||
        (!exam.sections.some((s) => s.skill === 'Lesen') &&
          exam.sections.some((s) => s.skill === 'Hoeren'))));

  const skill: WorkstationSkill = isListeningAttempt ? 'hoeren' : 'lesen';
  const targetSkillKey = isListeningAttempt ? 'Hoeren' : 'Lesen';

  const provider = resolveProvider(exam.examMetadata.providerFormat);
  const level = resolveLevel(exam.examMetadata.cefrLevel);

  const relevantSections = exam.sections.filter((s) => s.skill === targetSkillKey);
  const sourceQuestions = relevantSections.flatMap((s) =>
    s.questions.map((q) => ({ ...q, section: s }))
  );

  // Dynamically detect all actual part numbers present in the exam JSON (no hardcoded count)
  const partNumbers = [...new Set(sourceQuestions.map((q) => q.part))].sort((a, b) => a - b);
  const safeParts = partNumbers.length > 0 ? partNumbers : [1];
  const isCombinedSection = relevantSections.length === 1 && safeParts.length > 1;

  const sections: WorkstationSection[] = safeParts.map((part) => {
    const partQuestions: PublicQuestion[] = sourceQuestions
      .filter((q) => q.part === part)
      .map(({ section: _s, ...q }) => q);

    const matchingSection =
      relevantSections.find((s) => s.questions.some((q) => q.part === part)) ?? relevantSections[0];

    const sectionTitle = buildSectionTitle(
      skill,
      level,
      part,
      matchingSection?.title,
      isCombinedSection
    );

    let stimulus: WorkstationReadingStimulus | WorkstationListeningStimulus | undefined;

    if (skill === 'lesen') {
      const needsGeneratedStimulus =
        /osd-(?:b1|b2)-test-0[234]/.test(state.slug) ||
        isCombinedSection ||
        (!matchingSection?.stimulus?.content && matchingSection?.skill === 'Lesen');

      const readingStimulus =
        needsGeneratedStimulus && matchingSection
          ? getReadingStimulus(state.slug, part, level === 'B2' ? 'B2' : 'B1')
          : null;

      const content =
        readingStimulus?.content ??
        matchingSection?.stimulus?.content ??
        'Ngữ liệu đang được cập nhật.';

      stimulus = {
        type: 'text',
        title: readingStimulus?.title ?? matchingSection?.stimulus?.title ?? `Teil ${part}`,
        content,
        annotations: matchingSection?.stimulus?.annotations,
      };
    } else {
      const transcriptTurns: WorkstationTranscriptTurn[] | undefined =
        matchingSection?.stimulus?.dialogueTranscript?.map((turn) => ({
          speakerId: turn.speakerId,
          speakerName: turn.speakerName,
          timestampStart: turn.timestampStart,
          timestampEnd: turn.timestampEnd,
          textDe: turn.textDe,
          textVi: turn.textVi,
          roleSide: turn.roleSide?.toLowerCase() === 'right' ? 'right' : 'left',
        }));

      // Play count policy: read official playCount from stimulus.annotations first (B1: [2,1,1,2], B2: [1,2])
      const playCount: 1 | 2 = resolveListeningPlayCount(
        level,
        part,
        matchingSection?.stimulus?.annotations
      );

      stimulus = {
        type: 'audio',
        title: buildListeningStimulusTitle(
          level,
          part,
          matchingSection?.stimulus?.title,
          isCombinedSection
        ),
        // Read original audioUrl verbatim from exam JSON without altering source files
        audioUrl: matchingSection?.stimulus?.audioUrl,
        playCount,
        situationDe: sectionTitle,
        transcriptTurns,
      };
    }

    return {
      part,
      title: sectionTitle,
      skill,
      stimulus,
      questions: partQuestions,
      instructionDe: undefined,
    };
  });

  const durationSeconds =
    state.mode === 'practice'
      ? null
      : Math.floor((new Date(state.expiresAt).getTime() - new Date(state.serverNow).getTime()) / 1000);

  const displayTitle = formatExamDisplayTitle(state.slug, level, exam.examMetadata.title);

  return {
    id: state.slug,
    title: displayTitle,
    provider,
    level,
    skill,
    mode: state.mode,
    durationSeconds: durationSeconds && durationSeconds > 0 ? durationSeconds : 3600,
    sections,
  };
}

export type SkillExerciseInput = DeepLearningExercise & {
  sectionId?: string;
  durationMinutes?: number;
  parts?: number[];
  sourceExamSlug?: string;
};

/**
 * Runtime adapter for standalone practice routes:
 * `/luyen-doc/[slug]/lam-bai` and `/luyen-nghe/[slug]/lam-bai`.
 * Uses existing source exam sections/questions verbatim without modifying JSON or audio files.
 */
export function convertSkillExerciseToWorkstationPayload(
  exercise: SkillExerciseInput,
  sourceExam?: ExamPublicPayload | null
): WorkstationPayload {
  const skill: WorkstationSkill = exercise.skill === 'Hoeren' ? 'hoeren' : 'lesen';
  const provider = resolveProvider(exercise.provider);
  const level = resolveLevel(exercise.level);
  const effectiveSlug = exercise.sourceExamSlug || exercise.slug;
  const fallbackPart = exercise.parts?.[0] ?? 1;

  // Locate matching section inside sourceExam so we preserve exact `question.part` & `question.order`
  const matchedSection = sourceExam?.sections.find(
    (s) => s.sectionId === exercise.sectionId && s.skill === exercise.skill
  );

  const rawQuestions: PublicQuestion[] = matchedSection
    ? matchedSection.questions
    : exercise.reviewQuestions.map((q, idx) => ({
        id: q.id,
        order: idx + 1,
        part: fallbackPart,
        prompt: q.prompt,
        options: q.options ?? [],
        questionType: q.questionType,
      }));

  const partNumbers = [...new Set(rawQuestions.map((q) => q.part))].sort((a, b) => a - b);
  const safeParts = partNumbers.length > 0 ? partNumbers : [fallbackPart];
  const isCombinedSection = safeParts.length > 1;

  const sections: WorkstationSection[] = safeParts.map((part) => {
    const partQuestions = rawQuestions.filter((q) => q.part === part);
    const sectionTitle = buildSectionTitle(
      skill,
      level,
      part,
      matchedSection?.title ?? exercise.title,
      isCombinedSection
    );

    if (skill === 'lesen') {
      const needsGeneratedStimulus =
        /osd-(?:b1|b2)-test-0[234]/.test(effectiveSlug) ||
        isCombinedSection ||
        !exercise.content;

      const readingStimulus = needsGeneratedStimulus
        ? getReadingStimulus(effectiveSlug, part, level === 'B2' ? 'B2' : 'B1')
        : null;

      return {
        part,
        title: sectionTitle,
        skill: 'lesen',
        stimulus: {
          type: 'text',
          title: readingStimulus?.title ?? matchedSection?.stimulus?.title ?? exercise.title,
          content: readingStimulus?.content ?? exercise.content ?? 'Ngữ liệu đang được cập nhật.',
          annotations: matchedSection?.stimulus?.annotations,
        },
        questions: partQuestions,
        instructionDe: undefined,
      };
    }

    const transcriptTurns: WorkstationTranscriptTurn[] | undefined =
      matchedSection?.stimulus?.dialogueTranscript?.map((turn) => ({
        speakerId: turn.speakerId,
        speakerName: turn.speakerName,
        timestampStart: turn.timestampStart,
        timestampEnd: turn.timestampEnd,
        textDe: turn.textDe,
        textVi: turn.textVi,
        roleSide: turn.roleSide?.toLowerCase() === 'right' ? 'right' : 'left',
      })) ??
      exercise.transcript?.map((t) => ({
        speakerId: t.id,
        speakerName: t.speaker,
        timestampStart: t.startMs ? t.startMs / 1000 : undefined,
        timestampEnd: t.endMs ? t.endMs / 1000 : undefined,
        textDe: t.de,
        textVi: t.vi,
      }));

    const playCount: 1 | 2 = resolveListeningPlayCount(
      level,
      part,
      matchedSection?.stimulus?.annotations
    );

    return {
      part,
      title: sectionTitle,
      skill: 'hoeren',
      stimulus: {
        type: 'audio',
        title: buildListeningStimulusTitle(
          level,
          part,
          matchedSection?.stimulus?.title ?? exercise.title,
          isCombinedSection
        ),
        audioUrl: matchedSection?.stimulus?.audioUrl ?? exercise.audioUrl,
        playCount,
        situationDe: sectionTitle,
        transcriptTurns,
      },
      questions: partQuestions,
      instructionDe: undefined,
    };
  });

  const displayTitle = exercise.sourceExamSlug
    ? `${formatExamDisplayTitle(exercise.sourceExamSlug, level, exercise.title)} · ${
        isCombinedSection ? (skill === 'hoeren' ? 'Hören' : 'Lesen') : exercise.teil
      }`
    : `${exercise.title} · ${exercise.teil}`;

  return {
    id: effectiveSlug,
    title: displayTitle,
    provider,
    level,
    skill,
    mode: 'practice',
    durationSeconds: null,
    sections,
  };
}
