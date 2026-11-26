import { SkillProviderAcademicPage } from '../../../../components/learning/SkillProviderAcademicPage';
import { getSkillExercises } from '../../../../lib/server/exam-content-loader';

export const dynamic = 'force-dynamic';
export default async function OsdReadingSummaryPage() {
  const items = (await getSkillExercises('Lesen')).filter((item) => item.provider === 'ÖSD');
  return <SkillProviderAcademicPage skill="Lesen" items={items} provider="osd" />;
}
