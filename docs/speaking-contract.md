# Speaking Module Data Contract

## 1. Zod Schema
```typescript
import { z } from "zod";

export const SpeakingTaskTypeSchema = z.enum([
  "PLAN_DIALOG",          // Teil 1: Hội thoại phân vai 2 người
  "PRESENTATION_SLIDES",  // Teil 2: Thuyết trình theo 5 Folien
  "FEEDBACK_QA"           // Teil 3: Nhận xét và hỏi đáp
]);

export const SpeakingExamProviderSchema = z.enum(["goethe_b1", "osd_zb1", "osd_zdo_b1"]);

export const SpeakingTaskSchema = z.object({
  id: z.string(),
  slug: z.string(),
  examProvider: SpeakingExamProviderSchema,
  level: z.literal("B1"),
  part: z.number().int().min(1).max(3),
  taskType: SpeakingTaskTypeSchema,
  title: z.string(),
  topic: z.string(),
  durationSeconds: z.number(),
  instructionDe: z.string(),
  instructionVi: z.string(),
  bulletPoints: z.array(z.string()),
  
  // Dành cho Teil 1 (PLAN_DIALOG)
  dialogueTurns: z.array(z.object({
    speaker: z.enum(["A", "B"]),
    textDe: z.string(),
    textVi: z.string(),
    functionLabel: z.string(),
  })).optional(),
  
  // Dành cho Teil 2 (PRESENTATION_SLIDES)
  slides: z.array(z.object({
    folieNumber: z.number(),
    titleDe: z.string(),
    titleVi: z.string(),
    contentDe: z.string(),
    contentVi: z.string(),
    pedagogicalTip: z.string(),
  })).optional(),
  
  // Dành cho Teil 3 (FEEDBACK_QA)
  feedbackCards: z.array(z.object({
    category: z.string(),
    phraseDe: z.string(),
    phraseVi: z.string(),
  })).optional(),
  
  // Dùng chung cho cả 3 Teil
  redemittel: z.array(z.object({
    phraseDe: z.string(),
    phraseVi: z.string(),
    category: z.string(),
  })),
  audioUrl: z.string().optional(),
});

export type SpeakingTask = z.infer<typeof SpeakingTaskSchema>;