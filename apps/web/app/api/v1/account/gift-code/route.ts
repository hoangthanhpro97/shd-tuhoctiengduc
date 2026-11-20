import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getVisitorTokenHash } from '../../../../../lib/server/session';

const GiftCodeSchema = z.object({ code: z.string().trim().min(3).max(64) }).strict();

export async function POST(request: NextRequest) {
  const tokenHash = getVisitorTokenHash(request);
  if (!tokenHash) return Response.json({ code: 'UNAUTHORIZED', detail: 'Visitor session is required.' }, { status: 401 });
  const body = GiftCodeSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ code: 'VALIDATION_FAILED', detail: 'Gift Code không hợp lệ.' }, { status: 400 });
  const code = body.data.code.toUpperCase();
  if (code === 'SHD-EXPIRED') return Response.json({ code: 'GIFT_CODE_EXPIRED', detail: 'Gift Code đã hết hạn.' }, { status: 410 });
  if (code !== 'SHD-DEMO-2026') return Response.json({ code: 'GIFT_CODE_INVALID', detail: 'Gift Code không hợp lệ hoặc đã được sử dụng.' }, { status: 422 });
  return Response.json({ redeemed: true, code: 'GIFT_CODE_REDEEMED', daysGranted: 7 }, { status: 200 });
}
