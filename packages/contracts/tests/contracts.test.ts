import { describe, expect, it } from 'vitest';
import {
  ExamPublicPayloadSchema,
  GranularConsentSchema,
  AttemptModeSchema,
  AttemptStatePayloadSchema,
  AttemptReviewPayloadSchema,
  ProblemDetailsSchema,
  UnlockResultPayloadSchema,
  createProblemDetails,
} from '../src/index.js';

describe('Contracts Package', () => {
  it('creates an RFC 7807 problem details object', () => {
    const error = createProblemDetails(409, 'Revision conflict', 'REVISION_CONFLICT', 'Invalid revision');

    expect(ProblemDetailsSchema.parse(error)).toEqual(error);
    expect(error.status).toBe(409);
    expect(error.code).toBe('REVISION_CONFLICT');
  });

  it('rejects public explanations after question two', () => {
    const result = ExamPublicPayloadSchema.safeParse({
      examMetadata: {
        examId: 'exam-1',
        slug: 'exam-1',
        title: 'Demo exam',
        cefrLevel: 'B1',
        providerFormat: 'Demo',
        disclaimer: 'Demo only',
        totalDurationMinutes: 60,
        passPercentage: 60,
        scoringPolicy: {
          lesenMaxPoints: 30,
          hoerenMaxPoints: 30,
          minPassingScorePerSkill: 6,
        },
      },
      sections: [
        {
          sectionId: 'lesen',
          skill: 'Lesen',
          title: 'Lesen',
          durationMinutes: 30,
          totalQuestions: 1,
          questions: [
            {
              id: 'q-3',
              order: 3,
              part: 1,
              prompt: 'Question',
              options: [
                { id: 'A', text: 'A' },
                { id: 'B', text: 'B' },
              ],
              publicExplanation: 'Must remain locked',
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('requires the SHD Education consent', () => {
    expect(() => GranularConsentSchema.parse({ consentShdEducation: false })).toThrow();
    expect(GranularConsentSchema.parse({ consentShdEducation: true })).toEqual({
      consentShdEducation: true,
      consentShdCareer: false,
    });
  });

  it('accepts only exam and practice attempt modes', () => {
    expect(AttemptModeSchema.parse('exam')).toBe('exam');
    expect(AttemptModeSchema.parse('practice')).toBe('practice');
    expect(() => AttemptModeSchema.parse('preview')).toThrow();
  });

  it('keeps learning metadata nullable and access-safe for locked review items', () => {
    const locked = AttemptReviewPayloadSchema.parse({
      attemptId: 'attempt-1',
      unlocked: false,
      items: [{
        questionId: 'q-3',
        selectedOption: 'A',
        access: 'locked',
        isCorrect: null,
        correctOption: null,
        citation: null,
        trapExplanationVi: null,
        tags: null,
        explanation: null,
      }],
    });
    expect(locked.items[0].learningMetadata).toBeUndefined();

    const state = AttemptStatePayloadSchema.parse({
      attemptId: 'attempt-1',
      examId: 'exam-1',
      slug: 'demo',
      versionId: 'version-1',
      mode: 'practice',
      status: 'in_progress',
      startedAt: '2026-01-01T00:00:00.000Z',
      expiresAt: '2026-01-01T01:00:00.000Z',
      serverNow: '2026-01-01T00:00:00.000Z',
      answers: [],
    });
    expect(state.mode).toBe('practice');
  });

  it('requires a parent phone for an under-18 learner', () => {
    const base = {
      fullName: 'Demo Learner',
      phoneNumber: '0912345678',
      birthYear: 2010,
      ageGroup: 'student_under18' as const,
      learningTarget: 'B1',
    };

    expect(() => UnlockResultPayloadSchema.parse(base)).toThrow();
    expect(UnlockResultPayloadSchema.parse({ ...base, parentPhoneNumber: '0987654321' })).toMatchObject(base);
  });
});
