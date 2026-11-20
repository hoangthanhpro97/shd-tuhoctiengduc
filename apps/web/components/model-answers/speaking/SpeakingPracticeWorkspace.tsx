'use client';

import { Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { SpeakingTask } from '@shd/contracts';

const checklistItems = [
  'Tôi đã trả lời đầy đủ các ý trong đề',
  'Tôi đã dùng từ nối / mẫu câu thích hợp',
  'Tôi nói tự nhiên, đúng thời gian',
];

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function SpeakingPracticeWorkspace({ task }: { task: SpeakingTask }) {
  const notesKey = `speaking-notes-${task.id}`;
  const checksKey = `speaking-checklist-${task.id}`;
  const [mode, setMode] = useState<'preparation' | 'speaking'>('speaking');
  const [remaining, setRemaining] = useState(Math.min(task.durationSeconds, 5 * 60));
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState('');
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  const deadlineRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      setNotes(window.localStorage.getItem(notesKey) ?? '');
      const stored = window.localStorage.getItem(checksKey);
      if (stored) setChecked(JSON.parse(stored) as boolean[]);
    } catch {
      // localStorage may be unavailable.
    }
  }, [checksKey, notesKey]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        deadlineRef.current = null;
        setRunning(false);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [running]);

  function updateNotes(value: string) {
    setNotes(value);
    try {
      window.localStorage.setItem(notesKey, value);
    } catch {
      // localStorage may be unavailable.
    }
  }

  function updateCheck(index: number, value: boolean) {
    setChecked((current) => {
      const next = current.map((item, itemIndex) => itemIndex === index ? value : item);
      try {
        window.localStorage.setItem(checksKey, JSON.stringify(next));
      } catch {
        // localStorage may be unavailable.
      }
      return next;
    });
  }

  function toggleTimer() {
    if (running) {
      const deadline = deadlineRef.current;
      if (deadline !== null) setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
      deadlineRef.current = null;
      setRunning(false);
      return;
    }
    if (remaining > 0) {
      deadlineRef.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  }

  function reset() {
    deadlineRef.current = null;
    setRunning(false);
    setRemaining(mode === 'preparation' ? 10 * 60 : Math.min(task.durationSeconds, 5 * 60));
  }

  function changeMode(nextMode: 'preparation' | 'speaking') {
    deadlineRef.current = null;
    setRunning(false);
    setMode(nextMode);
    setRemaining(nextMode === 'preparation' ? 10 * 60 : Math.min(task.durationSeconds, 5 * 60));
  }

  return (
    <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 font-sans">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#da2527]">Tự luyện nói</p>
        <h2 className="font-bold text-slate-900 text-lg mt-1">Thử thách luyện tập</h2>
        <p className="text-xs text-slate-500 mt-1">Thời lượng gợi ý: {formatTime(task.durationSeconds)}</p>
      </div>
      <div className="flex gap-2 rounded-xl bg-slate-50 p-1"><button className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold ${mode === 'preparation' ? 'bg-white text-[#da2527] shadow-sm' : 'text-slate-500'}`} onClick={() => changeMode('preparation')} type="button">Chuẩn bị · 10:00</button><button className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold ${mode === 'speaking' ? 'bg-white text-[#da2527] shadow-sm' : 'text-slate-500'}`} onClick={() => changeMode('speaking')} type="button">Trình bày · {formatTime(Math.min(task.durationSeconds, 5 * 60))}</button></div>
      <div className={`text-3xl font-extrabold font-mono tracking-widest text-center py-2 rounded-xl border ${remaining <= 10 ? 'border-red-200 bg-red-50 text-[#da2527]' : 'border-slate-200 bg-slate-50 text-slate-900'}`}>{formatTime(remaining)}</div>
      <div className="flex gap-2">
        <button className="flex-1 py-2.5 bg-[#da2527] text-white font-semibold rounded-xl text-xs hover:bg-[#b81e20] shadow-sm inline-flex items-center justify-center gap-2" onClick={toggleTimer} type="button">
          {running ? <Pause size={14} /> : <Play size={14} />}
          {running ? 'Tạm dừng' : 'Bắt đầu'}
        </button>
        <button className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 inline-flex items-center gap-2" onClick={reset} type="button">
          <RotateCcw size={14} /> Làm lại
        </button>
      </div>
      <label className="block text-xs font-bold text-slate-700">
        Ghi chú ý chính
        <textarea className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:border-[#da2527] focus:ring-1 focus:ring-[#da2527] outline-none min-h-[90px] mt-2 font-normal" onChange={(event) => updateNotes(event.target.value)} placeholder="Ghi nhanh ý chính bằng tiếng Đức..." value={notes} />
      </label>
      <div className="space-y-2 border-t border-slate-100 pt-4">
        {checklistItems.map((label, index) => (
          <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-700" key={label}>
            <input className="mt-0.5 h-4 w-4 rounded border border-slate-300 accent-[#da2527]" checked={checked[index] ?? false} onChange={(event) => updateCheck(index, event.target.checked)} type="checkbox" />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <p className="text-[11px] text-slate-500">Chế độ {mode === 'preparation' ? 'chuẩn bị' : 'trình bày'} · Tiến độ tự kiểm tra: {checked.filter(Boolean).length}/3 tiêu chí · Không phải kết quả chấm thi.</p>
    </section>
  );
}
