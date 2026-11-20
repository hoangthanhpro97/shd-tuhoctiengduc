import { ExamProviderSummary } from '../../../../components/exam/ExamProviderSummary';

export const dynamic = 'force-dynamic';

export default function TelcExamSummaryPage() {
  return <ExamProviderSummary provider="telc" exams={[]} />;
}
