import type { Exam } from '../data/fixtures';
import { ExamBookCover } from './exam/ExamBookCover';
import { DynamicTopicThumbnail } from './thumbnails/DynamicTopicThumbnail';

function providerFromExam(exam: Exam): 'goethe' | 'osd' | 'telc' {
  const value = `${exam.providerFormat ?? ''} ${exam.slug} ${exam.title}`.toLowerCase();
  if (value.includes('goethe')) return 'goethe';
  if (value.includes('osd') || value.includes('oesd') || value.includes('ösd')) return 'osd';
  if (value.includes('telc')) return 'telc';
  return 'goethe';
}

function simulationNumber(slug: string) {
  return slug.match(/(?:-|_)(\d+)$/)?.[1] ?? '01';
}

function coverLevel(level: Exam['level']): 'A1' | 'A2' | 'B1' | 'B2' {
  return level === 'C1' ? 'B2' : level;
}

function displayExamTitle(exam: Exam) {
  const value = `${exam.providerFormat ?? ''} ${exam.slug} ${exam.title}`.toLowerCase();
  const provider = value.includes('goethe') ? 'Goethe' : value.includes('osd') || value.includes('oesd') || value.includes('ösd') ? 'ÖSD' : value.includes('telc') ? 'TELC' : 'Goethe';
  const rawNumber = exam.title.match(/(?:số|modellsatz)\s*0?(\d+)/iu)?.[1] ?? exam.slug.match(/(?:-|_)(\d+)$/)?.[1] ?? '01';
  const number = rawNumber.padStart(2, '0');
  const topic = exam.title.split(':').slice(1).join(':').trim();
  const format = provider === 'ÖSD' ? `Modellsatz ${number}` : `Đề ${number}`;
  return topic ? `${provider} ${exam.level} · ${format}: ${topic}` : `${provider} ${exam.level} · ${format}`;
}

export function ExamCard({ exam }: { exam: Exam }) {
  const title = displayExamTitle(exam);
  return <a className="content-card group" href={`/de-thi/${exam.slug}`}><ExamBookCover level={coverLevel(exam.level)} provider={providerFromExam(exam)} simulationNumber={simulationNumber(exam.slug)} title={title} /><div className="flex flex-1 flex-col justify-between p-4"><h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-800 transition-colors group-hover:text-[#da2527]">{title}</h3><div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3"><span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#da2527] transition-transform group-hover:translate-x-1"><span>Xem đề</span><span className="text-base leading-none">→</span></span></div></div></a>;
}

export function ListeningCard({ item, itemKey }: { item: { title: string; teil: number; duration?: string; slug?: string }; itemKey: string }) { return <a className="content-card group" href={item.slug ? `/luyen-nghe/${item.slug}` : '/luyen-nghe'}><DynamicTopicThumbnail skill="horen" title={item.title} itemKey={item.slug ?? itemKey} badgeText={`Teil ${item.teil}`} /><div className="card-body"><h3 className="media-card-title mt-2 line-clamp-1 text-base font-normal text-slate-800 sm:text-lg">{item.title}</h3><div className="flex items-center justify-end border-t border-slate-100 pt-3"><span className="inline-flex items-center gap-1.5 text-sm font-bold leading-none text-[#da2527]"><span>Làm bài</span><span className="text-base leading-none">→</span></span></div></div></a>; }
export function ReadingCard({ item, itemKey }: { item: { title: string; teil: number; slug?: string }; itemKey: string }) { return <a className="content-card group" href={item.slug ? `/luyen-doc/${item.slug}` : '/luyen-doc'}><DynamicTopicThumbnail skill="lesen" title={item.title} itemKey={item.slug ?? itemKey} badgeText={`Teil ${item.teil}`} /><div className="card-body"><h3 className="media-card-title mt-2 line-clamp-1 text-base font-normal text-slate-800 sm:text-lg">{item.title}</h3><div className="flex items-center justify-end border-t border-slate-100 pt-3"><span className="inline-flex items-center gap-1.5 text-sm font-bold leading-none text-[#da2527]"><span>Làm bài</span><span className="text-base leading-none">→</span></span></div></div></a>; }
export function DictationCard({ item, itemKey }: { item: { title: string; questions: number; duration: string }; itemKey: string }) {
  return <a className="content-card group" href="/chep-chinh-ta">
    <DynamicTopicThumbnail skill="diktat" title={item.title} itemKey={itemKey} badgeText="Diktat" />
    <div className="card-body">
      <h3 className="media-card-title mt-2 line-clamp-1 text-base font-normal text-slate-800 sm:text-lg">{item.title}</h3>
      <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#da2527] transition-transform group-hover:translate-x-1"><span>Chép bài</span><span className="text-base leading-none">→</span></span>
      </div>
    </div>
  </a>;
}
type SkillCardProps = { title: string; provider: string; part: string; href: string; itemKey: string };

export function SpeakingCard({ title, part, href, itemKey }: SkillCardProps) {
  return <a className="content-card skill-card group" href={href}>
    <DynamicTopicThumbnail skill="sprechen" title={title} itemKey={itemKey} badgeText={part} />
    <div className="card-body"><h3 className="skill-card-title line-clamp-1 text-base font-normal group-hover:text-[#da2527]">{title}</h3><div className="flex items-center justify-end border-t border-slate-100 pt-3"><span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#da2527]"><span>Luyện nói</span><span className="text-base leading-none">→</span></span></div></div>
  </a>;
}

export function WritingCard({ title, part, href, itemKey }: SkillCardProps) {
  return <a className="content-card skill-card group" href={href}>
    <DynamicTopicThumbnail skill="schreiben" title={title} itemKey={itemKey} badgeText={part} />
    <div className="card-body"><h3 className="skill-card-title line-clamp-1 text-base font-normal group-hover:text-[#da2527]">{title}</h3><div className="flex items-center justify-end border-t border-slate-100 pt-3"><span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#da2527]"><span>Luyện viết</span><span className="text-base leading-none">→</span></span></div></div>
  </a>;
}
