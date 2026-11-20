import 'server-only';
import { AttemptModeSchema, AttemptStatePayloadSchema, AttemptStartResponseSchema, SaveAnswerPayloadSchema, type AttemptMode } from '@shd/contracts';
import { getAppPool } from './db';

export async function startAttempt(tokenHash: string, versionId: string, mode: AttemptMode = 'exam') {
  const result = await getAppPool().query<{ start_attempt: string }>(
    `SELECT start_attempt($1, $2, $3) AS start_attempt`,
    [tokenHash, versionId, AttemptModeSchema.parse(mode)],
  );
  const attemptId = result.rows[0]?.start_attempt;
  if (!attemptId) throw new Error('Attempt could not be created');
  return getAttemptState(tokenHash, attemptId);
}

export async function getAttemptState(tokenHash: string, attemptId: string) {
  const result = await getAppPool().query<{ get_attempt_state: unknown }>(
    `SELECT get_attempt_state($1, $2) AS get_attempt_state`,
    [tokenHash, attemptId],
  );
  const state = result.rows[0]?.get_attempt_state as Record<string, unknown> | undefined;
  if (!state) throw new Error('Attempt state was not found');
  const normalized = {
    ...state,
    sectionFilter: state.sectionFilter ?? 'all',
    startedAt: new Date(String(state.startedAt)).toISOString(),
    expiresAt: new Date(String(state.expiresAt)).toISOString(),
    serverNow: new Date(String(state.serverNow)).toISOString(),
    answers: Array.isArray(state.answers) ? state.answers.map((answer) => {
      const row = answer as Record<string, unknown>;
      return { ...row, answeredAt: new Date(String(row.answeredAt)).toISOString() };
    }) : [],
  };
  return AttemptStatePayloadSchema.parse(normalized);
}

export async function saveAttemptAnswer(tokenHash: string, attemptId: string, input: unknown) {
  const payload = SaveAnswerPayloadSchema.parse(input);
  const result = await getAppPool().query<{ save_attempt_answer: unknown }>(
    `SELECT save_attempt_answer($1, $2, q.id, $3, $4, $5) AS save_attempt_answer
     FROM questions q
     JOIN exam_attempts ea ON ea.version_id = q.version_id
     WHERE ea.id = $2 AND q.source_question_id = $6`,
    [tokenHash, attemptId, payload.selectedOption, payload.revision, payload.timeSpentSeconds, payload.questionId],
  );
  const saved = result.rows[0]?.save_attempt_answer;
  if (!saved) throw new Error('Question does not belong to attempt');
  return saved;
}

export function parseStartResponse(state: Awaited<ReturnType<typeof getAttemptState>>) {
  return AttemptStartResponseSchema.parse({
    attemptId: state.attemptId,
    examSlug: state.slug,
    startedAt: state.startedAt,
    expiresAt: state.expiresAt,
    serverNow: state.serverNow,
    status: state.status,
    sectionFilter: state.sectionFilter,
  });
}
