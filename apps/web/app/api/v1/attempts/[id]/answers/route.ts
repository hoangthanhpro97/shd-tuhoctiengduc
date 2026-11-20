import { NextRequest } from 'next/server';
import { z } from 'zod';
import { saveAttemptAnswer } from '../../../../../../lib/server/attempt-service';
import { mapDatabaseError, problemResponse } from '../../../../../../lib/server/problems';
import { getVisitorTokenHash } from '../../../../../../lib/server/session';
import { getLocalAttempt, updateLocalAnswer } from '../../../../../../lib/server/local-attempt-store';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const tokenHash = getVisitorTokenHash(request);
  if (!tokenHash) return problemResponse(401, 'UNAUTHORIZED', 'Visitor session is required.');
  if (getLocalAttempt(id, tokenHash)) {
    try {
      return Response.json(updateLocalAnswer(id, await request.json(), tokenHash), { headers: { 'cache-control': 'no-store', 'x-shd-runtime': 'local-fixture' } });
    } catch (error) {
      if (error instanceof z.ZodError) return problemResponse(400, 'VALIDATION_FAILED', 'Invalid answer payload.');
      return mapDatabaseError(error, `/api/v1/attempts/${id}/answers`);
    }
  }
  try {
    const saved = await saveAttemptAnswer(tokenHash, id, await request.json());
    return Response.json(saved, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    if (error instanceof z.ZodError) return problemResponse(400, 'VALIDATION_FAILED', 'Invalid answer payload.');
    console.error('save answer failed', error instanceof Error ? error.message : 'unknown');
    return mapDatabaseError(error, `/api/v1/attempts/${id}/answers`);
  }
}
