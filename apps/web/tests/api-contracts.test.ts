import { describe, expect, it } from 'vitest';
import { ExamPublicPayloadSchema, LeadGatePayloadSchema, SaveAnswerPayloadSchema } from '@shd/contracts';

describe('web API contract boundaries', () => {
  it('accepts autosave only with an explicit non-negative revision', () => {
    expect(SaveAnswerPayloadSchema.parse({ questionId: 'q-1', selectedOption: 'A', revision: 0 })).toMatchObject({
      questionId: 'q-1',
      revision: 0,
      timeSpentSeconds: 0,
    });
    expect(() => SaveAnswerPayloadSchema.parse({ questionId: 'q-1', selectedOption: 'A', revision: -1 })).toThrow();
  });

  it('requires education consent and parent phone for under-18 gate payloads', () => {
    expect(() => LeadGatePayloadSchema.parse({
      fullName: 'Learner', phoneNumber: '0912345678', birthYear: 2012, ageGroup: 'student_under18', learningTarget: 'B1', consentShdEducation: true,
    })).toThrow();
    expect(LeadGatePayloadSchema.parse({
      fullName: 'Learner', phoneNumber: '0912345678', birthYear: 2012, ageGroup: 'student_under18', learningTarget: 'B1', parentPhoneNumber: '0987654321', consentShdEducation: true,
    })).toMatchObject({ consentShdEducation: true });
  });

  it('rejects answer keys in a public exam payload', () => {
    const payload = {
      examMetadata: {
        examId: 'exam', slug: 'exam', title: 'Exam', cefrLevel: 'B1', providerFormat: 'Demo', disclaimer: 'Demo', totalDurationMinutes: 30, passPercentage: 60,
        scoringPolicy: { lesenMaxPoints: 10, hoerenMaxPoints: 10, minPassingScorePerSkill: 2 },
      },
      sections: [{ sectionId: 's1', skill: 'Lesen', title: 'Lesen', durationMinutes: 30, totalQuestions: 1, questions: [{ id: 'q1', order: 1, part: 1, prompt: 'Prompt', options: [{ id: 'A', text: 'A' }, { id: 'B', text: 'B' }], publicExplanation: 'Preview' }] }],
    };
    expect(() => ExamPublicPayloadSchema.parse({ ...payload, answer_key: 'B' })).toThrow();
  });
});
