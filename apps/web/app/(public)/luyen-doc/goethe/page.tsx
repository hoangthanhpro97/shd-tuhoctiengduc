import { SkillProviderAcademicPage } from '../../../../components/learning/SkillProviderAcademicPage';
import { getSkillExercises } from '../../../../lib/server/exam-content-loader';

export const dynamic = 'force-dynamic';

export default async function GoetheReadingSummaryPage() {
  const items = (await getSkillExercises('Lesen')).filter((item) => item.provider === 'Goethe');
  return <SkillProviderAcademicPage skill="Lesen" items={items} provider="goethe" />;
}
