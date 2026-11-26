'use client';

import type { PublicQuestion } from '@shd/contracts';
import { QuestionRenderer } from './QuestionRenderer';
import { QuestionCardShell } from './QuestionCardShell';
import styles from '../ExamRoom.module.css';

function cleanReadingPrompt(prompt: string) {
  return prompt
    .replace(/^\s*Teil\s+\d+\s*\([^)]*\)\s*:\s*/i, '')
    .replace(/^\s*Teil\s+\d+\s*[-–—:]\s*/i, '')
    .trim();
}

/** Reading-specific entry point keeps the room contract explicit while reusing the polymorphic cards. */
export function ReadingQuestionRenderer({ question, displayNumber, providerFormat, selectedOption, onAnswer, compact = false }: { question: PublicQuestion; displayNumber: number; providerFormat: string; selectedOption?: string | null; onAnswer: (value: string) => void; compact?: boolean }) {
  const cleanQuestion = { ...question, prompt: cleanReadingPrompt(question.prompt) };
  return <div className={styles.readingRenderer} data-reading-part={question.part} data-question-format={question.questionType ?? 'multiple_choice'}><QuestionRenderer question={cleanQuestion} displayNumber={displayNumber} providerFormat={providerFormat} selectedOption={selectedOption} onAnswer={onAnswer} questionLabel="Aufgabe" badgeLabel="" compact={compact} /></div>;
}

export function ReadingMatchingMatrix({ questions, selectedOptions, onAnswer, compact = false }: { questions: PublicQuestion[]; selectedOptions: Map<string, string | null>; onAnswer: (questionId: string, value: string) => void; compact?: boolean }) {
  const rawLabels = [...new Set(questions.flatMap((question) => question.options.map((option) => option.id)))];
  const labels = rawLabels.includes('0') ? [...rawLabels.filter((label) => label !== '0'), '0'] : rawLabels;
  const badgeLabel = labels.includes('0') ? 'Anzeigen a–j · 0' : 'Anzeigen a–j';
  return <QuestionCardShell displayNumber={questions[0]?.order ?? 13} prompt="Situationen und Anzeigen zuordnen" label="Teil 3" badge={badgeLabel} compact={compact}><p className={compact ? 'mb-2 text-[12px] leading-tight text-slate-500' : 'mb-4 text-xs leading-relaxed text-slate-500'}>Ordnen Sie jeder Situation die passende Anzeige zu. Wählen Sie direkt in der Matrix ein Kennzeichen von a bis j{labels.includes('0') ? ' oder 0 (keine Anzeige passt)' : ''}.</p><div className="overflow-x-auto rounded-xl border border-slate-200"><table className="min-w-[650px] w-full border-collapse text-center text-xs"><thead><tr className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500"><th className="sticky left-0 bg-slate-50 px-3 py-3 text-left">Aufgabe</th>{labels.map((label) => <th key={label} className="px-2 py-3">{label}</th>)}</tr></thead><tbody>{questions.map((question) => <tr key={question.id} data-reading-question-id={question.id} className="border-t border-slate-100"><th className="sticky left-0 bg-white px-3 py-3 text-left font-bold text-slate-700">{question.order}</th>{labels.map((label) => <td key={label} className="px-1.5 py-2"><button type="button" aria-label={`Aufgabe ${question.order}, Anzeige ${label}`} onClick={() => onAnswer(question.id, label)} className={`grid h-8 w-full min-w-8 place-items-center rounded-md border text-xs font-bold ${selectedOptions.get(question.id) === label ? 'border-[#da2527] bg-[#da2527] text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-[#da2527] hover:text-[#da2527]'}`}>{selectedOptions.get(question.id) === label ? '✓' : label}</button></td>)}</tr>)}</tbody></table></div></QuestionCardShell>;
}
