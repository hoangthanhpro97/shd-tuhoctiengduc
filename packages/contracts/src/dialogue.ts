import { z } from 'zod';

export const DialogueTurnSchema = z
  .object({
    speakerId: z.string().min(1),
    roleSide: z.enum(['Left', 'Right']),
    speakerName: z.string().min(1),
    timestampStart: z.number().finite().nonnegative(),
    timestampEnd: z.number().finite().nonnegative(),
    textDe: z.string().min(1),
    textVi: z.string().min(1),
    textEn: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((turn, context) => {
    if (turn.timestampEnd < turn.timestampStart) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['timestampEnd'],
        message: 'timestampEnd must be greater than or equal to timestampStart',
      });
    }
  });

export const DialogueTranscriptSchema = z.array(DialogueTurnSchema);

export type DialogueTurn = z.infer<typeof DialogueTurnSchema>;
export type DialogueTranscript = z.infer<typeof DialogueTranscriptSchema>;
