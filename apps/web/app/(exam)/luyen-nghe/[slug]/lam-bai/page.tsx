import { notFound } from 'next/navigation';
import { getSkillExercise } from '../../../../../lib/server/exam-content-loader';
import { getPublicExamBySlug } from '../../../../../lib/server/exam-service';
import { ExamWorkstationCore } from '../../../../../components/exam-room/core/ExamWorkstationCore';
import { convertSkillExerciseToWorkstationPayload } from '../../../../../components/exam-room/core/payloadConverter';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getSkillExercise('Hoeren', slug);
  return {
    title: item ? `Luyện nghe: ${item.title} | SHD Tự học tiếng Đức` : 'Luyện nghe Hören',
  };
}

export default async function PracticeListeningPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getSkillExercise('Hoeren', slug);
  if (!item) notFound();

  const sourceExam = item.sourceExamSlug ? await getPublicExamBySlug(item.sourceExamSlug) : null;
  const payload = convertSkillExerciseToWorkstationPayload(item, sourceExam);

  return <ExamWorkstationCore initialPayload={payload} />;
}
