import { notFound } from 'next/navigation';
import { ExamAttemptRouter } from '../../../../components/exam-room/ExamAttemptRouter';

export const dynamic = 'force-dynamic';

export default async function ExamRoomPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  // The attempt is hydrated by the client with the HttpOnly visitor session.
  if (!attemptId) notFound();
  return <ExamAttemptRouter attemptId={attemptId} />;
}
