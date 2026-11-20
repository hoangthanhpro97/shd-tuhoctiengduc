'use client';

import { Play, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { VocabularyPanel } from '../review/VocabularyPanel';
import type { VocabularyEntry } from '../../data/deep-learning-fixtures';
import { ModelAnswerExercise } from './ModelAnswerExercise';
import type { ModelAnswerExerciseItem } from '../../data/learning-fixtures';

type Item = { teil: string; title: string; level: string; prompt: string; sample: string; translation: string; redemittel: string[]; topic?: string; outline?: string[]; vocabulary?: VocabularyEntry[]; exercise?: ModelAnswerExerciseItem[]; audioSampleUrl?: string };

function speak(text: string) { if (typeof window === 'undefined' || !('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'de-DE'; window.speechSynthesis.speak(utterance); }

export function ModelAnswerDetail({ item, kind }: { item: Item; kind: string }) {
  const [tab, setTab] = useState<'sample' | 'outline' | 'vocabulary'>('sample');
  const isSpeaking = kind.toLowerCase() === 'sprechen';
  return (
    <main className="catalog-page">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="eyebrow">{kind} · {item.level} · {item.teil}</p><h1>{item.title}</h1>
        <section className="review-card model-prompt-card !rounded-2xl !border-slate-200 !p-6"><h2>Đề bài</h2><p className="text-slate-800">{item.prompt}</p></section>
        <nav className="model-detail-tabs mt-6" role="tablist" aria-label="Nội dung bài mẫu">
          {([['sample', 'Bài mẫu từng phần'], ['outline', 'Dàn ý chi tiết'], ['vocabulary', 'Từ vựng / Redemittel']] as const).map(([value, label]) => <button className={tab === value ? 'is-active' : ''} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} key={value}>{label}</button>)}
        </nav>
        {tab === 'sample' && <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="m-0">Bài mẫu tiếng Đức</h2>{isSpeaking && <button className="icon-action" type="button" onClick={() => speak(item.sample)} aria-label="Nghe bài mẫu"><Volume2 size={16} /></button>}</div><p className="whitespace-pre-line text-base leading-relaxed text-slate-800">{item.sample}</p>{isSpeaking && <div className="speaking-audio-player"><button className="button button-primary" type="button" onClick={() => speak(item.sample)}><Play size={14} /> Phát audio mẫu</button><span>00:00 / 00:42</span>{item.audioSampleUrl && <audio controls src={item.audioSampleUrl} />}</div>}</article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4">Bản dịch tiếng Việt</h2><p className="whitespace-pre-line text-base leading-relaxed text-slate-800">{item.translation}</p></article>
        </div>}
        {tab === 'outline' && <section className="review-card model-outline !rounded-2xl !border-slate-200 !p-6">{(item.outline ?? ['Mở bài: Giới thiệu chủ đề và quan điểm.', 'Thân bài: Đưa ra hai luận điểm kèm ví dụ.', 'Kết bài: Tóm tắt và nêu giải pháp.']).map((part, index) => <article key={part}><span>0{index + 1}</span><p>{part}</p></article>)}</section>}
        {tab === 'vocabulary' && <section className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]"><div className="review-card !rounded-2xl !border-slate-200 !p-6"><h2>Từ vựng trọng tâm</h2>{item.vocabulary ? <VocabularyPanel vocabulary={item.vocabulary} /> : <div className="learning-empty-panel">Chưa có từ vựng trọng tâm cho bài này.</div>}</div><div className="review-card !rounded-2xl !border-slate-200 !p-6"><h2>Redemittel</h2><div className="flex flex-wrap gap-2">{item.redemittel.map((phrase) => <span className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700" key={phrase}>{phrase}</span>)}</div></div></section>}
        {item.exercise && <div className="mt-8"><ModelAnswerExercise items={item.exercise} /></div>}
      </div>
    </main>
  );
}
