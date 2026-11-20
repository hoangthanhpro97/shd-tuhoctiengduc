import { dictations, writings, type Exam } from './fixtures';

type SkillItem = { slug?: string; title: string; teil: number; duration?: string; topic?: string; provider?: string; level?: string; sourceExamSlug?: string };
export type HomeData = { exams: Exam[]; listening: SkillItem[]; reading: SkillItem[]; dictations: typeof dictations; writings: typeof writings };

export function selectHomeHighlights<T extends { level?: string; sourceExamSlug?: string }>(items: T[]): T[] {
  const selectLevel = (level: string) => {
    const candidates = items.filter((item) => item.level === level);
    const selected: T[] = [];
    const seenExams = new Set<string>();
    for (const item of candidates) {
      if (item.sourceExamSlug && seenExams.has(item.sourceExamSlug)) continue;
      selected.push(item);
      if (item.sourceExamSlug) seenExams.add(item.sourceExamSlug);
      if (selected.length === 2) break;
    }
    return selected;
  };
  const selected = [...selectLevel('B1'), ...selectLevel('B2')];
  return [...selected, ...items.filter((item) => !selected.includes(item))].slice(0, 4);
}

export async function getHomeData(): Promise<HomeData> {
  const [examResponse, readingResponse, listeningResponse] = await Promise.all([
    fetch('/api/v1/exams', { cache: 'no-store' }),
    fetch('/api/v1/learning?skill=Lesen', { cache: 'no-store' }),
    fetch('/api/v1/learning?skill=Hoeren', { cache: 'no-store' }),
  ]);
  const payload = examResponse.ok ? await examResponse.json() as { items: Array<{ slug: string; title: string; cefrLevel: Exam['level']; questionCount: number; durationMinutes: number; providerFormat?: string }> } : { items: [] };
  type LearningItem = { slug: string; title: string; teil: string; provider: string; topic?: string; level: string; sourceExamSlug: string };
  const learningItems = (response: Response): Promise<LearningItem[]> => response.ok ? response.json().then((value: { items: LearningItem[] }) => value.items) : Promise.resolve([]);
  const [readingItems, listeningItems] = await Promise.all([learningItems(readingResponse), learningItems(listeningResponse)]);
  return {
    exams: payload.items.map((exam) => ({
      slug: exam.slug,
      title: exam.title,
      level: exam.cefrLevel,
      questions: exam.questionCount,
      duration: exam.durationMinutes,
      isDemo: false,
      status: 'new',
      providerFormat: exam.providerFormat,
    })),
    listening: listeningItems.map((item, index) => ({ ...item, teil: Number(item.teil.replace(/\D/g, '')) || index + 1, duration: 'Theo đề JSON' })),
    reading: readingItems.map((item, index) => ({ ...item, teil: Number(item.teil.replace(/\D/g, '')) || index + 1, duration: 'Theo đề JSON' })),
    dictations,
    writings,
  };
}
