import Link from 'next/link';
import type { DeepLearningExercise, LearningSkill } from '../../data/deep-learning-fixtures';
import { DynamicTopicThumbnail } from '../thumbnails/DynamicTopicThumbnail';

export function LearningCatalog({ skill, exercises }: { skill: LearningSkill; exercises: DeepLearningExercise[] }) {
  const label = skill === 'Hoeren' ? 'Luyện nghe Hören' : 'Luyện đọc Lesen';
  const base = skill === 'Hoeren' ? 'luyen-nghe' : 'luyen-doc';
  const levels = [...new Set(exercises.map((exercise) => exercise.level))];
  return <main className="catalog-page"><div className="container">
    <header className="catalog-header"><div><p className="eyebrow">Kho bài học thuật từ đề thi chuẩn</p><h1>{label}</h1><p>Bài luyện được trích xuất trực tiếp từ ngữ liệu và câu hỏi trong đề ÖSD.</p></div></header>
    <div className="learning-layout">
      <aside className="learning-sidebar"><h2>Cấp độ</h2><nav className="grid gap-3" aria-label="Cấp độ bài luyện">{levels.map((level) => <Link className="text-sm font-semibold text-slate-700 hover:text-[#da2527]" href={`#${level.toLowerCase()}`} key={level}>ÖSD {level}</Link>)}</nav></aside>
      <div className="grid gap-10">
        {levels.map((level) => {
          const items = exercises.filter((exercise) => exercise.level === level);
          return <section id={level.toLowerCase()} className="scroll-mt-24" key={level}>
            <div className="learning-results-head"><h2>{label} {level}</h2><span className="badge badge-neutral">{items.length} bài luyện</span></div>
            <div className="learning-card-grid">{items.map((exercise) => <article className="learning-card" key={exercise.slug}>
              <Link href={`/${base}/${exercise.slug}`}><DynamicTopicThumbnail skill={skill === 'Hoeren' ? 'horen' : 'lesen'} title={exercise.title} itemKey={exercise.slug} badgeText={`${exercise.provider} · ${exercise.teil}`} /></Link>
              <div className="learning-card-body"><h2>{exercise.title}</h2><p>{exercise.description}</p><div className="academic-card-meta"><span>{exercise.questions} câu</span><span>{exercise.level}</span><span>{exercise.provider}</span></div><div className="card-quick-actions"><Link href={`/${base}/${exercise.slug}`}>Bắt đầu</Link><Link href={`/${base}/${exercise.slug}#review`}>Xem giải thích</Link></div></div>
            </article>)}</div>
          </section>;
        })}
      </div>
    </div>
  </div></main>;
}
