import { SkillProviderAcademicPage } from '../../../../components/learning/SkillProviderAcademicPage';
import { getSkillExercises } from '../../../../lib/server/exam-content-loader';

export const dynamic = 'force-dynamic';
export default async function OsdReadingSummaryPage() { return <SkillProviderAcademicPage skill="Lesen" items={await getSkillExercises('Lesen')} />; }
