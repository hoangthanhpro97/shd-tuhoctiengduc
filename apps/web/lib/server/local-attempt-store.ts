import 'server-only';

import { randomBytes } from 'node:crypto';
import { AttemptStatePayloadSchema, AttemptResultPayloadSchema, AttemptResultPublicPayloadSchema, SaveAnswerPayloadSchema, type AttemptMode, type AttemptResultPayload, type AttemptResultPublicPayload, type AttemptStatePayload } from '@shd/contracts';
import { createServerExamKeyPayload } from '@shd/contracts';
import { getExamBySlug } from './exam-content-loader';
import { sourceExamSlug } from '../../data/exam-book-sets';

export type LocalSectionFilter = 'lesen' | 'hoeren' | 'all';

type LocalAttempt = {
  ownerTokenHash: string;
  state: AttemptStatePayload;
  exam: Awaited<ReturnType<typeof getExamBySlug>>;
  keys: ReturnType<typeof createServerExamKeyPayload>;
  result?: AttemptResultPayload;
};

type LocalRuntimeGlobal = typeof globalThis & { __shdLocalAttempts?: Map<string, LocalAttempt> };
const runtimeGlobal = globalThis as LocalRuntimeGlobal;
const attempts = runtimeGlobal.__shdLocalAttempts ?? (runtimeGlobal.__shdLocalAttempts = new Map<string, LocalAttempt>());
const maxAttempts = 200;

function makeAttemptId(slug: string, mode: AttemptMode, sectionFilter: LocalSectionFilter) {
  return `local-${slug}-${mode}-${sectionFilter}-${Date.now()}-${randomBytes(3).toString('hex')}`;
}

function durationFor(exam: NonNullable<Awaited<ReturnType<typeof getExamBySlug>>>, sectionFilter: LocalSectionFilter) {
  const sections = sectionFilter === 'all' ? exam.sections : exam.sections.filter((section) => section.skill.toLowerCase() === sectionFilter);
  return Math.max(1, sections.reduce((sum, section) => sum + section.durationMinutes, 0));
}

function publicState(attempt: LocalAttempt) {
  return AttemptStatePayloadSchema.parse(attempt.state);
}

export async function createLocalAttempt(input: { slug: string; mode: AttemptMode; sectionFilter: LocalSectionFilter; ownerTokenHash: string }) {
  const sourceSlug = sourceExamSlug(input.slug);
  const exam = await getExamBySlug(sourceSlug);
  if (!exam) return null;
  const now = new Date();
  const duration = durationFor(exam, input.sectionFilter);
  const attemptId = makeAttemptId(exam.examMetadata.slug, input.mode, input.sectionFilter);
  const state = AttemptStatePayloadSchema.parse({
    attemptId,
    examId: exam.examMetadata.examId,
    slug: exam.examMetadata.slug,
    versionId: `local-${exam.examMetadata.slug}`,
    mode: input.mode,
    sectionFilter: input.sectionFilter,
    status: 'in_progress',
    startedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + duration * 60_000).toISOString(),
    serverNow: now.toISOString(),
    answers: [],
  });
  attempts.set(attemptId, { ownerTokenHash: input.ownerTokenHash, state, exam, keys: createServerExamKeyPayload(await loadRawExam(exam.examMetadata.slug)) });
  while (attempts.size > maxAttempts) attempts.delete(attempts.keys().next().value as string);
  return { state: publicState(attempts.get(attemptId)!), exam };
}

async function loadRawExam(slug: string) {
  const { readFile } = await import('node:fs/promises');
  const { readdir } = await import('node:fs/promises');
  const path = await import('node:path');
  const directories = [
    path.resolve(process.cwd(), 'content/exams'),
    path.resolve(process.cwd(), '../content/exams'),
    path.resolve(process.cwd(), '../../content/exams'),
  ];
  for (const directory of directories) {
    try {
      const fileNames = await readdir(directory);
      for (const fileName of fileNames.filter((name) => name.endsWith('.json'))) {
        try {
          const parsed = JSON.parse(await readFile(path.join(directory, fileName), 'utf8')) as { examMetadata?: { slug?: string } };
          if (parsed.examMetadata?.slug === slug) return parsed;
        } catch { /* Ignore invalid fixture and continue scanning. */ }
      }
    } catch { /* Try workspace-relative fallback. */ }
  }
  throw new Error(`Local exam fixture not found: ${slug}`);
}

