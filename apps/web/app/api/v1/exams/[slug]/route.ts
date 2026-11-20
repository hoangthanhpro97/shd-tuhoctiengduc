import { getPublicExamBySlug } from '../../../../../lib/server/exam-service';
import { problemResponse } from '../../../../../lib/server/problems';

export const runtime = 'nodejs';

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    const exam = await getPublicExamBySlug(slug);
    if (!exam) return problemResponse(404, 'CONTENT_NOT_PUBLISHED', 'Published exam not found.');
    return Response.json(exam, {
      headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('public exam query failed', error instanceof Error ? error.message : 'unknown');
    return problemResponse(500, 'INTERNAL_ERROR', 'Unable to load exam.');
  }
}
