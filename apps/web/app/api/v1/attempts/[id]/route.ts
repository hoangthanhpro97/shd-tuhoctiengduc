import { getAttemptState } from '../../../../../lib/server/attempt-service';
import { mapDatabaseError, problemResponse } from '../../../../../lib/server/problems';
import { getVisitorTokenHash } from '../../../../../lib/server/session';
import { ensureLocalAttempt, getLocalAttempt } from '../../../../../lib/server/local-attempt-store';

export const runtime = 'nodejs';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const tokenHash = getVisitorTokenHash(request as import('next/server').NextRequest);
  if (!tokenHash) return problemResponse(401, 'UNAUTHORIZED', 'Visitor session is required.');
  if (id.startsWith('local-')) {
    await ensureLocalAttempt(id, tokenHash);
  }
  const local = getLocalAttempt(id, tokenHash);
  if (local) return Response.json(local.state, { headers: { 'cache-control': 'no-store', 'x-shd-runtime': 'local-fixture' } });
  try {
    return Response.json(await getAttemptState(tokenHash, id), { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return mapDatabaseError(error, `/api/v1/attempts/${id}`);
  }
}
