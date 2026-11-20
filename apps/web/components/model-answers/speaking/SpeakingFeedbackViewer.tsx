'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import type { SpeakingTask } from '@shd/contracts';

export function SpeakingFeedbackViewer({ task }: { task: SpeakingTask }) {
  const [copied, setCopied] = useState<string | null>(null);
  const cards = task.feedbackCards ?? [];

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
    <div className="font-sans">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#da2527]">Teil 3 · Feedback & Q&A</p>
        <h3 className="font-bold text-slate-900 text-base mt-1">Nhận xét và hỏi đáp</h3>
      </div>
      <div className="space-y-3">
        {cards.map((card) => (
          <article className="p-4 rounded-xl bg-slate-50 border border-slate-200" key={`${card.category}-${card.phraseDe}`}>
            <div className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-bold text-[#da2527] uppercase tracking-wider">{card.category}</span>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200" aria-label={`Copy ${card.phraseDe}`} onClick={() => void copy(card.phraseDe)} type="button">
                {copied === card.phraseDe ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-800" lang="de">{card.phraseDe}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{card.phraseVi}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
