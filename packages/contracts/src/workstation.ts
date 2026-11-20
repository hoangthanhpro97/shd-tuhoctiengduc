import { z } from 'zod';
import { PublicQuestionSchema } from './exam.js';

export const WorkstationProviderSchema = z.enum(['OSD', 'GOETHE', 'TELC']);
export type WorkstationProvider = z.infer<typeof WorkstationProviderSchema>;

export const WorkstationLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2']);
export type WorkstationLevel = z.infer<typeof WorkstationLevelSchema>;

export const WorkstationSkillSchema = z.enum(['lesen', 'hoeren']);
export type WorkstationSkill = z.infer<typeof WorkstationSkillSchema>;

export const WorkstationModeSchema = z.enum(['exam', 'practice']);
export type WorkstationMode = z.infer<typeof WorkstationModeSchema>;

export const WorkstationTranscriptTurnSchema = z
  .object({
    speakerId: z.string().min(1),
    speakerName: z.string().min(1),
    timestampStart: z.number().nonnegative().optional(),
    timestampEnd: z.number().nonnegative().optional(),
    textDe: z.string().min(1),
    textVi: z.string().optional(),
    roleSide: z.enum(['left', 'right']).optional(),
  })
  .strict();
export type WorkstationTranscriptTurn = z.infer<typeof WorkstationTranscriptTurnSchema>;

export const WorkstationListeningStimulusSchema = z
  .object({
    type: z.literal('audio'),
    title: z.string().optional(),
    audioUrl: z.string().optional(),
    playCount: z.union([z.literal(1), z.literal(2)]).default(2),
    situationDe: z.string().optional(),
    situationVi: z.string().optional(),
    transcriptTurns: z.array(WorkstationTranscriptTurnSchema).optional(),
  })
  .strict();
export type WorkstationListeningStimulus = z.infer<typeof WorkstationListeningStimulusSchema>;

export const WorkstationReadingStimulusSchema = z
  .object({
    type: z.literal('text'),
    title: z.string().optional(),
    content: z.string(),
    annotations: z.record(z.string(), z.any()).optional(),
  })
  .strict();
export type WorkstationReadingStimulus = z.infer<typeof WorkstationReadingStimulusSchema>;

export const WorkstationSectionSchema = z
  .object({
    part: z.number().int().positive(),
    title: z.string().min(1),
    skill: WorkstationSkillSchema,
    stimulus: z.union([WorkstationReadingStimulusSchema, WorkstationListeningStimulusSchema]).optional(),
    questions: z.array(PublicQuestionSchema),
    instructionDe: z.string().optional(),
    instructionVi: z.string().optional(),
  })
  .strict();
export type WorkstationSection = z.infer<typeof WorkstationSectionSchema>;

export const WorkstationPayloadSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    provider: WorkstationProviderSchema,
    level: WorkstationLevelSchema,
    skill: WorkstationSkillSchema,
    mode: WorkstationModeSchema,
    durationSeconds: z.number().int().positive().nullable(),
    sections: z.array(WorkstationSectionSchema).min(1),
  })
  .strict();
export type WorkstationPayload = z.infer<typeof WorkstationPayloadSchema>;

export interface WorkstationPolicy {
  allowSeekAudio: boolean;
  enforcePlayCount: boolean;
  showTranscriptToggle: boolean;
  enableContextualLookup: boolean;
  enableTaskGuide: boolean;
  enableInstantCheck: boolean;
  timerBehavior: 'countdown' | 'stopwatch';
}

export function resolveWorkstationPolicy(
  skill: WorkstationSkill,
  mode: WorkstationMode
): WorkstationPolicy {
  const isExam = mode === 'exam';
  const isListening = skill === 'hoeren';

  return {
    allowSeekAudio: !isExam || !isListening,
    enforcePlayCount: isExam && isListening,
    showTranscriptToggle: !isExam && isListening,
    enableContextualLookup: true,
    enableTaskGuide: true,
    enableInstantCheck: !isExam,
    timerBehavior: isExam ? 'countdown' : 'stopwatch',
  };
}
