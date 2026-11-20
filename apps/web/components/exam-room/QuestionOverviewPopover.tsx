'use client';

import { LayoutGrid, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import styles from './ExamRoom.module.css';

export type OverviewQuestion = { id: string; order: number; part: number; answered: boolean; flagged: boolean };

export function QuestionOverviewPopover({ questions, currentId, open, onToggle, onSelect }: { questions: OverviewQuestion[]; currentId: string; open: boolean; onToggle: () => void; onSelect: (question: OverviewQuestion) => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const close = (event: PointerEvent) => { if (panelRef.current && event.target instanceof Node && !panelRef.current.contains(event.target)) onToggle(); }; document.addEventListener('pointerdown', close); return () => document.removeEventListener('pointerdown', close); }, [open, onToggle]);
  const parts = [...new Set(questions.map((question) => question.part))].sort((a, b) => a - b);
  const currentPart = questions.find((question) => question.id === currentId)?.part ?? parts[0] ?? 1;
  const answeredInCurrentPart = questions.filter((question) => question.part === currentPart && question.answered).length;
  const totalAnswered = questions.filter((question) => question.answered).length;
  return <div className={styles.overviewWrap} ref={panelRef}><button type="button" className={styles.overviewTrigger} aria-label="Mở bảng câu hỏi" aria-expanded={open} onClick={onToggle}><LayoutGrid size={20} strokeWidth={2.2} /><span><strong>Teil {currentPart}</strong><small>Đã làm {answeredInCurrentPart}/{questions.filter((question) => question.part === currentPart).length}</small></span></button>{open && <section className={styles.overviewPopover} aria-label="Bảng câu hỏi"><div className={styles.overviewHeader}><div><strong>Bảng câu hỏi</strong><small>Đã làm {totalAnswered}/{questions.length} câu</small></div><button type="button" aria-label="Đóng bảng câu hỏi" onClick={onToggle}><X size={16} /></button></div>{parts.map((part) => { const group = questions.filter((question) => question.part === part); return <div className={styles.overviewGroup} key={part}><strong>Teil {part} <small>(Aufgaben {group[0].order}–{group[group.length - 1].order})</small></strong><div className={styles.overviewNumbers}>{group.map((question) => <button type="button" key={question.id} onClick={() => onSelect(question)} className={`${styles.overviewNumber} ${question.answered ? styles.overviewAnswered : ''} ${question.id === currentId ? styles.overviewCurrent : ''} ${question.flagged ? styles.overviewFlagged : ''}`} aria-label={`Aufgabe ${question.order}`}>{question.order}</button>)}</div></div>; })}</section>}</div>;
}
