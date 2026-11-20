import { z } from 'zod';
import { DialogueTranscriptSchema } from './dialogue.js';

export const QuestionOptionSchema = z
  .object({
    id: z.string().min(1),
    text: z.string().min(1),
  })
  .strict();

export const QuestionTypeSchema = z.enum(['multiple_choice', 'binary', 'matching', 'short_text']);

export const PublicQuestionSchema = z
  .object({
    id: z.string().min(1),
    order: z.number().int().positive(),
    part: z.number().int().positive(),
    prompt: z.string().min(1),
    options: z.array(QuestionOptionSchema),
    questionType: QuestionTypeSchema.optional(),
    publicExplanation: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((question, context) => {
    if (question.questionType !== 'short_text' && question.options.length < 2) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: 'Choice questions require at least two options' });
    }
    if (question.questionType === 'short_text' && question.options.length !== 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: 'Short text questions must not publish answer options' });
    }
    if (new Set(question.options.map((option) => option.id)).size !== question.options.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: 'Option IDs must be unique within a question' });
    }
    if (question.publicExplanation !== undefined && question.order > 2) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['publicExplanation'],
        message: 'publicExplanation is only allowed for questions 1 and 2',
      });
    }
  });

export const ExamStimulusSchema = z
  .object({
    type: z.enum(['text', 'audio']),
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    audioUrl: z.string().min(1).optional(),
    dialogueTranscript: DialogueTranscriptSchema.optional(),
    annotations: z.record(z.string(), z.any()).optional(),
  })
  .strict()
  .superRefine((stimulus, context) => {
    if (stimulus.type === 'text' && !stimulus.content) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: 'Text stimuli require content',
      });
    }
    if (stimulus.type === 'audio' && !stimulus.audioUrl && !stimulus.dialogueTranscript) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['audioUrl'],
        message: 'Audio stimuli require audioUrl or dialogueTranscript',
      });
    }
  });

export const ExamSectionSchema = z
  .object({
    sectionId: z.string().min(1),
    skill: z.enum(['Lesen', 'Hoeren', 'Schreiben', 'Sprechen']),
    title: z.string().min(1),
    durationMinutes: z.number().int().positive(),
    totalQuestions: z.number().int().nonnegative(),
    stimulus: ExamStimulusSchema.optional(),
    questions: z.array(PublicQuestionSchema),
  })
  .strict()
  .superRefine((section, context) => {
    if (section.totalQuestions !== section.questions.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['totalQuestions'],
        message: 'totalQuestions must match questions.length',
      });
    }
  });

export const ScoringPolicySchema = z
  .object({
    lesenMaxPoints: z.number().positive(),
    hoerenMaxPoints: z.number().positive(),
    passPercentage: z.number().min(0).max(100),
    minPassingScorePerSkill: z.number().nonnegative(),
  })
  .strict();

export const ExamMetadataSchema = z
  .object({
    examId: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1']),
    providerFormat: z.string().min(1),
    disclaimer: z.string().min(1),
    totalDurationMinutes: z.number().int().positive(),
    passPercentage: z.number().min(0).max(100),
    scoringPolicy: ScoringPolicySchema.omit({ passPercentage: true }),
  })
  .strict();

export const ExamPublicPayloadSchema = z
  .object({
    examMetadata: ExamMetadataSchema,
    sections: z.array(ExamSectionSchema).min(1),
  })
  .strict();

export const AttemptModeSchema = z.enum(['exam', 'practice']);

export type QuestionOption = z.infer<typeof QuestionOptionSchema>;
export type QuestionType = z.infer<typeof QuestionTypeSchema>;
export type PublicQuestion = z.infer<typeof PublicQuestionSchema>;
export type ExamStimulus = z.infer<typeof ExamStimulusSchema>;
export type ExamSection = z.infer<typeof ExamSectionSchema>;
export type ScoringPolicy = z.infer<typeof ScoringPolicySchema>;
export type ExamMetadata = z.infer<typeof ExamMetadataSchema>;
export type ExamPublicPayload = z.infer<typeof ExamPublicPayloadSchema>;
export type AttemptMode = z.infer<typeof AttemptModeSchema>;
