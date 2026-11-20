import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AttemptModeSchema } from '@shd/contracts';
import { getAppPool } from '../../../../lib/server/db';
import { startAttempt, parseStartResponse } from '../../../../lib/server/attempt-service';
import { mapDatabaseError, problemResponse } from '../../../../lib/server/problems';
import { ensureVisitor, getVisitorTokenHash } from '../../../../lib/server/session';
import { examSlugCandidates } from '../../../../data/exam-book-sets';
import { createLocalAttempt, listLocalAttempts } from '../../../../lib/server/local-attempt-store';

export const runtime = 'nodejs';

const StartAttemptSchema = z.object({ slug: z.string().min(1), mode: AttemptModeSchema.default('exam'), sectionFilter: z.enum(['lesen', 'hoeren', 'all']).default('all') }).strict();

export async function POST(request: import('next/server').NextRequest) {
  const response = new NextResponse();
  try {
    const body = StartAttemptSchema.parse(await request.json());
    const tokenHash = await ensureVisitor(request, response);
    if (body.sectionFilter !== 'all') {
      const local = await createLocalAttempt({ slug: body.slug, mode: body.mode, sectionFilter: body.sectionFilter, ownerTokenHash: tokenHash });
      if (!local) return problemResponse(404, 'CONTENT_NOT_PUBLISHED', 'Published exam not found.');
      const result = NextResponse.json({ ...parseStartResponse(local.state), sectionFilter: body.sectionFilter }, { status: 201, headers: { 'cache-control': 'no-store', 'x-shd-runtime': 'local-fixture' } });
      for (const cookie of response.cookies.getAll()) result.cookies.set(cookie);
      return result;
    }
    try {
      const version = await getAppPool().query<{ id: string }>(
        `SELECT ev.id FROM exam_versions ev JOIN exams e ON e.id = ev.exam_id WHERE e.slug = ANY($1::text[]) AND ev.status = 'published' ORDER BY array_position($1::text[], e.slug), ev.version_number DESC LIMIT 1`,
        [examSlugCandidates(body.slug)],
      );
      const versionId = version.rows[0]?.id;
      if (!versionId) throw new Error('CONTENT_NOT_PUBLISHED');
      const state = await startAttempt(tokenHash, versionId, body.mode);
      const payload = parseStartResponse(state);
      const result = NextResponse.json(payload, { status: 201, headers: { 'cache-control': 'no-store' } });
      for (const cookie of response.cookies.getAll()) result.cookies.set(cookie);
      return result;
    } catch {
      const local = await createLocalAttempt({ slug: body.slug, mode: body.mode, sectionFilter: body.sectionFilter, ownerTokenHash: tokenHash });
      if (!local) return problemResponse(404, 'CONTENT_NOT_PUBLISHED', 'Published exam not found.');
      const payload = { ...parseStartResponse(local.state), sectionFilter: body.sectionFilter };
      const result = NextResponse.json(payload, { status: 201, headers: { 'cache-control': 'no-store', 'x-shd-runtime': 'local-fixture' } });
      for (const cookie of response.cookies.getAll()) result.cookies.set(cookie);
      return result;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('start attempt validation failed', error.issues.map((issue) => ({ path: issue.path, code: issue.code })));
      return problemResponse(400, 'VALIDATION_FAILED', 'Invalid attempt request.');
    }
    console.error('start attempt failed', error instanceof Error ? error.message : 'unknown');
    return mapDatabaseError(error);
  }
}

export async function GET(request: import('next/server').NextRequest) {
  const tokenHash = getVisitorTokenHash(request);
  if (!tokenHash) return Response.json({ items: [] }, { headers: { 'cache-control': 'no-store' } });
  const limit = Math.min(20, Math.max(1, Number(request.nextUrl.searchParams.get('limit') ?? 20) || 20));
  try {
    const result = await getAppPool().query<{
      attempt_id: string;
      slug: string;
      title: string;
      status: 'in_progress' | 'submitted' | 'graded';
      mode: 'exam' | 'practice';
      answered_count: number;
      total_questions: number;
      started_at: string;
    }>(
      `SELECT ea.id AS attempt_id,
              e.slug,
              e.title,
              ea.status,
              ea.mode,
              (SELECT count(*)::int FROM attempt_answers aa WHERE aa.attempt_id = ea.id AND aa.selected_option_label IS NOT NULL) AS answered_count,
              (SELECT count(*)::int FROM questions q WHERE q.version_id = ea.version_id) AS total_questions,
              ea.started_at
         FROM exam_attempts ea
         JOIN visitors v ON v.id = ea.visitor_id
         JOIN exam_versions ev ON ev.id = ea.version_id
         JOIN exams e ON e.id = ev.exam_id
        WHERE v.visitor_token_hash = $1
        ORDER BY ea.started_at DESC
        LIMIT $2`,
      [tokenHash, limit],
    );
    return Response.json({ items: result.rows.map((row) => ({
      attemptId: row.attempt_id,
      slug: row.slug,
      title: row.title,
      status: row.status,
      mode: row.mode,
      answeredCount: Number(row.answered_count),
      totalQuestions: Number(row.total_questions),
      startedAt: new Date(row.started_at).toISOString(),
    })) }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    console.warn('attempt history unavailable:', error instanceof Error ? error.message : error);
    return Response.json({ items: listLocalAttempts(tokenHash, limit) }, { headers: { 'cache-control': 'no-store', 'x-shd-runtime': 'local-fixture' } });
  }
}
