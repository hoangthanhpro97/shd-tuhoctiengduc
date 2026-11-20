import { OsdAcademicPage } from '../../../../components/exam/OsdAcademicPage';
import { getPublicExamsByProviderLevel } from '../../../../lib/server/exam-content-loader';

export const dynamic = 'force-dynamic';

export default async function OsdExamSummaryPage() {
  const [b1, b2] = await Promise.all([
    getPublicExamsByProviderLevel('osd', 'B1'),
    getPublicExamsByProviderLevel('osd', 'B2'),
  ]);
  return <OsdAcademicPage b1={b1} b2={b2} />;
}
