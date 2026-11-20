'use client';

import type { QuestionOption } from '@shd/contracts';
import { QuestionCardShell } from './QuestionCardShell';

export function MultipleChoiceCard({ displayNumber, prompt, options, value, onChange, label, badge, compact = false }: { displayNumber: number; prompt: string; options: QuestionOption[]; value?: string | null; onChange: (value: string) => void; label?: string; badge?: string; compact?: boolean }) {
  return <QuestionCardShell displayNumber={displayNumber} prompt={prompt} label={label} badge={badge} compact={compact}><div className={compact ? 'space-y-0.5' : 'space-y-2'}>{options.map((option) => { const selected = value === option.id; return <button className={compact ? `flex w-full items-start gap-2 rounded-md border-0 px-1.5 py-1.5 text-left text-[12px] transition-colors ${selected ? 'bg-red-50 font-bold text-[#da2527]' : 'text-slate-700 hover:bg-slate-50 hover:text-[#da2527]'}` : `flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all ${selected ? 'border-[#da2527] bg-red-50/60 text-[#da2527]' : 'border-slate-200 hover:bg-slate-50'}`} key={option.id} onClick={() => onChange(option.id)} type="button"><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${selected ? 'border-[#da2527] bg-[#da2527] text-white' : 'border-slate-300 text-slate-600'}`}>{option.id}</span><span className="min-w-0 font-medium leading-tight">{option.text}</span></button>; })}</div></QuestionCardShell>;
}