export async function ensureLocalAttempt(attemptId: string, ownerTokenHash: string) {
  if (attempts.has(attemptId)) {
    const existing = attempts.get(attemptId)!;
    if (existing.ownerTokenHash !== ownerTokenHash) {
      existing.ownerTokenHash = ownerTokenHash;
    }
    return existing;
  }
  const match = attemptId.match(/^local-(.+)-(exam|practice)-(lesen|hoeren|all)-(\d+)-([a-f0-9]+)$/);
  if (!match) return null;
  const [, slug, mode, sectionFilter] = match;
  const sourceSlug = sourceExamSlug(slug);
  const exam = await getExamBySlug(sourceSlug);
  if (!exam) return null;
  const now = new Date();
  const duration = durationFor(exam, sectionFilter as LocalSectionFilter);
  const state = AttemptStatePayloadSchema.parse({
    attemptId,
    examId: exam.examMetadata.examId,
    slug: exam.examMetadata.slug,
    versionId: `local-${exam.examMetadata.slug}`,
    mode: mode as AttemptMode,
    sectionFilter: sectionFilter as LocalSectionFilter,
    status: 'in_progress',
    startedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + duration * 60_000).toISOString(),
    serverNow: now.toISOString(),
    answers: [],
  });
  const created: LocalAttempt = {
    ownerTokenHash,
    state,
    exam,
    keys: createServerExamKeyPayload(await loadRawExam(exam.examMetadata.slug)),
  };
  attempts.set(attemptId, created);
  return created;
}

export function getLocalAttempt(attemptId: string, ownerTokenHash?: string) {
  const attempt = attempts.get(attemptId);
  if (!attempt || (ownerTokenHash && attempt.ownerTokenHash !== ownerTokenHash)) return null;
  return attempt;
}

export function updateLocalAnswer(attemptId: string, input: unknown, ownerTokenHash?: string) {
  const attempt = getLocalAttempt(attemptId, ownerTokenHash);
  if (!attempt) return null;
  const payload = SaveAnswerPayloadSchema.parse(input);
  const question = attempt.exam?.sections.flatMap((section) => section.questions).find((item) => item.id === payload.questionId);
  if (!question) throw new Error('Question does not belong to attempt');
  const current = attempt.state.answers.find((answer) => answer.questionId === payload.questionId);
  if ((current?.revision ?? 0) !== payload.revision) throw new Error('REVISION_CONFLICT');
  const answer = { questionId: payload.questionId, selectedOption: payload.selectedOption, revision: payload.revision + 1, answeredAt: new Date().toISOString() };
  attempt.state = AttemptStatePayloadSchema.parse({ ...attempt.state, answers: [...attempt.state.answers.filter((item) => item.questionId !== payload.questionId), answer] });
  return { revision: answer.revision };
}

