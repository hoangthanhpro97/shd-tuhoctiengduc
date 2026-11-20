import { SkillProviderAcademicPage } from '../../../../components/learning/SkillProviderAcademicPage';
import { getSkillExercises } from '../../../../lib/server/exam-content-loader';

export const dynamic = 'force-dynamic';
export default async function OsdListeningSummaryPage() { return <SkillProviderAcademicPage skill="Hoeren" items={await getSkillExercises('Hoeren')} />; }
