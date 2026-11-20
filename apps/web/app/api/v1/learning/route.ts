import { getSkillExercises } from '../../../../lib/server/exam-content-loader';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const skill = new URL(request.url).searchParams.get('skill');
  if (skill !== 'Lesen' && skill !== 'Hoeren') return Response.json({ items: [] }, { status: 400 });
  return Response.json({ items: await getSkillExercises(skill) }, { headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}
