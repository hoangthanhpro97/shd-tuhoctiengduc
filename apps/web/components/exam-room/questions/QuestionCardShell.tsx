'use client';

import type { ReactNode } from 'react';
import styles from '../ExamRoom.module.css';

export function QuestionCardShell({ displayNumber, prompt, children, label = 'Câu', badge = 'Luyện tập', compact = false }: { displayNumber: number; prompt: string; children: ReactNode; label?: string; badge?: string; compact?: boolean }) {
  return <article className={compact ? `${styles.compactQuestionCard} rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm` : 'rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:px-5 sm:py-4'} data-testid="polymorphic-question-card">
    <div className={compact ? 'mb-2 flex items-start justify-between gap-2 border-b border-slate-100 pb-2' : 'mb-3 flex items-start justify-between gap-3 border-b border-slate-100 pb-3'}>
      <div className="min-w-0">
         <span className={compact ? 'text-[10px] font-bold uppercase tracking-wider text-[#da2527]' : 'text-[11px] font-bold uppercase tracking-wider text-[#da2527]'}>{label} {displayNumber}</span>
        <h2 className={compact ? 'mt-0.5 text-[14px] font-bold leading-tight text-slate-900' : 'mt-1 text-[16px] font-bold leading-snug text-slate-900'}>{prompt}</h2>
      </div>
       {badge && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">{badge}</span>}
    </div>
    {children}
  </article>;
}
