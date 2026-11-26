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
  return (
    <a className="group block min-w-0" href={`/de-thi/${exam.slug}`} title={title}>
      <ExamBookCover level={coverLevel(exam.level)} provider={providerFromExam(exam)} simulationNumber={simulationNumber(exam.slug)} title={title} />
      <h3 className="mt-2.5 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#da2527]">
        {title}
      </h3>
      <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-0.5">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-50 text-[9px]">▶</span>
        <span>Xem đề →</span>
      </div>
    </a>
  );
}

function MediaTopicCard({
  href,
  skill,
  title,
  itemKey,
  badgeText,
  ctaLabel,
}: {
  href: string;
  skill: 'horen' | 'lesen' | 'sprechen' | 'schreiben' | 'diktat';
  title: string;
  itemKey: string;
  badgeText: string;
  ctaLabel: string;
}) {
  return (
    <a className="group block min-w-0" href={href} title={title}>
      <DynamicTopicThumbnail skill={skill} title={title} itemKey={itemKey} badgeText={badgeText} />
      <h3 className="mt-2.5 line-clamp-1 text-[15px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#da2527]">
        {title}
      </h3>
      <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#da2527] transition-transform group-hover:translate-x-0.5">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-50 text-[9px]">▶</span>
        <span>{ctaLabel} →</span>
      </div>
    </a>
  );
}

export function ListeningCard({ item, itemKey }: { item: { title: string; teil: number; duration?: string; slug?: string }; itemKey: string }) {
  return (
    <MediaTopicCard
      href={item.slug ? `/luyen-nghe/${item.slug}` : '/luyen-nghe'}
      skill="horen"
      title={item.title}
      itemKey={item.slug ?? itemKey}
      badgeText={`Teil ${item.teil}`}
      ctaLabel="Làm bài"
    />
  );
}

export function ReadingCard({ item, itemKey }: { item: { title: string; teil: number; slug?: string }; itemKey: string }) {
  return (
    <MediaTopicCard
      href={item.slug ? `/luyen-doc/${item.slug}` : '/luyen-doc'}
      skill="lesen"
      title={item.title}
      itemKey={item.slug ?? itemKey}
      badgeText={`Teil ${item.teil}`}
      ctaLabel="Làm bài"
    />
  );
}

export function DictationCard({ item, itemKey }: { item: { title: string; questions: number; duration: string }; itemKey: string }) {
  return (
    <MediaTopicCard
      href="/chep-chinh-ta"
      skill="diktat"
      title={item.title}
      itemKey={itemKey}
      badgeText="Diktat"
      ctaLabel="Chép bài"
    />
  );
}

type SkillCardProps = { title: string; provider: string; part: string; href: string; itemKey: string };

export function SpeakingCard({ title, part, href, itemKey }: SkillCardProps) {
  return (
    <MediaTopicCard
      href={href}
      skill="sprechen"
      title={title}
      itemKey={itemKey}
      badgeText={part}
      ctaLabel="Luyện nói"
    />
  );
}

export function WritingCard({ title, part, href, itemKey }: SkillCardProps) {
  return (
    <MediaTopicCard
      href={href}
      skill="schreiben"
      title={title}
      itemKey={itemKey}
      badgeText={part}
      ctaLabel="Luyện viết"
    />
  );
}
