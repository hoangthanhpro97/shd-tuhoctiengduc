import { SkillProviderAcademicPage } from '../../../../components/learning/SkillProviderAcademicPage';
import { getSkillExercises } from '../../../../lib/server/exam-content-loader';

export const dynamic = 'force-dynamic';

export default async function GoetheListeningSummaryPage() {
  const items = (await getSkillExercises('Hoeren')).filter((item) => item.provider === 'Goethe');
  return <SkillProviderAcademicPage skill="Hoeren" items={items} provider="goethe" />;
}
