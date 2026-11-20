'use client';

import { useState } from 'react';
import { BookOpen, Headphones } from 'lucide-react';
import { ExamWorkspace } from '../ExamWorkspace';
import { ExamWorkstationCore } from './ExamWorkstationCore';

/**
 * Full-Test orchestrator (`sectionFilter === 'all'`) combining the two frozen
 * gold-standard workspaces (Lesen + Hören) without modifying either component.
 * Both workspaces remain mounted so answers, flags, highlights, notes, and timer
 * stay 100% preserved across skill switches.
 */
export function FullExamSwitcher({ attemptId }: { attemptId: string }) {
  const [activeSkill, setActiveSkill] = useState<'lesen' | 'hoeren'>('lesen');

  const switchSkill = (next: 'lesen' | 'hoeren') => {
    if (next === activeSkill) return;
    // Pause any active Hören audio element cleanly if leaving Hören tab
    if (activeSkill === 'hoeren' && typeof document !== 'undefined') {
      document.querySelectorAll('audio').forEach((audio) => {
        if (!audio.paused) audio.pause();
      });
    }
    setActiveSkill(next);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden" data-testid="full-exam-switcher">
      {/* Floating skill switcher pill cleanly positioned above the bottom bar */}
      <div
        role="tablist"
        aria-label="Chuyển đổi kỹ năng Full Test"
        data-testid="full-exam-skill-tabs"
        className="fixed bottom-[64px] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200/90 bg-white/95 p-1 shadow-[0_8px_28px_-6px_rgba(15,23,42,0.22)] backdrop-blur-sm"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeSkill === 'lesen'}
          data-testid="full-exam-tab-lesen"
          onClick={() => switchSkill('lesen')}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
            activeSkill === 'lesen'
              ? 'bg-[#da2527] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen size={13} />
          <span>Đọc hiểu (Lesen)</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSkill === 'hoeren'}
          data-testid="full-exam-tab-hoeren"
          onClick={() => switchSkill('hoeren')}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
            activeSkill === 'hoeren'
              ? 'bg-[#da2527] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Headphones size={13} />
          <span>Nghe hiểu (Hören)</span>
        </button>
      </div>

      {/* Frozen Gold Standard #1: Lesen Workspace */}
      <div
        className={activeSkill === 'lesen' ? 'h-full w-full' : 'hidden'}
        aria-hidden={activeSkill !== 'lesen'}
      >
        <ExamWorkspace attemptId={attemptId} />
      </div>

      {/* Frozen Gold Standard #2: Hören Workspace */}
      <div
        className={activeSkill === 'hoeren' ? 'h-full w-full' : 'hidden'}
        aria-hidden={activeSkill !== 'hoeren'}
      >
        <ExamWorkstationCore attemptId={attemptId} forceSkill="hoeren" />
      </div>
    </div>
  );
}
