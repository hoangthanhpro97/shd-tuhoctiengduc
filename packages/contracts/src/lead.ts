import { z } from 'zod';

export const VietnamesePhoneNumberSchema = z
  .string()
  .regex(/^(03|05|07|08|09)\d{8}$/, 'Phone number must be a valid 10-digit Vietnamese mobile number');

export const AgeGroupSchema = z.enum(['student_under18', 'university', 'worker', 'parent']);

export const UnlockResultPayloadSchema = z
  .object({
    fullName: z.string().trim().min(1),
    phoneNumber: VietnamesePhoneNumberSchema,
    birthYear: z.number().int().min(1900).max(new Date().getFullYear()),
    ageGroup: AgeGroupSchema,
    learningTarget: z.string().trim().min(1),
    parentPhoneNumber: VietnamesePhoneNumberSchema.optional(),
  })
  .strict()
  .superRefine((payload, context) => {
    if (payload.ageGroup === 'student_under18' && !payload.parentPhoneNumber) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['parentPhoneNumber'],
        message: 'parentPhoneNumber is required for learners under 18',
      });
    }
  });

export const GranularConsentSchema = z
  .object({
    consentShdEducation: z.literal(true),
    consentShdCareer: z.boolean().default(false),
  })
  .strict();

export const LeadGatePayloadSchema = UnlockResultPayloadSchema.and(GranularConsentSchema);

export const IssueOtpPayloadSchema = z
  .object({
    phoneNumber: VietnamesePhoneNumberSchema,
    channel: z.enum(['sms', 'zalo_zns']).default('sms'),
  })
  .strict();

export const IssueOtpResponseSchema = z
  .object({
    challengeId: z.string().uuid(),
    maskedPhoneNumber: z.string().min(1),
    expiresAt: z.string().datetime(),
  })
  .strict();

export const VerifyOtpPayloadSchema = z
  .object({
    challengeId: z.string().uuid(),
    code: z.string().regex(/^\d{6}$/u),
    consentShdCareer: z.boolean().default(false),
  })
  .strict();

export const UnlockResponseSchema = z
  .object({
    unlocked: z.literal(true),
    review: z.unknown(),
  })
  .strict();

export type VietnamesePhoneNumber = z.infer<typeof VietnamesePhoneNumberSchema>;
export type AgeGroup = z.infer<typeof AgeGroupSchema>;
export type UnlockResultPayload = z.infer<typeof UnlockResultPayloadSchema>;
export type GranularConsent = z.infer<typeof GranularConsentSchema>;
export type LeadGatePayload = z.infer<typeof LeadGatePayloadSchema>;
export type IssueOtpPayload = z.infer<typeof IssueOtpPayloadSchema>;
export type IssueOtpResponse = z.infer<typeof IssueOtpResponseSchema>;
export type VerifyOtpPayload = z.infer<typeof VerifyOtpPayloadSchema>;
export type UnlockResponse = z.infer<typeof UnlockResponseSchema>;
