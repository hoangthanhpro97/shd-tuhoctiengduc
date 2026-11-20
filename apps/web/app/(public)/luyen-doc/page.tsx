import { SkillCatalogLayout } from '../../../components/learning/SkillCatalogLayout';
import { getSkillExercises } from '../../../lib/server/exam-content-loader';
export const metadata = {
  title: 'Luyện Lesen chuẩn Goethe & ÖSD miễn phí | SHD Tự Học Tiếng Đức',
  description: 'Luyện Goethe & ÖSD Modelltests Lesen miễn phí với nguồn đề sát với đề thi thực tế kèm answer key, giải thích chi tiết, từ vựng đi kèm và trải nghiệm làm bài thi thử như trên máy.',
};
export default async function ReadingPage() { return <SkillCatalogLayout skill="Lesen" exercises={await getSkillExercises('Lesen')} />; }
