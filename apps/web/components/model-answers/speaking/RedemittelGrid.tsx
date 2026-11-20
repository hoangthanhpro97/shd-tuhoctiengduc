'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import type { SpeakingTask } from '@shd/contracts';

export function RedemittelGrid({ redemittel }: { redemittel: SpeakingTask['redemittel'] }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      window.setTimeout(() => setCopied((current) => current === text ? null : current), 1600);
    } catch {
      // Clipboard access can be unavailable in a restricted browser context.
    }
  }

  return (
    <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm font-sans">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#da2527]">Redemittel</p>
        <h2 className="font-bold text-slate-900 text-lg mt-1">Mẫu câu giao tiếp quan trọng</h2>
      </div>
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {redemittel.map((item) => (
          <article className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-200 transition-all flex items-start justify-between gap-2" key={item.phraseDe}>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#da2527]">{item.category}</span>
              <p className="mt-1 text-xs font-bold text-slate-800 leading-relaxed" lang="de">{item.phraseDe}</p>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{item.phraseVi}</p>
            </div>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 shrink-0" aria-label={`Copy ${item.phraseDe}`} onClick={() => void copy(item.phraseDe)} type="button">
              {copied === item.phraseDe ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
