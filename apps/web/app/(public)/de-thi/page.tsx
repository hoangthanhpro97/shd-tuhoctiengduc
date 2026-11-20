import { listPublicExams } from '../../../lib/server/catalog-service';
import { ExamCatalog } from '../../../components/exam/ExamCatalog';

export const dynamic = 'force-dynamic';

export default async function ExamCatalogPage() {
  const exams = await listPublicExams();
  return <ExamCatalog exams={exams.map((exam) => ({ ...exam, provider: 'osd' as const }))} />;
}
