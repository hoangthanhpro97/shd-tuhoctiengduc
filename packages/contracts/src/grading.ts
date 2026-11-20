import { z } from 'zod';
import { ScoringPolicySchema } from './exam.js';

export const QuestionKeyDetailSchema = z
  .object({
    questionId: z.string().min(1),
    correctOption: z.string().min(1),
    points: z.number().finite().positive(),
    citation: z.string().min(1),
    trapExplanationVi: z.string().min(1),
    tags: z.array(z.string().min(1)).min(1).default(['General']),
  })
  .strict();

export const ServerExamKeyPayloadSchema = z
  .object({
    examId: z.string().min(1),
    scoringPolicy: ScoringPolicySchema,
    keys: z.array(QuestionKeyDetailSchema).min(1),
  })
  .strict();

export const SubmitAttemptAnswerSchema = z
  .object({
    questionId: z.string().min(1),
    selectedOption: z.string().min(1).nullable(),
  })
  .strict();

export const SubmitAttemptPayloadSchema = z
  .object({
    attemptId: z.string().min(1),
    userAnswers: z.array(SubmitAttemptAnswerSchema),
    timeSpentPerItem: z.record(z.string().min(1), z.number().finite().nonnegative()),
  })
  .strict()
  .superRefine((payload, context) => {
    const ids = payload.userAnswers.map((answer) => answer.questionId);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['userAnswers'],
        message: 'userAnswers must not contain duplicate questionId values',
      });
    }
  });

export const SaveAnswerPayloadSchema = z
  .object({
    questionId: z.string().min(1),
    selectedOption: z.string().min(1).nullable(),
    revision: z.number().int().nonnegative(),
    timeSpentSeconds: z.number().finite().nonnegative().default(0),
  })
  .strict();

export const AttemptStateAnswerSchema = z
  .object({
    questionId: z.string().min(1),
    selectedOption: z.string().min(1).nullable(),
    revision: z.number().int().positive(),
    answeredAt: z.string().datetime(),
  })
  .strict();

export const AttemptStatePayloadSchema = z
  .object({
    attemptId: z.string().min(1),
    examId: z.string().min(1),
    slug: z.string().min(1),
    versionId: z.string().min(1),
    mode: z.enum(['exam', 'practice']).default('exam'),
    sectionFilter: z.enum(['lesen', 'hoeren', 'all']).default('all'),
    status: z.enum(['in_progress', 'submitted', 'graded']),
    startedAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
    serverNow: z.string().datetime(),
    answers: z.array(AttemptStateAnswerSchema),
  })
  .strict();

export const AttemptStartResponseSchema = z
  .object({
    attemptId: z.string().min(1),
    examSlug: z.string().min(1),
    startedAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
    serverNow: z.string().datetime(),
    status: z.literal('in_progress'),
    sectionFilter: z.enum(['lesen', 'hoeren', 'all']).default('all'),
  })
  .strict();

export const ReviewItemSchema = z
  .object({
    questionId: z.string().min(1),
    selectedOption: z.string().min(1).nullable(),
    access: z.enum(['open', 'locked', 'full']),
    isCorrect: z.boolean().nullable(),
    correctOption: z.string().min(1).nullable(),
    citation: z.string().min(1).nullable(),
    trapExplanationVi: z.string().min(1).nullable(),
    tags: z.array(z.string()).nullable(),
    explanation: z.string().min(1).nullable(),
    learningMetadata: z.object({
      keywordAnalysis: z.array(z.string().min(1)),
      evidenceAnchorId: z.string().min(1).nullable(),
      audioStartMs: z.number().finite().nonnegative().nullable(),
      audioEndMs: z.number().finite().nonnegative().nullable(),
      transcriptId: z.string().min(1).nullable(),
      paraphrases: z.array(z.object({ questionPhrase: z.string().min(1), sourcePhrase: z.string().min(1), note: z.string().min(1) }).strict()),
      vocabulary: z.array(z.object({
        id: z.string().min(1),
        term: z.string().min(1),
        article: z.enum(['der', 'die', 'das']).optional(),
        plural: z.string().min(1).optional(),
        partOfSpeech: z.string().min(1),
        ipa: z.string().min(1),
        definitionVi: z.string().min(1),
        contextVi: z.string().min(1),
        exampleDe: z.string().min(1),
        exampleVi: z.string().min(1),
      }).strict()),
      steps: z.array(z.object({ title: z.string().min(1), content: z.string().min(1) }).strict()),
    }).strict().optional().nullable(),
  })
  .strict();

