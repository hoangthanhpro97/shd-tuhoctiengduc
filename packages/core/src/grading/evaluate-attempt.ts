import { SubmitAttemptPayloadSchema } from '@shd/contracts';
import { scoreAttempt } from './scoring.js';
import type { EvaluateAttemptOptions } from './types.js';
import { GradingDomainError } from './types.js';

export async function evaluateAttemptUseCase({ payload, repository, now = new Date() }: EvaluateAttemptOptions) {
  const validatedPayload = SubmitAttemptPayloadSchema.parse(payload);
  const snapshot = await repository.loadGradingSnapshot(validatedPayload.attemptId);

  if (snapshot.status === 'graded') {
    throw new GradingDomainError('ATTEMPT_ALREADY_GRADED', 'Attempt has already been graded');
  }
  if (snapshot.status !== 'submitted' && snapshot.status !== 'in_progress') {
    throw new GradingDomainError('INVALID_ATTEMPT_STATE', 'Attempt is not ready for grading');
  }

  const timedOut = now.getTime() >= snapshot.expiresAt.getTime();
  const answerByQuestionId = new Map(validatedPayload.userAnswers.map((answer) => [answer.questionId, answer.selectedOption]));
  const snapshotQuestionIds = new Set(snapshot.sections.flatMap((section) => section.questions.map((question) => question.questionId)));

  for (const questionId of answerByQuestionId.keys()) {
    if (!snapshotQuestionIds.has(questionId)) {
      throw new GradingDomainError('INVALID_ANSWER', `Question ${questionId} does not belong to this attempt`);
    }
  }

  const sections = snapshot.sections.map((section) => ({
    ...section,
    questions: section.questions.map((question) => ({
      ...question,
      selectedOption: answerByQuestionId.has(question.questionId)
        ? answerByQuestionId.get(question.questionId) ?? null
        : question.selectedOption,
    })),
  }));
  const scored = scoreAttempt({
    attemptId: snapshot.attemptId,
    sections,
    passingPercentage: snapshot.passingPercentage,
    minPassingScorePerSkill: snapshot.minPassingScorePerSkill,
    levelCode: snapshot.levelCode,
  });

  await repository.persistGradingResult(snapshot.attemptId, {
    result: scored.result,
    totalScore: scored.totalScore,
    maxPossibleScore: scored.maxPossibleScore,
    percentage: scored.percentage,
    passingPercentage: snapshot.passingPercentage,
    cefrEstimateCode: scored.cefrEstimateCode,
    benchmarkStatusCode: scored.benchmarkStatusCode,
    itemScores: scored.itemScores,
    sectionScores: scored.sectionScores,
  });

  return {
    ...scored.result,
    submissionType: timedOut ? 'timeout' : snapshot.submissionType ?? 'manual',
    benchmarkStatusCode: scored.benchmarkStatusCode,
    cefrEstimateCode: scored.cefrEstimateCode,
  };
}
