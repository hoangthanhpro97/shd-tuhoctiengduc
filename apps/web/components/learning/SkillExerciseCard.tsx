import Link from 'next/link';
import type { SkillExercise } from '../../lib/server/exam-content-loader';
import { getSkillExerciseTitle } from '../../lib/skill-catalog';
import { DynamicTopicThumbnail } from '../thumbnails/DynamicTopicThumbnail';

export function SkillExerciseCard({ exercise }: { exercise: SkillExercise }) {
  const title = getSkillExerciseTitle(exercise);
  const isReading = exercise.skill === 'Lesen';
  return <Link href={`/${isReading ? 'luyen-doc' : 'luyen-nghe'}/${exercise.slug}`} className="group block min-w-0" title={title}>
    <DynamicTopicThumbnail skill={isReading ? 'lesen' : 'horen'} title={title} itemKey={exercise.slug} topLeftText={`${exercise.questions} câu`} badgeText={`${exercise.provider} · ${exercise.level}`} />
    <h3 className="mt-2.5 line-clamp-2 min-h-[2.65rem] text-[15px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#da2527]">{title}</h3>
    <p className="mt-1 line-clamp-1 text-xs text-slate-500">{exercise.questions} câu hỏi · {exercise.durationMinutes} phút · {exercise.provider} {exercise.level}</p>
    <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-0.5"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-50 text-[9px]">▶</span><span>Làm bài →</span></div>
  </Link>;
}
