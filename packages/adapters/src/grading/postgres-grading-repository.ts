import type { GradingPersistenceRecord, GradingRepository, GradingSnapshot } from '@shd/core';
import type pg from 'pg';

type SnapshotRow = { load_grading_snapshot: unknown };

export class PostgresGradingRepository implements GradingRepository {
  constructor(private readonly client: Pick<pg.PoolClient, 'query'>) {}

  async loadGradingSnapshot(attemptId: string): Promise<GradingSnapshot> {
    const result = await this.client.query<SnapshotRow>('SELECT load_grading_snapshot($1) AS load_grading_snapshot', [attemptId]);
    const snapshot = result.rows[0]?.load_grading_snapshot;
    if (!snapshot || typeof snapshot !== 'object') {
      throw new Error('Grading snapshot function returned an invalid payload');
    }
    return normalizeSnapshot(snapshot as Record<string, unknown>);
  }

  async persistGradingResult(attemptId: string, record: GradingPersistenceRecord): Promise<void> {
    await this.client.query(
      'SELECT persist_grading_result($1, $2::jsonb)',
      [
        attemptId,
        JSON.stringify({
          ...record.result,
          totalScore: record.totalScore,
          maxPossibleScore: record.maxPossibleScore,
          percentage: record.percentage,
          passingPercentage: record.passingPercentage,
          cefrEstimateCode: record.cefrEstimateCode,
          benchmarkStatusCode: record.benchmarkStatusCode,
          sectionScores: record.sectionScores.map((section) => ({
            section_id: section.databaseSectionId,
            score: section.score,
            max_score: section.maxScore,
            cefr_code: section.cefrCode,
          })),
          itemScores: record.itemScores.map((item) => ({
            question_id: item.databaseQuestionId,
            is_correct: item.isCorrect,
            earned_points: item.earnedPoints,
          })),
        }),
      ],
    );
  }
}

function normalizeSnapshot(value: Record<string, unknown>): GradingSnapshot {
  const sections = Array.isArray(value.sections) ? value.sections : [];
  return {
    attemptId: String(value.attemptId),
    status: value.status as GradingSnapshot['status'],
    submissionType: (value.submissionType as GradingSnapshot['submissionType']) ?? null,
    expiresAt: new Date(String(value.expiresAt)),
    passingPercentage: Number(value.passingPercentage ?? 60),
    minPassingScorePerSkill: Number(
      (value.scoringPolicy as Record<string, unknown> | undefined)?.minPassingScorePerSkill ?? 0,
    ),
    levelCode: String(value.levelCode ?? 'A1'),
    sections: sections.map((section) => {
      const row = section as Record<string, unknown>;
      const questions = Array.isArray(row.questions) ? row.questions : [];
      return {
        databaseSectionId: String(row.sectionId),
        sectionId: String(row.sourceSectionId),
        skill: String(row.skill),
        sectionOrder: Number(row.sectionOrder),
        maxScore: Number(row.maxScore ?? 0),
        questions: questions.map((question) => {
          const item = question as Record<string, unknown>;
          return {
            databaseQuestionId: String(item.questionId),
            questionId: String(item.sourceQuestionId),
            sectionId: String(row.sourceSectionId),
            sourceSectionId: String(row.sourceSectionId),
            skill: String(row.skill),
            order: Number(item.order),
            part: Number(item.part),
            points: Number(item.points),
            selectedOption: item.selectedOption == null ? null : String(item.selectedOption),
            correctOption: String(item.correctOption),
            citation: item.citation == null ? undefined : String(item.citation),
            trapExplanationVi: item.trapExplanationVi == null ? undefined : String(item.trapExplanationVi),
            tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
          };
        }),
      };
    }),
  };
}
