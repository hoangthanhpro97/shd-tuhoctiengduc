'use client';

import { Check, Download, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { WritingTask } from '@shd/contracts';

function countWords(value: string) { return (value.trim().match(/\S+/g) ?? []).length; }

export function WritingWorkspace({ task }: { task: WritingTask }) {
  const storageKey = `writing-draft-${task.id}`;
  const [text, setText] = useState('');
  const [selfCheck, setSelfCheck] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wordCount = useMemo(() => countWords(text), [text]);
  const target = task.writingTarget.approximateWords;
  const progress = target ? Math.min(100, Math.round((wordCount / target) * 100)) : 0;
  const progressClass = target && wordCount > target * 1.4 ? 'bg-orange-500' : target && wordCount >= target * 0.8 ? 'bg-green-600' : 'bg-amber-400';

  useEffect(() => { try { setText(window.localStorage.getItem(storageKey) ?? ''); } catch { /* localStorage may be unavailable */ } }, [storageKey]);
  function update(value: string) { setText(value); try { window.localStorage.setItem(storageKey, value); } catch { /* localStorage may be unavailable */ } }
  function insert(value: string) {
    const textarea = textareaRef.current;
    if (!textarea) return update(`${text}${text && !text.endsWith(' ') ? ' ' : ''}${value}`);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${text.slice(0, start)}${value}${text.slice(end)}`;
    update(next);
    requestAnimationFrame(() => { textarea.focus(); textarea.setSelectionRange(start + value.length, start + value.length); });
  }
  function download() { const blob = new Blob([text], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${task.slug}.txt`; anchor.click(); URL.revokeObjectURL(url); }
  function check() { setSelfCheck(['Đã viết nội dung', ...(target && wordCount >= Math.round(target * 0.8) && wordCount <= Math.round(target * 1.25) ? ['Độ dài đang hợp lý'] : []), ...(text.match(/(Liebe|Sehr geehrte|Mit freundlichen|Liebe Grüße)/i) ? ['Có câu chào/kết thư cơ bản'] : [])]); }

  return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" id="writing-editor">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#da2527]">Mein Text · Schreibtraining</p><h2 className="mt-1 text-xl font-bold text-slate-900">Đến lượt bạn viết bài</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{wordCount}{target ? ` / ~${target}` : ''} từ</span></div>
    <textarea aria-label="Bài viết tiếng Đức của bạn" className="min-h-[280px] w-full resize-y rounded-xl border border-slate-300 p-4 text-sm leading-relaxed text-slate-800 outline-none transition focus:border-[#da2527] focus:ring-2 focus:ring-red-100" onChange={(event) => update(event.target.value)} placeholder="Schreiben Sie hier Ihren Text auf Deutsch …" ref={textareaRef} spellCheck value={text} />
    <div className="flex flex-wrap gap-2">{['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map((character) => <button className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-700 hover:border-red-200 hover:text-[#da2527]" key={character} onClick={() => insert(character)} type="button">{character}</button>)}</div>
    {target && <><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all ${progressClass}`} style={{ width: `${progress}%` }} /></div><p className={`text-xs leading-relaxed ${wordCount > target * 1.4 || (wordCount > 0 && wordCount < target * 0.8) ? 'text-amber-700' : wordCount >= target * 0.8 ? 'text-green-700' : 'text-slate-500'}`}>{wordCount === 0 ? `Mục tiêu tham khảo: khoảng ${target} từ.` : wordCount < target * 0.8 ? 'Bài còn hơi ngắn, hãy phát triển đủ các Leitpunkte.' : wordCount > target * 1.4 ? 'Bài đang dài hơn đáng kể so với mục tiêu tham khảo.' : 'Độ dài đang nằm trong khoảng hợp lý.'}</p></>}
    <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50" onClick={download} type="button"><Download size={14} /> Xuất file nháp (.txt)</button><button className="inline-flex items-center gap-2 rounded-xl bg-[#da2527] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#b81e20]" onClick={check} type="button"><Sparkles size={14} /> Tự kiểm tra</button></div>
    {selfCheck.length > 0 && <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">{selfCheck.map((item) => <span className="mr-3 inline-flex items-center gap-1" key={item}><Check size={13} /> {item}</span>)}</div>}
  </section>;
}
