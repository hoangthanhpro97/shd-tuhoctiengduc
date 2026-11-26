import 'server-only';

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { parseExamFixture, type ExamPublicPayload, type QuestionKeyDetail } from '@shd/contracts';
import { buildGoetheBookSets, examBookSets, getBookSetExamSlugs, getExamBookSet, type ExamBookSet } from '../../data/exam-book-sets';
import { getPublicExamsByProviderLevel } from './exam-content-loader';
import { getPublicExamBySlug } from './exam-service';

export type StudySkill = 'lesen' | 'hoeren';

export type StudyQuestion = {
  id: string;
  order: number;
  part: number;
  prompt: string;
  options: Array<{ id: string; text: string }>;
  questionType?: string;
  correctAnswer: string;
  citation: string;
  trapExplanationVi: string;
  tags: string[];
};

export type StudySection = {
  sectionId: string;
  skill: 'Lesen' | 'Hoeren';
  title: string;
  durationMinutes: number;
  stimulus?: ExamPublicPayload['sections'][number]['stimulus'];
  questions: StudyQuestion[];
};

export type ExamStudyPayload = {
  exam: ExamPublicPayload;
  sourceSlug: string;
  canonicalSlug: string;
  level: ExamPublicPayload['examMetadata']['cefrLevel'];
  skill: StudySkill;
  sections: StudySection[];
  relatedBookSets: ExamBookSet[];
};

const contentDirectories = [
  path.resolve(process.cwd(), 'content/exams'),
  path.resolve(process.cwd(), '../../content/exams'),
];

async function readRawFixture(sourceSlug: string) {
  for (const directory of contentDirectories) {
    try {
      const names = await readdir(directory);
      for (const name of names.filter((item) => item.endsWith('.json'))) {
        try {
          const raw = JSON.parse(await readFile(path.join(directory, name), 'utf8')) as { examMetadata?: { slug?: string } };
          if (raw.examMetadata?.slug === sourceSlug) return raw;
        } catch {
          // Continue scanning the fixture directory.
        }
      }
    } catch {
      // Try the workspace-relative directory.
    }
  }
  return null;
}

function canonicalSlugFor(sourceSlug: string, requestedSlug: string, dynamicSets: ExamBookSet[]) {
  const set = getExamBookSet(requestedSlug, dynamicSets) ?? getExamBookSet(sourceSlug, dynamicSets);
  return set?.examSlugs.find((slug) => slug === requestedSlug || slug.endsWith(sourceSlug.match(/(\d+)$/)?.[1] ?? '')) ?? requestedSlug;
}

function answerText(question: ExamPublicPayload['sections'][number]['questions'][number], key: QuestionKeyDetail) {
  return question.options.find((option) => option.id === key.correctOption)?.text ?? key.correctOption;
}

export async function getExamStudyPayload(requestedSlug: string, skill: StudySkill): Promise<ExamStudyPayload | null> {
  const goetheB1 = await getPublicExamsByProviderLevel('goethe', 'B1');
  const goetheBookSets = buildGoetheBookSets(goetheB1);
  const bookSet = getExamBookSet(requestedSlug, goetheBookSets);
  const bookSetSlugs = bookSet ? getBookSetExamSlugs(bookSet) : [];
  const requestedChild = bookSetSlugs.find((item) => item.canonicalSlug === requestedSlug || item.sourceSlug === requestedSlug);
  const firstSourceSlug = requestedChild?.sourceSlug ?? (bookSet ? bookSetSlugs[0]?.sourceSlug : requestedSlug);
  const exam = await getPublicExamBySlug(firstSourceSlug ?? requestedSlug);
  if (!exam) return null;

  const isGoethe = exam.examMetadata.providerFormat.toLowerCase().includes('goethe');
  const relatedBookSets = isGoethe ? goetheBookSets : examBookSets;

  const raw = await readRawFixture(exam.examMetadata.slug);
  if (!raw) return null;
  const parsed = parseExamFixture(raw);
  const keyById = new Map(parsed.serverPayload.keys.map((key) => [key.questionId, key]));
  const publicQuestionById = new Map(exam.sections.flatMap((section) => section.questions.map((question) => [question.id, question] as const)));
  const sections = exam.sections
    .filter((section) => section.skill.toLowerCase() === skill)
    .map((section) => ({
      sectionId: section.sectionId,
      skill: section.skill as 'Lesen' | 'Hoeren',
      title: section.title,
      durationMinutes: section.durationMinutes,
      stimulus: section.stimulus,
      questions: section.questions.map((publicQuestion) => {
        const key = keyById.get(publicQuestion.id);
        const question = publicQuestionById.get(publicQuestion.id) ?? publicQuestion;
        return {
          id: question.id,
          order: question.order,
          part: question.part,
          prompt: question.prompt,
          options: question.options,
          questionType: question.questionType,
          correctAnswer: key ? answerText(question, key) : 'Xem đáp án trong tài liệu chính thức',
          citation: key?.citation ?? 'Đối chiếu từ khóa trong ngữ liệu của phần thi.',
          trapExplanationVi: key?.trapExplanationVi ?? 'Xác định từ khóa, loại trừ phương án gây nhiễu và đối chiếu ngữ cảnh.',
          tags: key?.tags ?? ['Kontext'],
        } satisfies StudyQuestion;
      }),
    }));

  return {
    exam,
    sourceSlug: exam.examMetadata.slug,
    canonicalSlug: canonicalSlugFor(exam.examMetadata.slug, requestedSlug, goetheBookSets),
    level: exam.examMetadata.cefrLevel,
    skill,
    sections,
    relatedBookSets,
  };
}
