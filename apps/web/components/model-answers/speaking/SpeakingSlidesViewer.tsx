'use client';

import { ChevronLeft, ChevronRight, Eye, EyeOff, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import type { SpeakingTask } from '@shd/contracts';

const emphasisPattern = /\b(Zuerst|Danach|Anschließend|Einerseits|Andererseits|Meiner Meinung nach|Zum Schluss|Vielen Dank fürs Zuhören)\b/gu;
const emphasisToken = /^(Zuerst|Danach|Anschließend|Einerseits|Andererseits|Meiner Meinung nach|Zum Schluss|Vielen Dank fürs Zuhören)$/u;

function renderHighlightedText(text: string) {
  return text.split(emphasisPattern).map((part, index) => emphasisToken.test(part)
    ? <span className="font-bold text-[#da2527] bg-red-50 px-1 py-0.5 rounded" key={`${part}-${index}`}>{part}</span>
    : <span key={`${part}-${index}`}>{part}</span>);
}

export function SpeakingSlidesViewer({ task }: { task: SpeakingTask }) {
  const slides = task.slides ?? [];
  const [current, setCurrent] = useState(0);
  const [hidden, setHidden] = useState(false);
  const slide = slides[current];

  if (!slide) {
    return <p className="text-sm text-slate-500">Chưa có dữ liệu Folie cho bài mẫu này.</p>;
  }

  return (
    <div className="font-sans">
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-100">
        {slides.map((item, index) => (
          <button
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${current === index ? 'bg-[#da2527] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            key={item.folieNumber}
            onClick={() => setCurrent(index)}
            type="button"
          >
            Folie {item.folieNumber}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#da2527]">Teil 2 · Präsentation</p>
          <p className="text-xs text-slate-500 mt-1">Folie {current + 1} / {slides.length}</p>
        </div>
        <button
          className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm inline-flex items-center gap-2"
          onClick={() => setHidden((value) => !value)}
          type="button"
        >
          {hidden ? <Eye size={14} /> : <EyeOff size={14} />}
          {hidden ? 'Hiện bài mẫu' : 'Ẩn bài mẫu'}
        </button>
      </div>

      {hidden ? (
        <div className="min-h-64 rounded-2xl border border-dashed border-red-200 bg-red-50 p-8 flex items-center justify-center text-center text-sm leading-relaxed text-red-900">
          Bài mẫu đang ẩn để bạn luyện nói độc lập.
          <span className="block mt-2 text-xs text-red-700">Hãy tự trình bày Folie {slide.folieNumber} theo các ý chính trong đề.</span>
        </div>
      ) : (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-3">Folie {slide.folieNumber}: {slide.titleVi} <span className="font-medium text-slate-400">· {slide.titleDe}</span></h3>
          <p className="text-slate-800 leading-relaxed font-sans text-base whitespace-pre-line mb-4" lang="de">{renderHighlightedText(slide.contentDe)}</p>
          <div className="bg-orange-50/60 border-l-4 border-orange-400 p-4 rounded-r-xl text-slate-700 text-sm leading-relaxed mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-800 mb-1">Bản dịch tiếng Việt</p>
            {slide.contentVi}
          </div>
          <div className="bg-blue-50 border border-blue-200/80 p-3.5 rounded-xl text-xs text-blue-900 leading-relaxed flex items-start gap-2">
            <Lightbulb className="mt-0.5 shrink-0" size={15} />
            <span><strong>Mẹo triển khai:</strong> {slide.pedagogicalTip}</span>
          </div>
        </article>
      )}

      <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-100">
        <button
          className="px-5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={current === 0}
          onClick={() => setCurrent((value) => Math.max(0, value - 1))}
          type="button"
        >
          <ChevronLeft className="inline-block mr-1" size={14} /> Trước
        </button>
        <button
          className="bg-[#da2527] text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-[#b81e20] disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={current === slides.length - 1}
          onClick={() => setCurrent((value) => Math.min(slides.length - 1, value + 1))}
          type="button"
        >
          Tiếp <ChevronRight className="inline-block ml-1" size={14} />
        </button>
      </div>
    </div>
  );
}
