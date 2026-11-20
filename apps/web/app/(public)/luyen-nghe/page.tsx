import { SkillCatalogLayout } from '../../../components/learning/SkillCatalogLayout';
import { getSkillExercises } from '../../../lib/server/exam-content-loader';
export const metadata = {
  title: 'Luyện Hören chuẩn Goethe & ÖSD miễn phí | SHD Tự Học Tiếng Đức',
  description: 'Goethe & ÖSD Modelltests Hören miễn phí tại SHD Tự Học Tiếng Đức: đề thi, audio, transcript, answer key, giải thích chi tiết từ vựng đi kèm và trải nghiệm làm bài thi thử như trên máy.',
};
export default async function ListeningPage() { return <SkillCatalogLayout skill="Hoeren" exercises={await getSkillExercises('Hoeren')} />; }
