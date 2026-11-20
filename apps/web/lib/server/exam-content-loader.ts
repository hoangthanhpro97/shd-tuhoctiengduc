import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createPublicExamPayload, type ExamPublicPayload } from '@shd/contracts';
import type { DeepLearningExercise } from '../../data/deep-learning-fixtures';
import { examSlugCandidates } from '../../data/exam-book-sets';

const contentDirectories = [
  path.resolve(process.cwd(), 'content/exams'),
  path.resolve(process.cwd(), '../content/exams'),
  path.resolve(process.cwd(), '../../content/exams'),
];

const syntheticExamPattern = /synthetic|demo/i;

function searchableExamMetadata(exam: ExamPublicPayload) {
  return `${exam.examMetadata.slug} ${exam.examMetadata.title} ${exam.examMetadata.providerFormat}`
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase();
}

export function isPublicExam(exam: ExamPublicPayload) {
  const searchable = searchableExamMetadata(exam);
  return (searchable.includes('osd') || searchable.includes('oesd')) && !syntheticExamPattern.test(searchable);
}

let cache: ExamPublicPayload[] | null = null;

async function loadAll() {
  if (cache && process.env.NODE_ENV === 'production') return cache;
  const { readdir } = await import('node:fs/promises');
  let contentDirectory = contentDirectories[0];
  let fileNames: string[] = [];
  for (const candidate of contentDirectories) {
    try {
      fileNames = (await readdir(candidate)).filter((name) => name.endsWith('.json')).sort();
      contentDirectory = candidate;
      break;
    } catch {
      // Try the next workspace-relative content directory.
    }
  }
  const exams: ExamPublicPayload[] = [];
  for (const fileName of fileNames) {
    try {
      const parsed: unknown = JSON.parse(await readFile(path.join(contentDirectory, fileName), 'utf8'));
      exams.push(createPublicExamPayload(parsed));
    } catch (error) {
      console.warn(`Skipping invalid exam content ${fileName}:`, error instanceof Error ? error.message : error);
    }
  }
  cache = exams.sort((a, b) => a.examMetadata.cefrLevel.localeCompare(b.examMetadata.cefrLevel)
    || Number(a.examMetadata.slug.match(/(\d+)$/)?.[1] ?? 0) - Number(b.examMetadata.slug.match(/(\d+)$/)?.[1] ?? 0)
    || a.examMetadata.slug.localeCompare(b.examMetadata.slug));
  return cache;
}

export type PublicExamSummary = {
  examId: string;
  slug: string;
  title: string;
  providerFormat: string;
  cefrLevel: ExamPublicPayload['examMetadata']['cefrLevel'];
  durationMinutes: number;
  passPercentage: number;
  questionCount: number;
  sectionCount: number;
};

export async function getAllPublicExams(): Promise<PublicExamSummary[]> {
  return (await loadAll()).filter(isPublicExam).map((exam) => ({
    examId: exam.examMetadata.examId,
    slug: exam.examMetadata.slug,
    title: exam.examMetadata.title,
    providerFormat: exam.examMetadata.providerFormat,
    cefrLevel: exam.examMetadata.cefrLevel,
    durationMinutes: exam.examMetadata.totalDurationMinutes,
    passPercentage: exam.examMetadata.passPercentage,
    questionCount: exam.sections.reduce((count, section) => count + section.questions.length, 0),
    sectionCount: exam.sections.length,
  }));
}

export async function getExamBySlug(slug: string) {
  const candidates = examSlugCandidates(slug);
  return (await loadAll()).find((exam) => candidates.includes(exam.examMetadata.slug) && isPublicExam(exam)) ?? null;
}

export type SkillExercise = DeepLearningExercise & { topic?: string; sourceExamSlug: string; sectionId: string; durationMinutes: number; parts: number[] };

export async function getSkillExercises(skill: 'Lesen' | 'Hoeren'): Promise<SkillExercise[]> {
  const exercises: SkillExercise[] = [];
  for (const exam of (await loadAll()).filter(isPublicExam)) {
    exam.sections.filter((section) => section.skill === skill).forEach((section, index) => {
      const stimulus = section.stimulus;
      const slug = `${exam.examMetadata.slug}-${skill.toLowerCase()}-${index + 1}`;
      exercises.push({
        slug,
        title: stimulus?.title ?? section.title,
        level: exam.examMetadata.cefrLevel === 'C1' ? 'B2' : exam.examMetadata.cefrLevel,
        provider: exam.examMetadata.providerFormat.toLowerCase().includes('telc') ? 'TELC' : exam.examMetadata.providerFormat.toLowerCase().includes('ösd') || exam.examMetadata.providerFormat.toLowerCase().includes('osd') ? 'ÖSD' : 'Goethe',
        teil: `Teil ${index + 1}`,
        skill,
        questions: section.questions.length,
        attempts: 0,
        description: `${section.title} · ${exam.examMetadata.title}`,
        topic: stimulus?.title ?? section.title,
        sectionId: section.sectionId,
        durationMinutes: section.durationMinutes,
        parts: [...new Set(section.questions.map((question) => question.part))].sort((a, b) => a - b),
        content: stimulus?.type === 'text' ? stimulus.content : undefined,
        audioUrl: stimulus?.type === 'audio' ? stimulus.audioUrl : undefined,
        transcript: stimulus?.dialogueTranscript?.map((turn) => ({ id: turn.speakerId, speaker: turn.speakerName, de: turn.textDe, vi: turn.textVi, startMs: turn.timestampStart * 1000, endMs: turn.timestampEnd * 1000 })),
        vocabulary: [],
        reviewQuestions: section.questions.map((question) => ({
          id: question.id,
          prompt: question.prompt,
          options: question.options,
          questionType: question.questionType,
          explanation: question.publicExplanation ?? 'Hãy đọc kỹ ngữ liệu, xác định từ khóa và đối chiếu thông tin trước khi chọn đáp án.',
          keywords: question.prompt.split(/\s+/u).filter((word) => word.length > 4).slice(0, 5),
          paraphrases: [],
          steps: [{ title: 'Phân tích câu hỏi', content: 'Xác định từ khóa trong câu hỏi, sau đó tìm thông tin tương ứng trong ngữ liệu.' }],
        })),
        sourceExamSlug: exam.examMetadata.slug,
      });
    });
  }
  return exercises;
}

export async function getSkillExercise(skill: 'Lesen' | 'Hoeren', slug: string) {
  const exercises = await getSkillExercises(skill);
  return exercises.find((exercise) => exercise.slug === slug) ?? null;
}

export async function getPublicExamsByProviderLevel(provider: string, level: ExamPublicPayload['examMetadata']['cefrLevel']) {
  const normalizedProvider = provider.normalize('NFKD').replace(/[\u0300-\u036f]/gu, '').toLowerCase();
  return (await getAllPublicExams()).filter((exam) => {
    const searchableProvider = exam.providerFormat.normalize('NFKD').replace(/[\u0300-\u036f]/gu, '').toLowerCase();
    return searchableProvider.includes(normalizedProvider) && exam.cefrLevel === level;
  });
}
