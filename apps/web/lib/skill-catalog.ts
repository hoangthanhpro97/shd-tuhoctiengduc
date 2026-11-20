import type { SkillExercise } from './server/exam-content-loader';

export type SkillFilters = {
  query: string;
  levels: string[];
  providers: string[];
  teils: string[];
};

const examTopics: Record<SkillExercise['skill'], Record<string, string>> = {
  Hoeren: {
    'osd-b1-test-02': 'Alltagsansagen, Führung & Gespräche',
    'osd-b1-test-03': 'Flughafen, Nachhilfe & Generationen-WG',
    'osd-b1-test-04': 'Buchhandlung, Swarovski & Mode',
    'osd-b2-test-02': 'Wiener Tanzschulen & Tanzkurse',
    'osd-b2-test-03': 'Vegetarismus & Camping im Burgenland',
    'osd-b2-test-04': 'Sommerfestivals in Deutschland',
  },
  Lesen: {
    'osd-b1-test-02': 'Blog, Presse & Anzeigen',
    'osd-b1-test-03': 'WG, Mobilität & Weiterbildung',
    'osd-b1-test-04': 'Wohnen, Berufsausbildung & Energie',
    'osd-b2-test-02': 'Tanzschulen & Weiterbildung',
    'osd-b2-test-03': 'Körperbild, Ernährung & Werbebrief',
    'osd-b2-test-04': 'Sommerfestivals & Schulveranstaltungen',
  },
};

function cleanTopicTitle(raw: string): string {
  return raw
    // Strip structural section/book prefixes
    .replace(/^(?:Hörtexte\s+Teil\s+\d+|Lesetext\s+Blatt\s+\d+|Aufgabe\s+\d+|Teil\s+\d+)\s*[:·–-]\s*/iu, '')
    // Strip page citations like (S. 74-75), (S. 158 & 200), (S. 118)
    .replace(/\s*\(S\.\s*\d+(?:\s*(?:[-–&,]|\bund\b)\s*\d+)*\)/giu, '')
    // Strip redundant parenthetical exam format tags when standalone
    .replace(/\s*\((?:Hörverstehen|Leseverstehen)\s*[AB][12]\)/giu, '')
    .trim();
}

export function getSkillExerciseTitle(exercise: SkillExercise) {
  const rawTopic = exercise.topic?.trim() || exercise.title.trim();
  const isGeneric =
    /^Kỹ năng (?:Nghe|Đọc) hiểu(?:\s+[AB][12])?\s*\((?:Hörverstehen|Leseverstehen)\)$/u.test(rawTopic) ||
    /^(?:ÖSD|Goethe|TELC)\s+[AB][12]\s+(?:Modelltest|Modellsatz|Test)\s+\d+/iu.test(rawTopic);

  if (isGeneric) {
    return (
      examTopics[exercise.skill][exercise.sourceExamSlug] ??
      (exercise.skill === 'Lesen' ? 'Texte & Leseverstehen' : 'Gesellschaft & Alltag')
    );
  }

  const cleaned = cleanTopicTitle(rawTopic);
  return cleaned || rawTopic;
}

function normalize(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/gu, '').replace(/đ/gu, 'd');
}

export function matchesSkillExercise(exercise: SkillExercise, filters: SkillFilters) {
  const sourceNumber = (exercise.sourceExamSlug.match(/(?:-|_)(\d+)$/)?.[1] ?? '01').padStart(2, '0');
  const haystack = normalize(
    `${getSkillExerciseTitle(exercise)} ${exercise.provider} ${exercise.level} Test ${sourceNumber} ${exercise.title} ${exercise.topic ?? ''} ${exercise.description} ${exercise.slug} ${exercise.sourceExamSlug}`
  );
  return filters.query.trim().split(/\s+/u).every((word) => haystack.includes(normalize(word)))
    && (!filters.levels.length || filters.levels.includes(exercise.level))
    && (!filters.providers.length || filters.providers.includes(exercise.provider))
    && (!filters.teils.length || filters.teils.some((teil) => exercise.parts.includes(Number(teil.replace(/\D/gu, '')))));
}
