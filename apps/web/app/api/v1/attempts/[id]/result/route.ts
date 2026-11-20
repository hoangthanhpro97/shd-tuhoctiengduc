import { NextRequest } from 'next/server';
import { getAttemptReview } from '../../../../../../lib/server/grading-service';
import { mapDatabaseError, problemResponse } from '../../../../../../lib/server/problems';
import { getVisitorTokenHash } from '../../../../../../lib/server/session';
import { getLocalAttempt, getLocalResult } from '../../../../../../lib/server/local-attempt-store';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const tokenHash = getVisitorTokenHash(request);
  if (!tokenHash) return problemResponse(401, 'UNAUTHORIZED', 'Visitor session is required.');
  const local = getLocalAttempt(id, tokenHash);
  if (local) {
    const result = getLocalResult(id);
    if (result) return Response.json(result, { headers: { 'cache-control': 'no-store', 'x-shd-runtime': 'local-fixture' } });
  }
  try {
    const review = await getAttemptReview(tokenHash, id);
    if (!review) return problemResponse(404, 'NOT_FOUND', 'Result not found.');
    return Response.json(review, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    console.error('get result failed', error instanceof Error ? error.message : 'unknown');
    return mapDatabaseError(error, `/api/v1/attempts/${id}/result`);
  }
}
