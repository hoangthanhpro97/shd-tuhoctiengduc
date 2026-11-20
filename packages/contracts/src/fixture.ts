import { z } from 'zod';
import {
  ExamMetadataSchema,
  ExamStimulusSchema,
  ExamPublicPayloadSchema,
  ExamSectionSchema,
  PublicQuestionSchema,
  QuestionOptionSchema,
  type ExamSection,
  type PublicQuestion,
  type QuestionType,
} from './exam.js';
import { QuestionKeyDetailSchema, ServerExamKeyPayloadSchema } from './grading.js';

const RawQuestionSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(),
  part: z.number().int().positive().optional(),
  prompt: z.string().min(1),
  options: z.array(QuestionOptionSchema).default([]),
  questionType: z.string().min(1).optional(),
  taskType: z.string().min(1).optional(),
  sourcePage: z.number().int().positive().optional(),
  publicExplanation: z.string().min(1).optional(),
}).strict();

const RawStimulusSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  audioUrl: z.string().min(1).optional(),
  dialogueTranscript: z.unknown().optional(),
  annotations: z.unknown().optional(),
}).strict();

const RawPartSchema = z.object({
  part: z.number().int().positive(),
  title: z.string().min(1),
  durationMinutes: z.number().int().positive().optional(),
  totalQuestions: z.number().int().nonnegative().optional(),
  stimulus: RawStimulusSchema.optional(),
  questions: z.array(RawQuestionSchema),
}).strict();

const RawSectionSchema = z.object({
  sectionId: z.string().min(1),
  skill: z.enum(['Lesen', 'Hoeren', 'Schreiben', 'Sprechen']),
  title: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  totalQuestions: z.number().int().nonnegative(),
  stimulus: RawStimulusSchema.optional(),
  questions: z.array(RawQuestionSchema).optional(),
  parts: z.array(RawPartSchema).min(1).optional(),
}).strict().superRefine((section, context) => {
  if ((section.questions === undefined) === (section.parts === undefined)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Supply either questions or parts, not both' });
  }
  const questions = section.questions ?? section.parts?.flatMap((part) => part.questions) ?? [];
  if (questions.length !== section.totalQuestions) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['totalQuestions'], message: 'totalQuestions must match the source questions' });
  }
});

const RawExamFixtureSchema = z.object({
  examMetadata: ExamMetadataSchema,
  sections: z.array(RawSectionSchema).min(1),
  serverGradingKeys: z.array(QuestionKeyDetailSchema).min(1),
}).strict();

export type RawExamFixture = z.infer<typeof RawExamFixtureSchema>;

export interface ParsedExamFixture {
  raw: RawExamFixture;
  publicPayload: z.infer<typeof ExamPublicPayloadSchema>;
  serverPayload: z.infer<typeof ServerExamKeyPayloadSchema>;
}

function normalizeStimulus(stimulus: z.infer<typeof RawStimulusSchema> | undefined) {
  if (!stimulus) return undefined;
  const audioUrl = stimulus.audioUrl ?? (stimulus.type === 'audio' && /^(?:https?:\/\/|\/).*\.(?:mp3|m4a|wav|ogg)(?:\?.*)?$/i.test(stimulus.content ?? '') ? stimulus.content : undefined);
  return ExamStimulusSchema.parse({ ...stimulus, type: stimulus.type === 'audio' ? 'audio' : 'text', audioUrl });
}

function normalizeQuestion(question: z.infer<typeof RawQuestionSchema>, part = 1): PublicQuestion {
  const declaredType = (question.taskType ?? question.questionType ?? '').toLowerCase();
  let questionType: QuestionType = 'multiple_choice';
  // Bundled cloze choices remain single-choice; never publish a free-text answer as an option.
  if ((question.options.length === 0 && /short_text|fill|blank|cloze/.test(declaredType))
    || (question.options.length > 0 && question.options.every((option) => option.id === 'TEXT'))) {
    questionType = 'short_text';
  } else if (/binary|true_false/.test(declaredType)
    || (question.options.length === 2 && question.options.every((option) => /^(richtig|falsch|ja|nein)$/i.test(option.text.trim())))) {
    questionType = 'binary';
  } else if (/match|zuordnung/.test(declaredType)
    || (question.options.length > 3 && question.options.every((option) => /^[a-j0]$/i.test(option.id)))) {
    questionType = 'matching';
  }
  return PublicQuestionSchema.parse({
    id: question.id,
    order: question.order,
    part: question.part ?? part,
    prompt: question.prompt,
    options: questionType === 'short_text' ? [] : question.options,
    questionType,
    publicExplanation: question.order <= 2 ? question.publicExplanation : undefined,
  });
}

