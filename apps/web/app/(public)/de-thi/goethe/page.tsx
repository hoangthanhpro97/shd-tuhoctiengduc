import { GoetheAcademicPage } from '../../../../components/exam/GoetheAcademicPage';
import { getPublicExamsByProviderLevel } from '../../../../lib/server/exam-content-loader';

export const dynamic = 'force-dynamic';

export default async function GoetheExamSummaryPage() {
  const [b1, b2] = await Promise.all([
    getPublicExamsByProviderLevel('goethe', 'B1'),
    getPublicExamsByProviderLevel('goethe', 'B2'),
  ]);
  return <GoetheAcademicPage b1={b1} b2={b2} />;
}