export const AttemptReviewPayloadSchema = z
  .object({
    attemptId: z.string().min(1),
    unlocked: z.boolean(),
    items: z.array(ReviewItemSchema),
  })
  .strict();

export const SectionScoreSchema = z
  .object({
    sectionId: z.string().min(1),
    score: z.number().finite().nonnegative(),
    maxScore: z.number().finite().positive(),
    percentage: z.number().finite().min(0).max(100),
  })
  .strict()
  .superRefine((score, context) => {
    if (score.score > score.maxScore) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['score'],
        message: 'score cannot exceed maxScore',
      });
    }
  });

export const UnlockedSolutionSchema = z
  .object({
    questionId: z.string().min(1),
    selectedOption: z.string().min(1).nullable(),
    correctOption: z.string().min(1),
    isCorrect: z.boolean(),
    explanation: z.string().min(1),
  })
  .strict();

export const AttemptResultPayloadSchema = z
  .object({
    attemptId: z.string().min(1),
    totalScore: z.number().finite().nonnegative(),
    maxPossibleScore: z.number().finite().positive(),
    percentage: z.number().finite().min(0).max(100),
    isPassed: z.boolean(),
    submissionType: z.enum(['manual', 'timeout']).optional(),
    benchmarkStatusCode: z.enum(['pass', 'near_pass', 'not_pass']).optional(),
    cefrEstimateCode: z.string().min(1).optional(),
    sectionScores: z.array(SectionScoreSchema),
    unlockedSolutions: z.array(UnlockedSolutionSchema),
  })
  .strict()
  .superRefine((result, context) => {
    if (result.totalScore > result.maxPossibleScore) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['totalScore'],
        message: 'totalScore cannot exceed maxPossibleScore',
      });
    }
  });

export const AttemptResultPublicPayloadSchema = z
  .object({
    attemptId: z.string().min(1),
    totalScore: z.number().finite().nonnegative(),
    maxPossibleScore: z.number().finite().nonnegative(),
    percentage: z.number().finite().min(0).max(100),
    isPassed: z.boolean(),
    benchmarkStatusCode: z.enum(['pass', 'near_pass', 'not_pass']),
    cefrEstimateCode: z.string().min(1),
    sectionScores: z.array(SectionScoreSchema),
    review: AttemptReviewPayloadSchema,
  })
  .strict()
  .superRefine((result, context) => {
    if (result.totalScore > result.maxPossibleScore) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['totalScore'],
        message: 'totalScore cannot exceed maxPossibleScore',
      });
    }
  });

export type QuestionKeyDetail = z.infer<typeof QuestionKeyDetailSchema>;
export type ServerExamKeyPayload = z.infer<typeof ServerExamKeyPayloadSchema>;
export type SubmitAttemptAnswer = z.infer<typeof SubmitAttemptAnswerSchema>;
export type SubmitAttemptPayload = z.infer<typeof SubmitAttemptPayloadSchema>;
export type SaveAnswerPayload = z.infer<typeof SaveAnswerPayloadSchema>;
export type AttemptStateAnswer = z.infer<typeof AttemptStateAnswerSchema>;
export type AttemptStatePayload = z.infer<typeof AttemptStatePayloadSchema>;
export type AttemptStartResponse = z.infer<typeof AttemptStartResponseSchema>;
export type ReviewItem = z.infer<typeof ReviewItemSchema>;
export type AttemptReviewPayload = z.infer<typeof AttemptReviewPayloadSchema>;
export type SectionScore = z.infer<typeof SectionScoreSchema>;
export type UnlockedSolution = z.infer<typeof UnlockedSolutionSchema>;
export type AttemptResultPayload = z.infer<typeof AttemptResultPayloadSchema>;
export type AttemptResultPublicPayload = z.infer<typeof AttemptResultPublicPayloadSchema>;
