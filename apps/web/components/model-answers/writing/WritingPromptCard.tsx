'use client';

import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import type { WritingTask } from '@shd/contracts';

export function WritingPromptCard({ task }: { task: WritingTask }) {
  const [understood, setUnderstood] = useState<boolean[]>(task.requirements.map(() => false));
  const done = understood.filter(Boolean).length;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" id="writing-prompt">
      <div className="mb-4 flex items-center justify-between gap-3"><span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#da2527]">Aufgabenstellung · {task.partLabel}</span><span className="text-xs font-medium text-slate-400">CEFR {task.level}</span></div>
      <h2 className="text-lg font-bold leading-relaxed text-slate-900" lang="de">{task.instructionDe.split('\n')[0]}</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600" lang="de">{task.instructionDe.split('\n').slice(1).join(' ')}</p>
      <div className="mt-5 border-t border-slate-100 pt-4"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Leitpunkte · Yêu cầu cần xử lý</p><div className="space-y-2">{task.requirements.map((requirement, index) => <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${understood[index] ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 hover:border-red-200'}`} key={requirement.textDe}><input checked={understood[index]} className="mt-0.5 h-4 w-4 accent-[#da2527]" onChange={(event) => setUnderstood((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.checked : value))} type="checkbox" /><span className="min-w-0 flex-1"><strong className="block text-sm leading-relaxed text-slate-800" lang="de">{requirement.textDe}</strong><small className="mt-1 block text-xs leading-relaxed text-slate-500">{requirement.textVi}</small></span>{understood[index] && <CheckCircle2 className="shrink-0 text-emerald-600" size={17} />}</label>)}</div><p className="mt-3 text-xs text-slate-500">Đã hiểu {done}/{task.requirements.length} yêu cầu. Checklist này chỉ hỗ trợ tự học, không chấm nội dung.</p></div>
      <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{task.instructionVi}</p>
    </section>
  );
}
