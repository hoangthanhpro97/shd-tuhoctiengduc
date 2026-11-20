import { ExamProviderSummary } from '../../../../components/exam/ExamProviderSummary';

export const dynamic = 'force-dynamic';

export default function GoetheExamSummaryPage() {
  return <ExamProviderSummary provider="goethe" exams={[]} />;
}
