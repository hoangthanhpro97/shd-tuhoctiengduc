import 'server-only';
import { evaluateAttemptUseCase } from '@shd/core';
import { PostgresGradingRepository } from '@shd/adapters';
import { AttemptResultPayloadSchema, AttemptResultPublicPayloadSchema, type SubmitAttemptPayload } from '@shd/contracts';
import { getAppPool, getWorkerPool } from './db';

export async function submitAttempt(tokenHash: string, payload: SubmitAttemptPayload) {
  await getAppPool().query('SELECT submit_attempt($1, $2)', [payload.attemptId, tokenHash]);
  const workerClient = await getWorkerPool().connect();
  try {
    const repository = new PostgresGradingRepository(workerClient);
    // Only acknowledged autosaves are authoritative; final request values cannot bypass option validation.
    const result = await evaluateAttemptUseCase({ payload: { ...payload, userAnswers: [] }, repository });
    return AttemptResultPayloadSchema.parse(result);
  } finally {
    workerClient.release();
  }
}

export async function getAttemptReview(tokenHash: string, attemptId: string) {
  const result = await getAppPool().query<{ get_attempt_result: unknown }>(
    'SELECT get_attempt_result($1, $2) AS get_attempt_result',
    [tokenHash, attemptId],
  );
  const payload = result.rows[0]?.get_attempt_result ?? null;
  if (!payload) return null;
  return AttemptResultPublicPayloadSchema.parse(payload);
}
