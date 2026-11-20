export type ExamBookSet = {
  slug: string;
  provider: 'osd';
  level: 'B1' | 'B2';
  code: 'ZB1' | 'ZB2';
  volumeNumber: string;
  shortTitle: string;
  title: string;
  description: string;
  examSlugs: string[];
};

export const examBookSets: ExamBookSet[] = [
  {
    slug: 'osd-zb1-tap-1',
    provider: 'osd',
    level: 'B1',
    code: 'ZB1',
    volumeNumber: '01',
    shortTitle: 'ÖSD B1 · Tập 1',
    title: 'ÖSD Zertifikat B1 · Tập 1',
    description: 'Bốn đề thi thử Modelltest 01–04 (Lesen & Hören) theo chuẩn ÖSD Zertifikat B1.',
    examSlugs: ['osd-b1-test-01', 'osd-b1-test-02', 'osd-b1-test-03', 'osd-b1-test-04'],
  },
  {
    slug: 'osd-zb1-tap-2',
    provider: 'osd',
    level: 'B1',
    code: 'ZB1',
    volumeNumber: '02',
    shortTitle: 'ÖSD B1 · Tập 2',
    title: 'ÖSD Zertifikat B1 · Tập 2',
    description: 'Bốn đề thi thử Modelltest 05–08 (Lesen & Hören) đầy đủ ngữ liệu và audio chuẩn ÖSD B1.',
    examSlugs: ['osd-b1-test-05', 'osd-b1-test-06', 'osd-b1-test-07', 'osd-b1-test-08'],
  },
  {
    slug: 'osd-zb1-tap-3',
    provider: 'osd',
    level: 'B1',
    code: 'ZB1',
    volumeNumber: '03',
    shortTitle: 'ÖSD B1 · Tập 3',
    title: 'ÖSD Zertifikat B1 · Tập 3',
    description: 'Bốn đề thi thử Modelltest 09–12 (Lesen & Hören) đầy đủ ngữ liệu và audio chuẩn ÖSD B1.',
    examSlugs: ['osd-b1-test-09', 'osd-b1-test-10', 'osd-b1-test-11', 'osd-b1-test-12'],
  },
  {
    slug: 'osd-zb1-tap-4',
    provider: 'osd',
    level: 'B1',
    code: 'ZB1',
    volumeNumber: '04',
    shortTitle: 'ÖSD B1 · Tập 4',
    title: 'ÖSD Zertifikat B1 · Tập 4',
    description: 'Ba đề thi thử Modelltest 13–15 (Lesen & Hören) hoàn thiện trọn bộ 15 đề ÖSD Zertifikat B1.',
    examSlugs: ['osd-b1-test-13', 'osd-b1-test-14', 'osd-b1-test-15'],
  },
  {
    slug: 'osd-zb2-tap-1',
    provider: 'osd',
    level: 'B2',
    code: 'ZB2',
    volumeNumber: '01',
    shortTitle: 'ÖSD B2 · Tập 1',
    title: 'ÖSD Zertifikat B2 · Tập 1',
    description: 'Bốn đề thi thử Modelltest 01–04 (Lesen & Hören) theo chuẩn ÖSD Mittelstufe Deutsch B2.',
    examSlugs: ['osd-b2-test-01', 'osd-b2-test-02', 'osd-b2-test-03', 'osd-b2-test-04'],
  },
  {
    slug: 'osd-zb2-tap-2',
    provider: 'osd',
    level: 'B2',
    code: 'ZB2',
    volumeNumber: '02',
    shortTitle: 'ÖSD B2 · Tập 2',
    title: 'ÖSD Zertifikat B2 · Tập 2',
    description: 'Bốn đề thi thử Modelltest 05–08 (Lesen & Hören) đầy đủ ngữ liệu và audio chuẩn ÖSD B2.',
    examSlugs: ['osd-b2-test-05', 'osd-b2-test-06', 'osd-b2-test-07', 'osd-b2-test-08'],
  },
  {
    slug: 'osd-zb2-tap-3',
    provider: 'osd',
    level: 'B2',
    code: 'ZB2',
    volumeNumber: '03',
    shortTitle: 'ÖSD B2 · Tập 3',
    title: 'ÖSD Zertifikat B2 · Tập 3',
    description: 'Hai đề thi thử Modelltest 09–10 (Lesen & Hören) hoàn thiện trọn bộ 10 đề ÖSD Zertifikat B2.',
    examSlugs: ['osd-b2-test-09', 'osd-b2-test-10'],
  },
];

/** Canonical URLs are kept separate from source fixture/DB slugs for compatibility. */
export const examSlugAliases: Record<string, string> = {
  'osd-b1-test-01': 'osd-b1-mock-01',
  'osd-b2-test-01': 'b2-osd-mock-01',
};

export function sourceExamSlug(slug: string) {
  return examSlugAliases[slug] ?? slug;
}

export function examSlugCandidates(slug: string) {
  return [...new Set([sourceExamSlug(slug), slug])];
}

export function canonicalExamSlug(slug: string) {
  const entry = Object.entries(examSlugAliases).find(([, source]) => source === slug);
  return entry?.[0] ?? slug;
}

export function getExamBookSet(slug: string) {
  const canonical = canonicalExamSlug(slug);
  return examBookSets.find((set) => set.slug === canonical || set.examSlugs.includes(canonical)) ?? null;
}

export function getBookSetExamSlugs(set: ExamBookSet) {
  return set.examSlugs.map((slug) => ({ canonicalSlug: slug, sourceSlug: sourceExamSlug(slug) }));
}
