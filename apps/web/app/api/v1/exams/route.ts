import { getAllPublicExams } from '../../../../lib/server/exam-content-loader';
import { problemResponse } from '../../../../lib/server/problems';

export const runtime = 'nodejs';

export async function GET() {
  try {
    return Response.json({ items: await getAllPublicExams() }, {
      headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return problemResponse(500, 'INTERNAL_ERROR', 'Unable to load exam catalog.');
  }
}
