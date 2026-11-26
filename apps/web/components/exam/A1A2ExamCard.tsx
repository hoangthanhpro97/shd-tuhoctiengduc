import { ArrowRight, Clock3, FileText } from 'lucide-react';
import Link from 'next/link';
import { ExamBookCover } from './ExamBookCover';

export type A1A2ExamCardData = {
  slug: string;
  title: string;
  level: 'A1' | 'A2';
  profile: string;
  questions: number;
  duration: number;
  provider?: 'goethe' | 'osd' | 'telc';
  sectionsCount?: number;
  pattern?: 'book' | 'scenic' | 'minimal';
};

export function A1A2ExamCard({ exam }: { exam: A1A2ExamCardData }) {
  return (
    <article className="group min-w-0">
      <Link className="block" href={`/de-thi/${exam.slug}`}>
        <ExamBookCover level={exam.level} provider={exam.provider ?? (exam.profile.toLowerCase().includes('ösd') ? 'osd' : exam.profile.toLowerCase().includes('telc') ? 'telc' : 'goethe')} simulationNumber={exam.slug.match(/(?:-|_)(\d+)$/)?.[1] ?? '01'} title={exam.title} />
      </Link>
      <div className="mt-2.5 space-y-2">
        <h3 className="text-sm font-bold leading-relaxed text-slate-900 transition-colors group-hover:text-[#da2527]">{exam.title}</h3>
        <div className="flex flex-wrap gap-3 text-[11px] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1"><FileText size={13} /> {exam.sectionsCount ?? 2} phần thi</span>
          <span className="inline-flex items-center gap-1"><Clock3 size={13} /> {exam.duration} phút</span>
        </div>
        <Link className="inline-flex items-center gap-1 text-xs font-bold text-[#da2527] transition-colors hover:text-[#b81e20]" href={`/de-thi/${exam.slug}`}>
          Bắt đầu làm bài <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
