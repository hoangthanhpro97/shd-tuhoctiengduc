import { z } from 'zod';

export const WritingExamProviderSchema = z.enum([
  'goethe_b1',
  'goethe_b2',
  'osd_zb1',
  'osd_zdo_b1',
  'osd_zb2',
]);

export const WritingTaskTypeSchema = z.enum([
  'INFORMAL_EMAIL',
  'FORUM_POST',
  'FORMAL_EMAIL',
  'REPLY_EMAIL',
  'FORMAL_MESSAGE',
  'ARGUMENTATIVE_TEXT',
]);

export const WritingRequirementSchema = z.object({
  textDe: z.string(),
  textVi: z.string(),
  functionLabel: z.string(),
});

export const WritingTaskSchema = z.object({
  id: z.string(),
  slug: z.string(),
  examProvider: WritingExamProviderSchema,
  level: z.enum(['B1', 'B2']),
  part: z.number().int().min(1).max(3),
  partLabel: z.string(),
  taskType: WritingTaskTypeSchema,
  title: z.string(),
  topic: z.string(),
  durationSeconds: z.number().int().positive(),
  durationScope: z.enum(['TASK', 'MODULE']),
  instructionDe: z.string(),
  instructionVi: z.string(),
  bulletPoints: z.array(z.string()),
  requirements: z.array(WritingRequirementSchema),
  writingTarget: z.object({
    approximateWords: z.number().int().positive().nullable(),
    register: z.enum(['informal', 'formal', 'semi_formal', 'neutral']),
    textTypeLabel: z.string(),
  }),
  outline: z.array(z.object({
    section: z.string(),
    suggestionDe: z.string(),
    tipVi: z.string().optional(),
  })),
  modelAnswer: z.object({
    textDe: z.string(),
    textVi: z.string(),
    annotations: z.array(z.object({
      phraseDe: z.string(),
      explanationVi: z.string(),
    })).optional(),
  }),
  redemittel: z.array(z.object({
    phraseDe: z.string(),
    phraseVi: z.string(),
    category: z.string(),
  })),
  exercise: z.object({
    questionVi: z.string(),
    choices: z.array(z.string()),
    correctIndex: z.number().int().nonnegative(),
  }).optional(),
  rubric: z.object({
    rubricId: z.string(),
    provider: WritingExamProviderSchema,
    criteria: z.array(z.object({
      key: z.string(),
      labelDe: z.string(),
      explanationVi: z.string(),
      maxPoints: z.number().nullable().optional(),
    })),
  }),
  source: z.object({
    contentOrigin: z.enum(['SHD_AUTHORED', 'LICENSED', 'OFFICIAL_LINKED']),
    isOfficialExamTask: z.boolean(),
    officialInfoUrl: z.string().url().optional(),
    reviewerId: z.string().optional(),
    reviewedAt: z.string().optional(),
  }),
});

export type WritingTask = z.infer<typeof WritingTaskSchema>;
