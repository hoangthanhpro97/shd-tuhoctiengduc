import { notFound } from 'next/navigation';
import { ExamExplanationRoom } from '../../../../../components/exam/ExamExplanationRoom';
import { getExamStudyPayload, type StudySkill } from '../../../../../lib/server/exam-answer-key-loader';

export const dynamic = 'force-dynamic';

export default async function ExplanationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ skill?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const skill: StudySkill = query.skill === 'hoeren' ? 'hoeren' : 'lesen';
  const payload = await getExamStudyPayload(slug, skill);
  if (!payload) notFound();
  return <ExamExplanationRoom payload={payload} />;
}
