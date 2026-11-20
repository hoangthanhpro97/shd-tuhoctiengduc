import { ResultClient } from '../../../../components/results/ResultClient';

export const dynamic = 'force-dynamic';

export default async function ResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  return <ResultClient attemptId={attemptId} />;
}