/** Normalize source-only metadata and legacy parts before applying the strict public contract. */
export function normalizeExamFixture(input: unknown): ParsedExamFixture {
  const raw = RawExamFixtureSchema.parse(input);
  const sections: ExamSection[] = raw.sections.flatMap((section) => {
    if (!section.parts) return [ExamSectionSchema.parse({
      sectionId: section.sectionId,
      skill: section.skill,
      title: section.title,
      durationMinutes: section.durationMinutes,
      totalQuestions: section.totalQuestions,
      stimulus: normalizeStimulus(section.stimulus),
      questions: section.questions!.map((question) => normalizeQuestion(question)),
    })];
    return section.parts.map((part) => ExamSectionSchema.parse({
      sectionId: `${section.sectionId}-part-${part.part}`,
      skill: section.skill,
      title: part.title,
      durationMinutes: part.durationMinutes ?? Math.max(1, Math.ceil(section.durationMinutes / section.parts!.length)),
      totalQuestions: part.totalQuestions ?? part.questions.length,
      stimulus: normalizeStimulus(part.stimulus ?? section.stimulus),
      questions: part.questions.map((question) => normalizeQuestion(question, part.part)),
    }));
  });
  const publicPayload = ExamPublicPayloadSchema.parse({ examMetadata: raw.examMetadata, sections });
  const rawQuestions = raw.sections.flatMap((section) => section.questions ?? section.parts!.flatMap((part) => part.questions));
  const questionById = new Map(publicPayload.sections.flatMap((section) => section.questions.map((question) => [question.id, question] as const)));
  const privateExplanations = new Map(rawQuestions.filter((question) => question.order > 2 && question.publicExplanation).map((question) => [question.id, question.publicExplanation]));
  const serverPayload = ServerExamKeyPayloadSchema.parse({
    examId: raw.examMetadata.examId,
    scoringPolicy: { ...raw.examMetadata.scoringPolicy, passPercentage: raw.examMetadata.passPercentage },
    keys: raw.serverGradingKeys.map((key) => ({
      ...key,
      trapExplanationVi: privateExplanations.has(key.questionId) ? `${key.trapExplanationVi}\n\n${privateExplanations.get(key.questionId)}` : key.trapExplanationVi,
    })),
  });
  const policy = serverPayload.scoringPolicy;
  if (policy.minPassingScorePerSkill > Math.min(policy.lesenMaxPoints, policy.hoerenMaxPoints)) {
    throw new Error(`Passing score exceeds skill maximum for ${raw.examMetadata.examId}`);
  }

  if (questionById.size !== rawQuestions.length) throw new Error(`Duplicate question IDs in exam ${raw.examMetadata.examId}`);
  const keyById = new Map(serverPayload.keys.map((key) => [key.questionId, key]));
  if (keyById.size !== serverPayload.keys.length) throw new Error(`Duplicate server grading key IDs in exam ${raw.examMetadata.examId}`);
  if (questionById.size !== keyById.size) throw new Error(`Question/key count mismatch for ${raw.examMetadata.examId}`);
  for (const question of questionById.values()) {
    const key = keyById.get(question.id);
    if (!key) throw new Error(`Missing server grading key for question ${question.id}`);
    if (question.questionType !== 'short_text' && !question.options.some((option) => option.id === key.correctOption)) {
      throw new Error(`Correct option not found for question ${question.id}: ${key.correctOption}`);
    }
  }
  for (const skill of ['Lesen', 'Hoeren'] as const) {
    const skillQuestions = sections.filter((section) => section.skill === skill).flatMap((section) => section.questions);
    if (!skillQuestions.length) continue;
    const actualPoints = skillQuestions.reduce((sum, question) => sum + keyById.get(question.id)!.points, 0);
    const maxPoints = skill === 'Lesen' ? serverPayload.scoringPolicy.lesenMaxPoints : serverPayload.scoringPolicy.hoerenMaxPoints;
    if (Math.abs(actualPoints - maxPoints) > 1e-6) throw new Error(`${skill} points mismatch for ${raw.examMetadata.examId}: ${actualPoints} vs ${maxPoints}`);
  }
  return { raw, publicPayload, serverPayload };
}

export function parseExamFixture(input: unknown): ParsedExamFixture {
  return normalizeExamFixture(input);
}

export function validateExamFixture(input: unknown): ParsedExamFixture {
  return normalizeExamFixture(input);
}

export function createPublicExamPayload(input: unknown) {
  return normalizeExamFixture(input).publicPayload;
}

export function createServerExamKeyPayload(input: unknown) {
  return normalizeExamFixture(input).serverPayload;
}
