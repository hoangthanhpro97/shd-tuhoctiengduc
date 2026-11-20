import { z } from 'zod';

export const SpeakingTaskTypeSchema = z.enum([
  'PLAN_DIALOG',
  'PRESENTATION_SLIDES',
  'FEEDBACK_QA',
]);

export const SpeakingExamProviderSchema = z.enum(['goethe_b1', 'osd_zb1', 'osd_zdo_b1']);

export const SpeakingTaskSchema = z.object({
  id: z.string(),
  slug: z.string(),
  examProvider: SpeakingExamProviderSchema,
  level: z.literal('B1'),
  part: z.number().int().min(1).max(3),
  taskType: SpeakingTaskTypeSchema,
  title: z.string(),
  topic: z.string(),
  durationSeconds: z.number(),
  instructionDe: z.string(),
  instructionVi: z.string(),
  bulletPoints: z.array(z.string()),
  dialogueTurns: z.array(z.object({
    speaker: z.enum(['A', 'B']),
    textDe: z.string(),
    textVi: z.string(),
    functionLabel: z.string(),
  })).optional(),
  slides: z.array(z.object({
    folieNumber: z.number(),
    titleDe: z.string(),
    titleVi: z.string(),
    contentDe: z.string(),
    contentVi: z.string(),
    pedagogicalTip: z.string(),
  })).optional(),
  feedbackCards: z.array(z.object({
    category: z.string(),
    phraseDe: z.string(),
    phraseVi: z.string(),
  })).optional(),
  redemittel: z.array(z.object({
    phraseDe: z.string(),
    phraseVi: z.string(),
    category: z.string(),
  })),
  audioUrl: z.string().optional(),
});

export type SpeakingTask = z.infer<typeof SpeakingTaskSchema>;
