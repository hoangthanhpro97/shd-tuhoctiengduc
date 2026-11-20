import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createLeadGate } from '../../../../../../lib/server/lead-gate-service';
import { mapDatabaseError, problemResponse } from '../../../../../../lib/server/problems';
import { getVisitorTokenHash } from '../../../../../../lib/server/session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const tokenHash = getVisitorTokenHash(request);
  if (!tokenHash) return problemResponse(401, 'UNAUTHORIZED', 'Visitor session is required.');
  try {
    return Response.json(await createLeadGate(tokenHash, id, await request.json()), { status: 201, headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    if (error instanceof z.ZodError) return problemResponse(400, 'VALIDATION_FAILED', 'Invalid lead gate payload.');
    console.error('lead gate failed', error instanceof Error ? error.message : 'unknown');
    return mapDatabaseError(error, `/api/v1/attempts/${id}/lead-gate`);
  }
}
