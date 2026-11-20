'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LearningSkill } from '../../data/deep-learning-fixtures';

export function SkillPagination({ skill, page, pageCount, onChange }: { skill: LearningSkill; page: number; pageCount: number; onChange: (page: number) => void }) {
  if (pageCount < 2) return null;
  return <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label={`Phân trang bài luyện ${skill === 'Lesen' ? 'đọc' : 'nghe'}`}>
    <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Trang trước" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={14} /></button>
    {Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => <button type="button" aria-current={item === page ? 'page' : undefined} onClick={() => onChange(item)} className={`h-8 min-w-8 rounded-lg border px-2 text-xs font-bold ${item === page ? 'border-[#da2527] bg-[#da2527] text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-[#da2527] hover:text-[#da2527]'}`} key={item}>{item}</button>)}
    <button type="button" disabled={page === pageCount} onClick={() => onChange(page + 1)} aria-label="Trang sau" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={14} /></button>
  </nav>;
}
