import type { AttemptResultPayload } from '@shd/contracts';
import type {
  GradingQuestionSnapshot,
  GradingSectionSnapshot,
  PersistedItemScore,
  PersistedSectionScore,
} from './types.js';

export interface ScoredQuestion extends PersistedItemScore {
  questionId: string;
  sectionId: string;
  skill: string;
  selectedOption: string | null;
  correctOption: string;
  points: number;
}

export interface ScoreAttemptInput {
  attemptId: string;
  sections: GradingSectionSnapshot[];
  passingPercentage: number;
  minPassingScorePerSkill: number;
  levelCode: string;
}

export interface ScoreAttemptOutput {
  result: AttemptResultPayload;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  cefrEstimateCode: string;
  benchmarkStatusCode: 'pass' | 'near_pass' | 'not_pass';
  itemScores: PersistedItemScore[];
  sectionScores: PersistedSectionScore[];
  scoredQuestions: ScoredQuestion[];
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function scoreQuestion(question: GradingQuestionSnapshot): ScoredQuestion {
  const isCorrect = question.selectedOption !== null && question.selectedOption === question.correctOption;
  return {
    databaseQuestionId: question.databaseQuestionId,
    questionId: question.questionId,
    sectionId: question.sectionId,
    skill: question.skill,
    selectedOption: question.selectedOption,
    correctOption: question.correctOption,
    points: question.points,
    isCorrect,
    earnedPoints: isCorrect ? question.points : 0,
  };
}

export function scoreAttempt(input: ScoreAttemptInput): ScoreAttemptOutput {
  const scoredQuestions = input.sections.flatMap((section) => section.questions.map(scoreQuestion));
  const totalScore = round(scoredQuestions.reduce((sum, question) => sum + question.earnedPoints, 0));
  const maxPossibleScore = round(scoredQuestions.reduce((sum, question) => sum + question.points, 0));
  const percentage = maxPossibleScore === 0 ? 0 : round((totalScore / maxPossibleScore) * 100);

  const sectionScores = input.sections.map((section) => {
    const sectionQuestions = scoredQuestions.filter((question) => question.sectionId === section.sectionId);
    const score = round(sectionQuestions.reduce((sum, question) => sum + question.earnedPoints, 0));
    const maxScore = round(sectionQuestions.reduce((sum, question) => sum + question.points, 0));
    return {
      databaseSectionId: section.databaseSectionId,
      sectionId: section.sectionId,
      score,
      maxScore,
      cefrCode: input.levelCode,
      percentage: maxScore === 0 ? 0 : round((score / maxScore) * 100),
    };
  });

  const requiredSkills = new Set(input.sections.map((section) => section.skill));
  const requiredSkillsPassed = [...requiredSkills].every((skill) => scoredQuestions
    .filter((question) => question.skill === skill)
    .reduce((sum, question) => sum + question.earnedPoints, 0) >= input.minPassingScorePerSkill);
  const isPassed = percentage >= input.passingPercentage && requiredSkillsPassed;
  const benchmarkStatusCode = isPassed
    ? 'pass'
    : percentage >= input.passingPercentage - 15
      ? 'near_pass'
      : 'not_pass';
  const cefrEstimateCode = isPassed ? input.levelCode : benchmarkStatusCode === 'near_pass' ? 'A2' : 'A1';

  const resultSectionScores = sectionScores.map(({ sectionId, score, maxScore, percentage: sectionPercentage }) => ({
    sectionId,
    score,
    maxScore,
    percentage: sectionPercentage,
  }));

  return {
    result: {
      attemptId: input.attemptId,
      totalScore,
      maxPossibleScore,
      percentage,
      isPassed,
      sectionScores: resultSectionScores,
      unlockedSolutions: [],
    },
    totalScore,
    maxPossibleScore,
    percentage,
    cefrEstimateCode,
    benchmarkStatusCode,
    itemScores: scoredQuestions.map(({ databaseQuestionId, isCorrect, earnedPoints }) => ({
      databaseQuestionId,
      isCorrect,
      earnedPoints,
    })),
    sectionScores: sectionScores.map(({ databaseSectionId, score, maxScore, cefrCode }) => ({
      databaseSectionId,
      score,
      maxScore,
      cefrCode,
    })),
    scoredQuestions,
  };
}
