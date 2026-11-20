import { NextRequest } from 'next/server';
import { z } from 'zod';
import { unlockAttempt } from '../../../../../../lib/server/lead-gate-service';
import { mapDatabaseError, problemResponse } from '../../../../../../lib/server/problems';
import { getVisitorTokenHash } from '../../../../../../lib/server/session';

export const runtime = 'nodejs';

const UnlockSchema = z.object({ challengeId: z.string().uuid() }).strict();

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const tokenHash = getVisitorTokenHash(request);
  if (!tokenHash) return problemResponse(401, 'UNAUTHORIZED', 'Visitor session is required.');
  try {
    const body = UnlockSchema.parse(await request.json());
    return Response.json(await unlockAttempt(tokenHash, id, body.challengeId), { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    if (error instanceof z.ZodError) return problemResponse(400, 'VALIDATION_FAILED', 'Invalid unlock payload.');
    return mapDatabaseError(error, `/api/v1/attempts/${id}/unlock`);
  }
}
