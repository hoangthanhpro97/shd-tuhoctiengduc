export const runtime = 'nodejs';

export function GET() {
  return Response.json({ ok: true, service: 'shd-web' }, { headers: { 'cache-control': 'no-store' } });
}
