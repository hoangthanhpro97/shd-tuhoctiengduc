'use client';

import { Check, RotateCcw, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ModelAnswerExerciseItem } from '../../data/learning-fixtures';

export function ModelAnswerExercise({ items }: { items: ModelAnswerExerciseItem[] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = useMemo(() => items.reduce((total, item, index) => total + (answers[index] === item.answer ? 1 : 0), 0), [answers, items]);
  const allChoices = Array.from(new Set(items.flatMap((item) => item.choices)));

  function choose(index: number, answer: string) {
    setAnswers((current) => ({ ...current, [index]: answer }));
    setChecked(false);
  }

  function reset() {
    setAnswers({});
    setChecked(false);
  }

  return (
    <section className="review-card model-exercise !rounded-2xl !border-slate-200 !p-6">
      <div className="dashboard-section-heading">
        <div><p className="eyebrow">Exercise · Redemittel</p><h2>Điền cụm từ vào đúng ngữ cảnh</h2></div>
        {checked && <span className="exercise-score">{score}/{items.length} đúng</span>}
      </div>
      <p className="exercise-intro">Chọn một cụm từ trong Word Bank cho mỗi câu. Đọc cả bản dịch để hiểu cách dùng.</p>
      <div className="mt-5">
        {items.map((item, index) => {
          const selected = answers[index] ?? '';
          const correct = checked && selected === item.answer;
          const wrong = checked && selected !== item.answer;
          return (
            <article className={`mb-3 flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center ${correct ? 'border-emerald-300 bg-emerald-50/40' : ''} ${wrong ? 'border-red-200 bg-red-50/30' : ''}`} key={item.sentence}>
              <div className="flex min-w-0 flex-1 gap-3"><div className="shrink-0 text-sm font-bold text-slate-400">{String(index + 1).padStart(2, '0')}</div><div className="min-w-0"><p className="m-0 text-base leading-relaxed text-slate-800">{item.sentence.replace(item.blank, '__________')}</p><small className="mt-1 block text-slate-500">{item.translationVi}</small></div></div>
              <div className="flex shrink-0 flex-col items-stretch gap-2 md:items-end">
                <select aria-label={`Chọn cụm từ cho câu ${index + 1}`} value={selected} onChange={(event) => choose(index, event.target.value)} className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 md:w-64">
                  <option value="">Chọn cụm từ</option>{allChoices.map((choice) => <option value={choice} key={choice}>{choice}</option>)}
                </select>
                {checked && <span className={`flex items-center gap-1 text-xs font-semibold ${correct ? 'text-emerald-700' : 'text-red-700'}`}>{correct ? <><Check size={13} /> Đúng</> : <><X size={13} /> Đáp án: {item.answer}</>}</span>}
              </div>
            </article>
          );
        })}
      </div>
      <div className="my-4 flex flex-wrap gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        {allChoices.map((choice) => <button className="inline-flex select-none items-center rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-[#da2527]" type="button" key={choice} onClick={() => { const target = items.findIndex((item, index) => !answers[index] || answers[index] === choice); if (target >= 0) choose(target, choice); }}>{choice}</button>)}
      </div>
      <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
        <button className="rounded-lg bg-[#da2527] px-6 py-2.5 font-semibold text-white transition-colors hover:bg-[#b91f21]" type="button" onClick={() => setChecked(true)}>Kiểm tra đáp án</button>
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-2.5 font-semibold text-slate-700 transition-colors hover:border-[#da2527]" type="button" onClick={reset}><RotateCcw size={15} /> Làm lại</button>
      </div>
    </section>
  );
}
