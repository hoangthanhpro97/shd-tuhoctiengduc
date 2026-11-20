import { z } from 'zod';

export const ProblemCodeSchema = z.enum([
  'VALIDATION_FAILED',
  'NOT_FOUND',
  'FORBIDDEN',
  'CONFLICT',
  'RATE_LIMITED',
  'IDEMPOTENCY_CONFLICT',
  'OTP_INVALID',
  'OTP_EXPIRED',
  'CONSENT_REQUIRED',
  'ATTEMPT_NOT_OWNED',
  'ATTEMPT_ALREADY_SUBMITTED',
  'INTERNAL_ERROR',
  'REVISION_CONFLICT',
  'ATTEMPT_EXPIRED',
  'AUDIO_LIMIT_EXCEEDED',
  'UNAUTHORIZED',
  'CONTENT_NOT_PUBLISHED',
]);

export const ProblemDetailsSchema = z
  .object({
    type: z.string().url().or(z.literal('about:blank')),
    title: z.string().min(1),
    status: z.number().int().min(400).max(599),
    detail: z.string().min(1).optional(),
    code: ProblemCodeSchema,
    instance: z.string().min(1).optional(),
  })
  .strict();

export type ProblemCode = z.infer<typeof ProblemCodeSchema>;
export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;

export function createProblemDetails(
  status: number,
  title: string,
  code: ProblemCode,
  detail?: string,
  instance?: string,
  type = 'about:blank',
): ProblemDetails {
  return ProblemDetailsSchema.parse({ type, title, status, code, detail, instance });
}
