'use client';

import { Flag, Headphones, Highlighter, LockKeyhole, Pause, Play, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ExamStudyPayload, StudyQuestion } from '../../lib/server/exam-answer-key-loader';
import { AuthModal } from '../auth/AuthModal';
import { useAuth } from '../auth/AuthProvider';
import { useProtectedAudioBlobUrl } from '../exam-room/core/audioUtils';

function QuestionExplanation({ question, unlocked, onLogin }: { question: StudyQuestion; unlocked: boolean; onLogin: () => void }) {
  return (
    <article className="border-b border-slate-200 px-5 py-5 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-extrabold leading-relaxed text-slate-900">Câu {question.order}. {question.prompt}</h3>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-700">Đáp án: {question.correctAnswer}</span>
      </div>
      <div className="mt-3 grid gap-2">
        {question.options.map((option) => <div key={option.id} className={`rounded-lg border px-3 py-2 text-xs ${option.text === question.correctAnswer ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-800' : 'border-slate-100 bg-slate-50 text-slate-600'}`}><span className="mr-2 font-extrabold">{option.id}.</span>{option.text}</div>)}
      </div>
      <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/45 p-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#da2527]">SHD KONTEXT-METHODE</p>
        {unlocked ? <><p className="mt-2 text-xs font-bold text-slate-800">Phân tích bẫy tư duy</p><p className="mt-1 text-xs leading-relaxed text-slate-600">{question.trapExplanationVi}</p><blockquote className="mt-3 border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs italic leading-relaxed text-amber-900">Zitat: “{question.citation}”</blockquote><div className="mt-3 flex flex-wrap gap-1.5">{question.tags.map((tag) => <span key={tag} className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-500">{tag}</span>)}</div></> : <><p className="mt-2 font-bold text-slate-800">Đăng nhập để xem giải thích chi tiết</p><button type="button" onClick={onLogin} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#da2527] px-3 py-2 text-xs font-bold text-white hover:bg-[#b81e20]"><LockKeyhole size={13} /> Đăng nhập ngay</button></>}
      </div>
    </article>
  );
}

export function ExamExplanationRoom({ payload }: { payload: ExamStudyPayload }) {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [tab, setTab] = useState<'explanation' | 'vocabulary'>('explanation');
  const [page, setPage] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [locate, setLocate] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const current = payload.sections[page] ?? payload.sections[0];
  const currentAudioUrl = payload.skill === 'hoeren' ? current?.stimulus?.audioUrl : undefined;
  const { blobUrl: protectedAudioUrl } = useProtectedAudioBlobUrl(currentAudioUrl);
  const allQuestions = current?.questions ?? [];
  const testNumber = (payload.canonicalSlug.match(/(\d+)$/)?.[1] ?? '01').padStart(2, '0');
  const words = useMemo(() => [...new Set(allQuestions.flatMap((question) => question.prompt.split(/\s+/u).filter((word) => word.length > 5).slice(0, 5)))].slice(0, 10), [allQuestions]);

  useEffect(() => {
    setPlaying(false);
    setAudioProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [page]);

  const toggleAudio = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  if (!current) return <main className="grid h-[100dvh] place-items-center bg-slate-50 text-sm text-slate-500">Chưa có nội dung cho kỹ năng này.</main>;
  return (
    <main className="flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50" style={{ fontSize: `${fontScale}em` }}>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={`/de-thi/${payload.canonicalSlug}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-[#da2527]/40 hover:text-[#da2527]" aria-label="Đóng">
            <X size={16} />
          </Link>
          <span className="shrink-0 text-sm font-black tracking-tight text-[#da2527]">SHD</span>
          <div className="min-w-0">
            <strong className="block truncate text-sm text-slate-900">ÖSD {payload.level} · Modelltest {testNumber} - {payload.skill === 'lesen' ? 'Lesen' : 'Hören'}</strong>
            <small className="block truncate text-[10px] text-slate-500">SHD Kontext-Methode · {current.title}</small>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/de-thi/${payload.canonicalSlug}/de-va-dap-an?skill=${payload.skill}`} className="hidden text-xs font-bold text-[#da2527] hover:underline sm:inline">Xem Answer Sheet</Link>
          <button type="button" aria-label="Giảm cỡ chữ" onClick={() => setFontScale((value) => Math.max(0.9, value - 0.1))} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 hover:border-slate-300">A−</button>
          <button type="button" aria-label="Tăng cỡ chữ" onClick={() => setFontScale((value) => Math.min(1.2, value + 0.1))} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 hover:border-slate-300">A+</button>
          <button type="button" aria-label="Đánh dấu" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:text-[#da2527]"><Flag size={15} /></button>
        </div>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        <section className="min-h-0 overflow-y-auto border-b border-slate-200 bg-white p-5 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0284c7]">Ngữ liệu · P{page + 1}</p><h1 className="mt-1 text-lg font-black text-slate-900">{current.title}</h1></div>{payload.skill === 'lesen' ? <button type="button" onClick={() => setLocate((value) => !value)} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold ${locate ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 text-slate-600'}`}><Highlighter size={14} /> Định vị đáp án</button> : <button type="button" onClick={toggleAudio} className="inline-flex items-center gap-2 rounded-lg bg-[#da2527] px-3 py-2 text-xs font-bold text-white hover:bg-[#b81e20]">{playing ? <Pause size={14} /> : <Play size={14} />} {playing ? 'Tạm dừng' : 'Phát Audio'}</button>}</div>
          {payload.skill === 'hoeren' && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              {current.stimulus?.audioUrl && (
                <audio
                  ref={audioRef}
                  src={protectedAudioUrl || undefined}
                  preload="metadata"
                  onTimeUpdate={(event) => {
                    const el = event.currentTarget;
                    if (el.duration > 0) setAudioProgress((el.currentTime / el.duration) * 100);
                  }}
                  onEnded={() => setPlaying(false)}
                />
              )}
              <div className="flex items-center gap-3">
                <button type="button" onClick={toggleAudio} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#da2527] text-white hover:bg-[#b81e20]">{playing ? <Pause size={16} /> : <Play size={16} />}</button>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#da2527] transition-all" style={{ width: `${audioProgress}%` }} /></div>
                <Headphones size={17} className="shrink-0 text-slate-500" />
              </div>
            </div>
          )}
          {current.stimulus?.type === 'text' && <article className={`whitespace-pre-line rounded-xl border p-5 text-sm leading-[1.9] text-slate-700 ${locate ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200 bg-white'}`}>{current.stimulus.content}</article>}
          {current.stimulus?.type === 'audio' && current.stimulus.dialogueTranscript ? <div className="space-y-3">{current.stimulus.dialogueTranscript.map((turn) => <div key={`${turn.speakerName}-${turn.timestampStart}`} className="rounded-xl border border-slate-200 bg-white p-3"><strong className="text-xs text-[#da2527]">{turn.speakerName}</strong><p className="mt-1 text-sm leading-relaxed text-slate-700">{turn.textDe}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{turn.textVi}</p></div>)}</div> : payload.skill === 'hoeren' && <p className="rounded-xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-500">Transcript sẽ hiển thị khi fixture có dữ liệu hội thoại song ngữ.</p>}
        </section>
        <section className="min-h-0 overflow-y-auto bg-slate-50"><div className="sticky top-0 z-10 flex border-b border-slate-200 bg-white px-5"><button type="button" onClick={() => setTab('explanation')} className={`border-b-2 px-4 py-3 text-xs font-extrabold ${tab === 'explanation' ? 'border-[#da2527] text-[#da2527]' : 'border-transparent text-slate-500'}`}>Giải thích</button><button type="button" onClick={() => setTab('vocabulary')} className={`border-b-2 px-4 py-3 text-xs font-extrabold ${tab === 'vocabulary' ? 'border-[#da2527] text-[#da2527]' : 'border-transparent text-slate-500'}`}>Từ vựng</button></div>{tab === 'explanation' ? <div className="divide-y divide-slate-200">{allQuestions.map((question) => <QuestionExplanation key={question.id} question={question} unlocked={Boolean(user)} onLogin={() => setAuthOpen(true)} />)}</div> : <div className="grid gap-3 p-5 sm:grid-cols-2">{words.map((word, index) => <div key={word} className="rounded-xl border border-slate-200 bg-white p-3"><strong className="text-sm text-slate-900">{index % 3 === 0 ? 'der' : index % 3 === 1 ? 'die' : 'das'} {word}</strong><p className="mt-1 text-xs text-slate-500">Từ khóa trọng tâm trong phần thi · nghĩa tiếng Việt theo ngữ cảnh.</p></div>)}</div>}</section>
      </div>
      <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-2"><div className="flex items-center gap-1">{payload.sections.map((section, index) => <button type="button" key={section.sectionId} onClick={() => setPage(index)} className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${index === page ? 'bg-[#da2527] text-white' : 'bg-slate-100 text-slate-600'}`}>P{index + 1}</button>)}</div><div className="flex items-center gap-2"><button type="button" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-40">Trước</button><span className="text-[10px] text-slate-500">{page + 1}/{payload.sections.length} · {allQuestions.length} câu</span><button type="button" disabled={page === payload.sections.length - 1} onClick={() => setPage((value) => Math.min(payload.sections.length - 1, value + 1))} className="rounded-lg bg-[#da2527] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40">Tiếp</button></div></footer>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </main>
  );
}
