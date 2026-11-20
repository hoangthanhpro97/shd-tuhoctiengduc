import { NextRequest } from 'next/server';
import { z } from 'zod';
import { recordConsent, verifyOtp } from '../../../../../../../lib/server/lead-gate-service';
import { mapDatabaseError, problemResponse } from '../../../../../../../lib/server/problems';
import { getVisitorTokenHash } from '../../../../../../../lib/server/session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const tokenHash = getVisitorTokenHash(request);
  if (!tokenHash) return problemResponse(401, 'UNAUTHORIZED', 'Visitor session is required.');
  try {
    const verified = await verifyOtp(tokenHash, await request.json());
    await recordConsent(tokenHash, verified.learnerId, (await context.params).id, verified.challengeId, verified.consentShdCareer);
    return Response.json({ verified: true }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    if (error instanceof z.ZodError) return problemResponse(400, 'VALIDATION_FAILED', 'Invalid OTP payload.');
    return mapDatabaseError(error, `/api/v1/attempts/${(await context.params).id}/otp/verify`);
  }
}
