'use client';

import type { QuestionOption } from '@shd/contracts';
import { QuestionCardShell } from './QuestionCardShell';

export function MatchingCard({ displayNumber, prompt, options, value, onChange, label, badge, compact = false }: { displayNumber: number; prompt: string; options: QuestionOption[]; value?: string | null; onChange: (value: string) => void; label?: string; badge?: string; compact?: boolean }) {
  return <QuestionCardShell displayNumber={displayNumber} prompt={prompt} label={label} badge={badge} compact={compact}>
    <p className={compact ? 'mb-1.5 text-[12px] leading-tight text-slate-500' : 'mb-2 text-[11px] leading-relaxed text-slate-500'}>Chọn một nhãn phù hợp với tình huống của câu hỏi này.{options.some((option) => option.id === '0') ? ' Chọn 0 nếu không có phương án phù hợp.' : ''}</p>
    <select aria-label={`Ghép câu ${displayNumber}`} className={compact ? 'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[12px] text-slate-700 focus:border-[#da2527]' : 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-700 focus:border-[#da2527]'} value={value ?? ''} onChange={(event) => onChange(event.target.value)}>
      <option value="" disabled>Chọn nhãn</option>
      {options.map((option) => <option key={option.id} value={option.id}>{option.id} · {option.text}</option>)}
    </select>
    <div className={compact ? 'mt-2 space-y-1' : 'mt-3 space-y-1.5'}>{options.map((option) => <button type="button" key={option.id} className={compact ? `flex w-full gap-2 rounded-md border px-2 py-1.5 text-left text-[12px] ${value === option.id ? 'border-[#da2527] bg-red-50 text-[#da2527]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}` : `flex w-full gap-2.5 rounded-lg border px-3 py-2 text-left text-[13px] ${value === option.id ? 'border-[#da2527] bg-red-50 text-[#da2527]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`} onClick={() => onChange(option.id)}><strong className="min-w-5">{option.id}</strong><span className={compact ? 'text-[12px]' : undefined}>{option.text}</span></button>)}</div>
  </QuestionCardShell>;
}
