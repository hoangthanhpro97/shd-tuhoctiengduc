'use client';

import { QuestionCardShell } from './QuestionCardShell';
import type { QuestionOption } from '@shd/contracts';

export function BinaryChoiceCard({ displayNumber, prompt, options, value, onChange, label, badge, compact = false }: { displayNumber: number; prompt: string; options: QuestionOption[]; value?: string | null; onChange: (value: string) => void; label?: string; badge?: string; compact?: boolean }) {
  return <QuestionCardShell displayNumber={displayNumber} prompt={prompt} label={label} badge={badge} compact={compact}><div className={compact ? 'grid grid-cols-1 gap-1.5 sm:grid-cols-2' : 'grid grid-cols-1 gap-2 sm:grid-cols-2'}>{options.map((option) => <button className={compact ? `rounded-md border px-2 py-1.5 text-left text-[12px] transition-all ${value === option.id ? 'border-2 border-[#da2527] bg-red-50 font-bold text-[#da2527] shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}` : `rounded-lg border px-3 py-2.5 text-left transition-all ${value === option.id ? 'border-2 border-[#da2527] bg-red-50 font-bold text-[#da2527] shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`} key={option.id} onClick={() => onChange(option.id)} type="button"><span className={compact ? 'block text-[12px]' : 'block text-sm'}>{option.text}</span></button>)}</div></QuestionCardShell>;
}
