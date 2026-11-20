'use client';

import { useRef } from 'react';
import { QuestionCardShell } from './QuestionCardShell';

const germanKeys = ['ä', 'ö', 'ü', 'ß'];

export function FillInBlankCard({ displayNumber, prompt, value, onChange, label, badge, compact = false }: { displayNumber: number; prompt: string; value?: string | null; onChange: (value: string) => void; label?: string; badge?: string; compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const insert = (character: string) => {
    const input = inputRef.current;
    if (!input) return onChange(`${value ?? ''}${character}`);
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const next = `${input.value.slice(0, start)}${character}${input.value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => input.setSelectionRange(start + character.length, start + character.length));
  };
  return <QuestionCardShell displayNumber={displayNumber} prompt={prompt} label={label} badge={badge} compact={compact}><input aria-label={`Đáp án câu ${displayNumber}`} className={compact ? 'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[12px] font-medium text-slate-900 outline-none focus:border-[#da2527] focus:ring-1 focus:ring-[#da2527]' : 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium text-slate-900 outline-none focus:border-[#da2527] focus:ring-1 focus:ring-[#da2527]'} onChange={(event) => onChange(event.target.value)} ref={inputRef} type="text" autoComplete="off" value={value ?? ''} /><div className={compact ? 'mt-1.5 flex flex-wrap items-center gap-1' : 'mt-2 flex flex-wrap items-center gap-1.5'}><span className={compact ? 'mr-1 text-[10px] text-slate-500' : 'mr-1 text-[11px] text-slate-500'}>Ký tự nhanh:</span>{germanKeys.map((character) => <button className={compact ? 'rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[12px] font-bold text-slate-700 hover:border-red-200 hover:text-[#da2527]' : 'rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[13px] font-bold text-slate-700 hover:border-red-200 hover:text-[#da2527]'} key={character} onClick={() => insert(character)} type="button">{character}</button>)}</div></QuestionCardShell>;
}
