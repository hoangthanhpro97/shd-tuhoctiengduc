'use client';

import Link from 'next/link';
import type { ExamBookSet } from '../../data/exam-book-sets';
import { examBookSets } from '../../data/exam-book-sets';

export function ExamSiblingSlider({ bookSet }: { bookSet: ExamBookSet }) {
  return (
    <nav className="mt-3 flex flex-wrap gap-2" aria-label="Chọn bộ đề ÖSD">
      {examBookSets.map((set) => {
        const active = set.slug === bookSet.slug;
        return (
          <Link
            href={`/de-thi/${set.slug}`}
            key={set.slug}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex min-w-0 items-center gap-2 rounded-lg border-2 bg-white px-3 py-2 text-left transition-colors ${active ? 'border-[#da2527] text-[#da2527]' : 'border-slate-200 text-slate-700 hover:border-[#da2527]/60 hover:text-[#da2527]'}`}
          >
            <span className="truncate text-xs font-extrabold">{set.shortTitle}</span>
            <span className={`shrink-0 text-[10px] font-bold ${active ? 'text-[#da2527]' : 'text-slate-500'}`}>{set.examSlugs.length} bài test</span>
          </Link>
        );
      })}
    </nav>
  );
}
