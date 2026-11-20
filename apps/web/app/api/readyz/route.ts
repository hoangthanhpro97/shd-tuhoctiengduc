import { getAppPool, getWorkerPool } from '../../../lib/server/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await Promise.all([getAppPool().query('SELECT 1'), getWorkerPool().query('SELECT 1')]);
    return Response.json({ ok: true, database: 'ready' }, { headers: { 'cache-control': 'no-store' } });
  } catch {
    return Response.json({ ok: false, database: 'not_ready' }, { status: 503, headers: { 'cache-control': 'no-store' } });
  }
}
