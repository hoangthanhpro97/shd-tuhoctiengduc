import { NextRequest } from 'next/server';
import { z } from 'zod';
import { SubmitAttemptPayloadSchema } from '@shd/contracts';
import { submitAttempt } from '../../../../../../lib/server/grading-service';
import { mapDatabaseError, problemResponse } from '../../../../../../lib/server/problems';
import { getVisitorTokenHash } from '../../../../../../lib/server/session';
import { getLocalAttempt, gradeLocalAttempt } from '../../../../../../lib/server/local-attempt-store';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const tokenHash = getVisitorTokenHash(request);
  if (!tokenHash) return problemResponse(401, 'UNAUTHORIZED', 'Visitor session is required.');
  if (getLocalAttempt(id, tokenHash)) {
    try {
      const parsed = SubmitAttemptPayloadSchema.parse({ ...(await request.json()), attemptId: id });
      const result = gradeLocalAttempt(id, parsed.timeSpentPerItem ? 'manual' : 'manual', tokenHash);
      if (!result) return problemResponse(404, 'NOT_FOUND', 'Attempt not found.');
      return Response.json(result, { headers: { 'cache-control': 'no-store', 'x-shd-runtime': 'local-fixture' } });
    } catch (error) {
      if (error instanceof z.ZodError) return problemResponse(400, 'VALIDATION_FAILED', 'Invalid submit payload.');
      return mapDatabaseError(error, `/api/v1/attempts/${id}/submit`);
    }
  }
  try {
    const body = SubmitAttemptPayloadSchema.parse({ ...(await request.json()), attemptId: id });
    return Response.json(await submitAttempt(tokenHash, body), { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    console.error('submit attempt failed', error instanceof Error ? error.message : 'unknown');
    if (error instanceof z.ZodError) return problemResponse(400, 'VALIDATION_FAILED', 'Invalid submit payload.');
    return mapDatabaseError(error, `/api/v1/attempts/${id}/submit`);
  }
}
