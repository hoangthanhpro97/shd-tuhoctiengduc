import type { AttemptResultPayload, SubmitAttemptPayload } from '@shd/contracts';

export type GradingSubmissionType = 'manual' | 'timeout';

export interface GradingQuestionSnapshot {
  databaseQuestionId: string;
  questionId: string;
  sectionId: string;
  sourceSectionId: string;
  skill: string;
  order: number;
  part: number;
  points: number;
  selectedOption: string | null;
  correctOption: string;
  citation?: string | undefined;
  trapExplanationVi?: string | undefined;
  tags?: string[] | undefined;
}

export interface GradingSectionSnapshot {
  databaseSectionId: string;
  sectionId: string;
  skill: string;
  sectionOrder: number;
  maxScore: number;
  questions: GradingQuestionSnapshot[];
}

export interface GradingSnapshot {
  attemptId: string;
  status: 'in_progress' | 'submitted' | 'graded';
  submissionType?: GradingSubmissionType | null;
  expiresAt: Date;
  passingPercentage: number;
  minPassingScorePerSkill: number;
  levelCode: string;
  sections: GradingSectionSnapshot[];
}

export interface PersistedItemScore {
  databaseQuestionId: string;
  isCorrect: boolean;
  earnedPoints: number;
}

export interface PersistedSectionScore {
  databaseSectionId: string;
  score: number;
  maxScore: number;
  cefrCode: string;
}

export interface GradingPersistenceRecord {
  result: AttemptResultPayload;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  passingPercentage: number;
  cefrEstimateCode: string;
  benchmarkStatusCode: 'pass' | 'near_pass' | 'not_pass';
  itemScores: PersistedItemScore[];
  sectionScores: PersistedSectionScore[];
}

export interface GradingRepository {
  loadGradingSnapshot(attemptId: string): Promise<GradingSnapshot>;
  persistGradingResult(attemptId: string, record: GradingPersistenceRecord): Promise<void>;
}

export interface EvaluateAttemptOptions {
  payload: SubmitAttemptPayload;
  repository: GradingRepository;
  now?: Date;
}

export class GradingDomainError extends Error {
  constructor(
    public readonly code:
      | 'ATTEMPT_EXPIRED'
      | 'ATTEMPT_ALREADY_GRADED'
      | 'INVALID_ATTEMPT_STATE'
      | 'INVALID_ANSWER',
    message: string,
  ) {
    super(message);
    this.name = 'GradingDomainError';
  }
}