export function gradeLocalAttempt(attemptId: string, submissionType: 'manual' | 'timeout' = 'manual', ownerTokenHash?: string): AttemptResultPayload | null {
  const attempt = getLocalAttempt(attemptId, ownerTokenHash);
  if (!attempt || !attempt.exam) return null;
  const filter = attempt.state.sectionFilter;
  const sections = filter === 'all' ? attempt.exam.sections : attempt.exam.sections.filter((section) => section.skill.toLowerCase() === filter);
  const keys = new Map(attempt.keys.keys.map((key) => [key.questionId, key]));
  const answers = new Map(attempt.state.answers.map((answer) => [answer.questionId, answer.selectedOption]));
  const sectionScores = sections.map((section) => {
    const score = section.questions.reduce((sum, question) => sum + (answers.get(question.id) === keys.get(question.id)?.correctOption ? Number(keys.get(question.id)?.points ?? 0) : 0), 0);
    const maxScore = section.questions.reduce((sum, question) => sum + Number(keys.get(question.id)?.points ?? 0), 0);
    return { sectionId: section.sectionId, score, maxScore: Math.max(maxScore, 1), percentage: Math.round((score / Math.max(maxScore, 1)) * 100) };
  });
  const totalScore = sectionScores.reduce((sum, section) => sum + section.score, 0);
  const maxPossibleScore = sectionScores.reduce((sum, section) => sum + section.maxScore, 0);
  const percentage = Math.round((totalScore / Math.max(maxPossibleScore, 1)) * 100);
  const allowedQuestionIds = new Set(sections.flatMap((section) => section.questions.map((question) => question.id)));
  const result = AttemptResultPayloadSchema.parse({ attemptId, totalScore, maxPossibleScore, percentage, isPassed: percentage >= attempt.exam.examMetadata.passPercentage, submissionType, benchmarkStatusCode: percentage >= attempt.exam.examMetadata.passPercentage ? 'pass' : percentage >= attempt.exam.examMetadata.passPercentage - 10 ? 'near_pass' : 'not_pass', cefrEstimateCode: attempt.exam.examMetadata.cefrLevel, sectionScores, unlockedSolutions: attempt.exam.sections.flatMap((section) => section.questions).filter((question) => allowedQuestionIds.has(question.id)).slice(0, 2).map((question) => ({ questionId: question.id, selectedOption: answers.get(question.id) ?? null, correctOption: keys.get(question.id)?.correctOption ?? '', isCorrect: answers.get(question.id) === keys.get(question.id)?.correctOption, explanation: question.publicExplanation ?? 'Đối chiếu từ khóa trong ngữ liệu với đáp án.' })) });
  attempt.result = result;
  attempt.state = AttemptStatePayloadSchema.parse({ ...attempt.state, status: 'graded' });
  return result;
}

export function getLocalResult(attemptId: string): AttemptResultPublicPayload | null {
  const result = attempts.get(attemptId)?.result;
  if (!result) return null;
  return AttemptResultPublicPayloadSchema.parse({
    attemptId: result.attemptId,
    totalScore: result.totalScore,
    maxPossibleScore: result.maxPossibleScore,
    percentage: result.percentage,
    isPassed: result.isPassed,
    benchmarkStatusCode: result.benchmarkStatusCode ?? (result.isPassed ? 'pass' : 'not_pass'),
    cefrEstimateCode: result.cefrEstimateCode ?? 'B1',
    sectionScores: result.sectionScores,
    review: {
      attemptId,
      unlocked: true,
      items: result.unlockedSolutions.map((solution) => ({
        questionId: solution.questionId,
        selectedOption: solution.selectedOption,
        access: 'full',
        isCorrect: solution.isCorrect,
        correctOption: solution.correctOption,
        citation: null,
        trapExplanationVi: null,
        tags: null,
        explanation: solution.explanation,
        learningMetadata: null,
      })),
    },
  });
}

export function listLocalAttempts(ownerTokenHash: string, limit = 20) {
  return [...attempts.values()]
    .filter((attempt) => attempt.ownerTokenHash === ownerTokenHash)
    .sort((a, b) => b.state.startedAt.localeCompare(a.state.startedAt))
    .slice(0, limit)
    .map((attempt) => {
      const sections = attempt.exam?.sections ?? [];
      const filteredSections = attempt.state.sectionFilter === 'all' ? sections : sections.filter((section) => section.skill.toLowerCase() === attempt.state.sectionFilter);
      return ({
      attemptId: attempt.state.attemptId,
      slug: attempt.state.slug,
      title: attempt.exam?.examMetadata.title ?? attempt.state.slug,
      status: attempt.state.status,
      mode: attempt.state.mode,
      sectionFilter: attempt.state.sectionFilter,
      answeredCount: attempt.state.answers.filter((answer) => answer.selectedOption !== null).length,
      totalQuestions: filteredSections.reduce((sum, section) => sum + section.questions.length, 0),
      startedAt: attempt.state.startedAt,
      });
    });
}
