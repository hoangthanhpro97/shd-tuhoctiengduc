'use client';

import { Eye, EyeOff, Volume2 } from 'lucide-react';
import { useState } from 'react';
import type { SpeakingTask } from '@shd/contracts';

export function SpeakingDialogViewer({ task }: { task: SpeakingTask }) {
  const [showTranslation, setShowTranslation] = useState(true);
  const turns = task.dialogueTurns ?? [];
  function playTurn(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="font-sans">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#da2527]">Teil 1 · Plan Dialog</p>
          <h3 className="font-bold text-slate-900 text-base mt-1">Hội thoại phân vai A ↔ B</h3>
        </div>
        <button
          className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm inline-flex items-center gap-2"
          onClick={() => setShowTranslation((value) => !value)}
          type="button"
        >
          {showTranslation ? <EyeOff size={14} /> : <Eye size={14} />}
          {showTranslation ? 'Ẩn giải thích' : 'Hiện giải thích'}
        </button>
      </div>
      <div className="space-y-4">
        {turns.map((turn, index) => {
          const isB = turn.speaker === 'B';
          return (
            <article className={isB ? 'flex justify-end' : 'flex justify-start'} key={`${turn.speaker}-${index}-${turn.textDe}`}>
              <div className={isB ? 'bg-red-50 text-slate-900 p-4 rounded-2xl rounded-tr-sm max-w-[85%] border border-red-200 ml-auto' : 'bg-slate-100 text-slate-900 p-4 rounded-2xl rounded-tl-sm max-w-[85%] border border-slate-200'}>
                <span className="text-[10px] font-bold text-[#da2527] uppercase tracking-wider block mb-1">{turn.functionLabel}</span>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs font-bold text-slate-500">Person {turn.speaker}</span>
                  <button aria-label={`Phát lượt thoại của Person ${turn.speaker}`} className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:text-[#da2527]" onClick={() => playTurn(turn.textDe)} type="button"><Volume2 size={13} /> Phát</button>
                </div>
                <p className="text-sm leading-relaxed" lang="de">{turn.textDe}</p>
                {showTranslation && <p className="mt-3 border-t border-slate-200/70 pt-3 text-xs leading-relaxed text-slate-500">{turn.textVi}</p>}
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-6 rounded-xl bg-red-50 p-3 text-xs leading-relaxed text-red-900">Mẹo: Hãy hỏi, phản hồi và cùng người thi đi đến quyết định thay vì chỉ đọc thuộc lòng.</p>
    </div>
  );
}
