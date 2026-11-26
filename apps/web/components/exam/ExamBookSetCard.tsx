import Link from 'next/link';
import type { ExamBookSet } from '../../data/exam-book-sets';
import type { PublicExamSummary } from '../../lib/server/exam-content-loader';
import { ExamBookCover } from './ExamBookCover';

const b1Stages = ['bg-sky-100/80', 'bg-blue-100/75', 'bg-cyan-100/80', 'bg-indigo-100/75'];
const goetheB1Stages = ['bg-emerald-100/75', 'bg-teal-100/75', 'bg-green-100/75', 'bg-lime-100/75'];
const b2Stages = ['bg-rose-100/75', 'bg-pink-100/75', 'bg-amber-100/75'];

export function ExamBookSetCard({ bookSet }: { bookSet: ExamBookSet; exams?: PublicExamSummary[] }) {
  const volumeIndex = Math.max(0, Number.parseInt(bookSet.volumeNumber, 10) - 1);
  const stageClassName = bookSet.level === 'B1'
    ? (bookSet.provider === 'goethe' ? goetheB1Stages[volumeIndex % goetheB1Stages.length] : b1Stages[volumeIndex % b1Stages.length])
    : b2Stages[volumeIndex % b2Stages.length];
  return (
    <Link href={`/de-thi/${bookSet.slug}`} className="group block min-w-0">
      <ExamBookCover
        className="rounded-2xl"
        level={bookSet.level}
        provider={bookSet.provider}
        simulationNumber={bookSet.volumeNumber}
        stageClassName={stageClassName}
        title={bookSet.title}
      />
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 min-w-0 text-base font-extrabold text-slate-900 transition-colors group-hover:text-[#da2527]">{bookSet.title}</h3>
        <span className="shrink-0 pt-0.5 text-xs font-bold text-[#da2527]">Xem bài test <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}
