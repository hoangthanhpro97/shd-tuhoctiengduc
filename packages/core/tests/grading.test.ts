import { describe, expect, it } from 'vitest';
import { evaluateAttemptUseCase, type GradingRepository, type GradingSnapshot } from '../src/index.js';

function createSnapshot(expiresAt = new Date('2026-11-04T00:00:00.000Z')): GradingSnapshot {
  return {
    attemptId: 'attempt-1',
    status: 'submitted',
    submissionType: 'manual',
    expiresAt,
    passingPercentage: 60,
    minPassingScorePerSkill: 6,
    levelCode: 'B1',
    sections: [
      {
        databaseSectionId: 'db-section-lesen',
        sectionId: 'section-lesen',
        skill: 'Lesen',
        sectionOrder: 1,
        maxScore: 10,
        questions: [
          {
            databaseQuestionId: 'db-q-1',
            questionId: 'q-1',
            sectionId: 'section-lesen',
            sourceSectionId: 'section-lesen',
            skill: 'Lesen',
            order: 1,
            part: 1,
            points: 5,
            selectedOption: null,
            correctOption: 'A',
          },
          {
            databaseQuestionId: 'db-q-2',
            questionId: 'q-2',
            sectionId: 'section-lesen',
            sourceSectionId: 'section-lesen',
            skill: 'Lesen',
            order: 2,
            part: 1,
            points: 5,
            selectedOption: null,
            correctOption: 'B',
          },
        ],
      },
      {
        databaseSectionId: 'db-section-hoeren',
        sectionId: 'section-hoeren',
        skill: 'Hoeren',
        sectionOrder: 2,
        maxScore: 10,
        questions: [
          {
            databaseQuestionId: 'db-q-3',
            questionId: 'q-3',
            sectionId: 'section-hoeren',
            sourceSectionId: 'section-hoeren',
            skill: 'Hoeren',
            order: 1,
            part: 1,
            points: 5,
            selectedOption: null,
            correctOption: 'C',
          },
          {
            databaseQuestionId: 'db-q-4',
            questionId: 'q-4',
            sectionId: 'section-hoeren',
            sourceSectionId: 'section-hoeren',
            skill: 'Hoeren',
            order: 2,
            part: 1,
            points: 5,
            selectedOption: null,
            correctOption: 'A',
          },
        ],
      },
    ],
  };
}

function repository(snapshot: GradingSnapshot) {
  let persisted: unknown;
  const implementation: GradingRepository = {
    async loadGradingSnapshot() {
      return snapshot;
    },
    async persistGradingResult(_attemptId, record) {
      persisted = record;
    },
  };
  return { implementation, getPersisted: () => persisted };
}

const answers = (values: Record<string, string>) => ({
  attemptId: 'attempt-1',
  userAnswers: Object.entries(values).map(([questionId, selectedOption]) => ({ questionId, selectedOption })),
  timeSpentPerItem: Object.fromEntries(Object.keys(values).map((questionId) => [questionId, 10])),
});

describe('evaluateAttemptUseCase', () => {
  it('returns maximum score and passes all section thresholds', async () => {
    const repo = repository(createSnapshot());
    const result = await evaluateAttemptUseCase({
      payload: answers({ 'q-1': 'A', 'q-2': 'B', 'q-3': 'C', 'q-4': 'A' }),
      repository: repo.implementation,
      now: new Date('2026-11-03T23:00:00.000Z'),
    });

    expect(result.totalScore).toBe(20);
    expect(result.maxPossibleScore).toBe(20);
    expect(result.percentage).toBe(100);
    expect(result.isPassed).toBe(true);
    expect(result.sectionScores).toEqual([
      { sectionId: 'section-lesen', score: 10, maxScore: 10, percentage: 100 },
      { sectionId: 'section-hoeren', score: 10, maxScore: 10, percentage: 100 },
    ]);
  });

  it('returns zero score when every answer is wrong', async () => {
    const repo = repository(createSnapshot());
    const result = await evaluateAttemptUseCase({
      payload: answers({ 'q-1': 'B', 'q-2': 'A', 'q-3': 'A', 'q-4': 'B' }),
      repository: repo.implementation,
    });

    expect(result.totalScore).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.isPassed).toBe(false);
    expect(result.benchmarkStatusCode).toBe('not_pass');
  });

  it('marks a submission after the server expiry as timeout', async () => {
    const repo = repository(createSnapshot(new Date('2026-11-03T23:00:00.000Z')));
    const result = await evaluateAttemptUseCase({
      payload: answers({ 'q-1': 'A', 'q-2': 'B' }),
      repository: repo.implementation,
      now: new Date('2026-11-04T00:00:00.000Z'),
    });

    expect(result.submissionType).toBe('timeout');
    expect(result.totalScore).toBe(10);
    expect(result.sectionScores[1]).toEqual({ sectionId: 'section-hoeren', score: 0, maxScore: 10, percentage: 0 });
    expect(result.isPassed).toBe(false);
  });

  it('fails when one skill is below the per-skill threshold despite a passing total', async () => {
    const repo = repository(createSnapshot());
    const result = await evaluateAttemptUseCase({
      payload: answers({ 'q-1': 'A', 'q-2': 'B', 'q-3': 'C', 'q-4': 'B' }),
      repository: repo.implementation,
    });

    expect(result.percentage).toBe(75);
    expect(result.isPassed).toBe(false);
  });

  it('persists item and section scores without exposing keys in the public result', async () => {
    const repo = repository(createSnapshot());
    const result = await evaluateAttemptUseCase({
      payload: answers({ 'q-1': 'A', 'q-2': 'B', 'q-3': 'C', 'q-4': 'A' }),
      repository: repo.implementation,
    });
    const persisted = repo.getPersisted() as { itemScores: unknown[]; sectionScores: unknown[] };

    expect(persisted.itemScores).toHaveLength(4);
    expect(persisted.sectionScores).toHaveLength(2);
    expect(JSON.stringify(result)).not.toContain('correctOption');
    expect(JSON.stringify(result)).not.toContain('trapExplanationVi');
  });

  it('applies the passing threshold per skill when a skill spans multiple part-sections', async () => {
    const snapshot = createSnapshot();
    const lesen = snapshot.sections[0];
    snapshot.sections = [
      { ...lesen, questions: [lesen.questions[0]], maxScore: 5 },
      { ...lesen, sectionId: 'section-lesen-2', databaseSectionId: 'db-section-lesen-2', questions: [{ ...lesen.questions[1], sectionId: 'section-lesen-2' }], maxScore: 5 },
      snapshot.sections[1],
    ];
    const result = await evaluateAttemptUseCase({
      payload: answers({ 'q-1': 'A', 'q-2': 'B', 'q-3': 'C', 'q-4': 'A' }),
      repository: repository(snapshot).implementation,
    });
    expect(result.isPassed).toBe(true);
    expect(result.sectionScores).toHaveLength(3);
  });
});
