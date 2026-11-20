import Link from 'next/link';
import type { ExamBookSet } from '../../data/exam-book-sets';
import type { PublicExamSummary } from '../../lib/server/exam-content-loader';
import { ExamBookCover } from './ExamBookCover';

const b1Stages = ['bg-sky-100/80', 'bg-blue-100/75', 'bg-cyan-100/80', 'bg-indigo-100/75'];
const b2Stages = ['bg-rose-100/75', 'bg-pink-100/75', 'bg-amber-100/75'];

export function ExamBookSetCard({ bookSet, exams }: { bookSet: ExamBookSet; exams: PublicExamSummary[] }) {
  const first = exams[0];
  const volumeIndex = Math.max(0, Number.parseInt(bookSet.volumeNumber, 10) - 1);
  const stageClassName = bookSet.level === 'B1'
    ? b1Stages[volumeIndex % b1Stages.length]
    : b2Stages[volumeIndex % b2Stages.length];
  const testCount = bookSet.examSlugs.length;
  return (
    <Link href={`/de-thi/${bookSet.slug}`} className="group block min-w-0">
      <ExamBookCover
        className="rounded-2xl"
        level={bookSet.level}
        provider="osd"
        simulationNumber={bookSet.volumeNumber}
        stageClassName={stageClassName}
        title={bookSet.title}
      />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base font-extrabold text-slate-900 transition-colors group-hover:text-[#da2527]">{bookSet.title}</h3>
          <p className="mt-1 text-xs text-slate-500">{testCount} bài test · Lesen &amp; Hören · Chuẩn Áo</p>
          {first && <p className="mt-1 text-[11px] text-slate-400">{first.durationMinutes} phút mỗi Modelltest · {bookSet.code}</p>}
        </div>
        <span className="shrink-0 pt-1 text-xs font-bold text-[#da2527]">Xem bài test <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}
