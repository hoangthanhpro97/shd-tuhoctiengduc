import Link from 'next/link';
import { ArrowRight, ListChecks } from 'lucide-react';
import type { LearningSkill } from '../../data/deep-learning-fixtures';
import type { SkillExercise } from '../../lib/server/exam-content-loader';
import { DynamicTopicThumbnail } from '../thumbnails/DynamicTopicThumbnail';

type Provider = 'goethe' | 'osd' | 'telc';

const providerLabels: Record<Provider, string> = { goethe: 'Goethe', osd: 'ÖSD', telc: 'TELC' };

function ComingSoonSkill({ provider, skill, level }: { provider: Provider; skill: LearningSkill; level: 'B1' | 'B2' }) {
  const label = skill === 'Hoeren' ? 'Luyện nghe' : 'Luyện đọc';
  return <div className="provider-coming-soon"><div><span className="provider-coming-soon-label">Đang cập nhật</span><h3>{providerLabels[provider]} {level} · {label} sắp ra mắt</h3><p>Nội dung theo chuẩn {providerLabels[provider]} {level} đang được biên tập. Trong thời gian chờ, bạn có thể luyện ngay bài tương đương từ đề ÖSD.</p></div><Link className="button button-quiet" href={`/${skill === 'Hoeren' ? 'luyen-nghe' : 'luyen-doc'}/osd#${level.toLowerCase()}`}>Luyện ÖSD {level} <ArrowRight size={15} /></Link></div>;
}

function ExerciseCard({ exercise, skill }: { exercise: SkillExercise; skill: LearningSkill }) {
  const base = skill === 'Hoeren' ? 'luyen-nghe' : 'luyen-doc';
  return <article className="learning-card"><Link href={`/${base}/${exercise.slug}`}><DynamicTopicThumbnail title={exercise.title} skill={skill === 'Hoeren' ? 'horen' : 'lesen'} itemKey={exercise.slug} badgeText={`${exercise.provider} · ${exercise.level}`} /></Link><div className="learning-card-body"><span className="provider-exam-card-kicker">{exercise.provider} · {exercise.level} · {exercise.teil}</span><h3>{exercise.title}</h3><p>{exercise.description}</p><div className="provider-skill-card-meta"><span><ListChecks size={13} /> {exercise.questions} câu</span><Link href={`/${base}/${exercise.slug}`}>Bắt đầu <ArrowRight size={14} /></Link></div></div></article>;
}

export function SkillProviderSummary({ provider, skill, exercises }: { provider: Provider; skill: LearningSkill; exercises: SkillExercise[] }) {
  const label = skill === 'Hoeren' ? 'Luyện nghe Hören' : 'Luyện đọc Lesen';
  return <main className="provider-summary-page"><div className="container"><header className="provider-summary-hero"><p className="eyebrow">Kỹ năng · {providerLabels[provider]}</p><h1>{providerLabels[provider]} · {label}</h1><p>Chọn cấp độ để luyện từng bài theo cấu trúc chuẩn và mở thẳng vào câu hỏi, ngữ liệu của bài.</p><nav className="provider-summary-nav" aria-label="Cấp độ"><a href="#b1">B1 <ArrowRight size={14} /></a><a href="#b2">B2 <ArrowRight size={14} /></a></nav></header><div className="provider-summary-sections">{(['B1', 'B2'] as const).map((level) => { const levelExercises = exercises.filter((exercise) => exercise.level === level); return <section className="provider-summary-section scroll-mt-24" id={level.toLowerCase()} key={level}><div className="provider-summary-section-heading"><div><p className="eyebrow">{providerLabels[provider]} · {level}</p><h2>{label} {level}</h2></div><span>{levelExercises.length ? `${levelExercises.length} bài` : 'Đang cập nhật'}</span></div>{levelExercises.length ? <div className="provider-skill-grid">{levelExercises.map((exercise) => <ExerciseCard exercise={exercise} key={exercise.slug} skill={skill} />)}</div> : <ComingSoonSkill provider={provider} skill={skill} level={level} />}</section>; })}</div></div></main>;
}
