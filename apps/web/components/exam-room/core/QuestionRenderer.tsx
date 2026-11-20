'use client';

import { type CSSProperties, type RefObject } from 'react';
import { Headphones, Mic } from 'lucide-react';
import type { PublicQuestion } from '@shd/contracts';
import { ReadingMatchingMatrix, ReadingQuestionRenderer } from '../questions/ReadingQuestionRenderer';
import type { WorkstationSection } from './types';
import styles from '../ExamRoom.module.css';

export interface QuestionColumnProps {
  section: WorkstationSection;
  providerFormat?: string;
  fontScale: number;
  answers: Record<string, string | null>;
  saving?: boolean;
  saveError?: string | null;
  activePart: number;
  isLastPart: boolean;
  nextPart?: number;
  unansweredInActivePart: number;
  unansweredTotal: number;
  scrollRef?: RefObject<HTMLElement | null>;
  onAnswer: (questionId: string, value: string) => void;
  onNextPart?: () => void;
  flexProportion?: string;
}

function extractTextGroupLabel(prompt: string): string | null {
  const match = prompt.match(/^(Text\s+\d+)\s*:/i);
  return match ? match[1] : null;
}

function shortenSpeakerLabel(text: string): string {
  return text.replace(/\s*\([^)]*\)\s*/g, '').trim();
}

function isBinaryQuestion(question: PublicQuestion): boolean {
  if (question.questionType === 'binary') return true;
  if (question.options.length === 2) {
    const labels = question.options.map((o) => o.text.trim().toLowerCase());
    return (
      (labels.includes('richtig') && labels.includes('falsch')) ||
      (labels.includes('ja') && labels.includes('nein'))
    );
  }
  return false;
}

function HoerenQuestionCard({
  question,
  selectedOption,
  onAnswer,
}: {
  question: PublicQuestion;
  selectedOption?: string | null;
  onAnswer: (value: string) => void;
}) {
  const binary = isBinaryQuestion(question);

  return (
    <div
      data-reading-question-id={question.id}
      className="rounded-xl border border-slate-200/85 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:border-slate-300/90"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#da2527]">
          AUFGABE {question.order}
        </span>
        {selectedOption && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            Đã chọn
          </span>
        )}
      </div>

      <p className="mb-2 text-[calc(14px*var(--font-scale,1))] font-bold leading-snug text-slate-900">
        {question.prompt}
      </p>

      {binary ? (
        <div className="grid grid-cols-2 gap-2">
          {question.options.map((opt) => {
            const active = selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onAnswer(opt.id)}
                aria-pressed={active}
                className={`rounded-lg border px-3 py-2 text-left text-[calc(13px*var(--font-scale,1))] font-semibold transition-all ${
                  active
                    ? 'border-[#da2527] bg-red-50/90 text-[#da2527] shadow-xs'
                    : 'border-slate-200/90 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      ) : (
        /* Borderless A - B - C options for compact, clean scanning */
        <div className="space-y-0.5" data-testid={`hoeren-abc-options-${question.order}`}>
          {question.options.map((opt) => {
            const active = selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onAnswer(opt.id)}
                aria-pressed={active}
                className={`flex w-full items-center gap-2.5 rounded-lg border-0 px-2 py-1.5 text-left text-[calc(13.5px*var(--font-scale,1))] leading-snug transition-colors ${
                  active
                    ? 'bg-red-50/90 font-semibold text-[#da2527]'
                    : 'bg-transparent font-medium text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold transition-colors ${
                    active
                      ? 'bg-[#da2527] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {opt.id}
                </span>
                <span className="min-w-0 flex-1">{opt.text}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function QuestionRenderer({
  section,
  providerFormat = 'ÖSD',
  fontScale,
  answers,
  saving = false,
  saveError = null,
  activePart,
  isLastPart,
  nextPart,
  unansweredInActivePart,
  unansweredTotal,
  scrollRef,
  onAnswer,
  onNextPart,
  flexProportion = '1 1 0',
}: QuestionColumnProps) {
  const isHoeren = section.skill === 'hoeren';

  const isMatchingMatrix =
    section.skill === 'lesen' &&
    section.part === 3 &&
    section.questions.length > 0 &&
    section.questions.every((q) => q.questionType === 'matching' || q.options.some((o) => o.id === 'a'));

  const isHoerenPart4Zuordnung =
    isHoeren &&
    section.part === 4 &&
    section.questions.length > 0 &&
    section.questions.every((q) => q.options.length === 3);

  const questions = section.questions;
  const firstOrder = questions[0]?.order ?? 1;
  const lastOrder = questions.at(-1)?.order ?? firstOrder;
  const teilSubtitle =
    section.title.split(':').slice(1).join(':').trim() ||
    (isHoeren ? 'Hören' : 'Lesen');

  const speakerLegend = isHoerenPart4Zuordnung ? questions[0]?.options ?? [] : [];

  return (
    <section
      ref={scrollRef as RefObject<HTMLElement>}
      className={`${styles.pane} ${styles.questionPane} ${styles.mobileVisible}`}
      style={
        {
          flex: flexProportion,
          width: 'auto',
          '--font-scale': fontScale,
        } as CSSProperties
      }
      aria-label={`Câu hỏi Teil ${activePart}`}
    >
      {/* ================= HEADER 1 HÀNG NGANG: "Aufgaben X–Y" + "Teil N · ..." (SIZE CHỮ BẰNG NHAU) ================= */}
      <div
        data-testid="hoeren-question-header"
        className="mb-3 flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            data-testid="aufgaben-badge"
            className="shrink-0 rounded-full bg-red-50 px-2.5 py-0.5 text-[13px] font-bold leading-snug text-[#da2527]"
          >
            Aufgaben {firstOrder}–{lastOrder}
          </span>
          <h2
            data-testid="teil-heading"
            className="m-0 text-[13px] font-bold leading-snug text-slate-800"
          >
            Teil {activePart} · {teilSubtitle}
          </h2>
        </div>
        <div className="shrink-0 whitespace-nowrap text-[11px] font-medium text-slate-400">
          {saving ? 'Đang lưu...' : saveError ?? 'Đã đồng bộ an toàn'}
        </div>
      </div>

      {/* ================= HÖREN TEIL 4: SPEAKER LEGEND + BORDERLESS 3-COLUMN COMPACT CARDS ================= */}
      {isHoerenPart4Zuordnung ? (
        <>
          <div
            data-testid="hoeren-speaker-legend"
            className="mb-2.5 rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-2"
          >
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <Mic size={11} className="text-[#da2527]" />
              <span>Nhân vật trong buổi thảo luận</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
              {speakerLegend.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-[11px] font-extrabold text-[#da2527]">
                    {opt.id}
                  </span>
                  <span className="min-w-0 truncate font-semibold text-slate-700" title={opt.text}>
                    {opt.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {questions.map((question) => {
              const selected = answers[question.id];
              return (
                <div
                  key={question.id}
                  data-reading-question-id={question.id}
                  className="rounded-xl border border-slate-200/85 bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#da2527]">
                      AUFGABE {question.order}
                    </span>
                    {selected && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        Đã chọn: {selected}
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-[calc(13.5px*var(--font-scale,1))] font-bold leading-snug text-slate-900">
                    {question.prompt}
                  </p>
                  {/* Borderless 3-column A/B/C speaker buttons */}
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3" data-testid={`hoeren-abc-options-${question.order}`}>
                    {question.options.map((opt) => {
                      const active = selected === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onAnswer(question.id, opt.id)}
                          aria-pressed={active}
                          className={`flex items-center gap-2 rounded-lg border-0 px-2.5 py-1.5 text-left text-xs font-semibold transition-colors ${
                            active
                              ? 'bg-red-50/90 text-[#da2527]'
                              : 'bg-slate-50/70 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${
                              active
                                ? 'bg-[#da2527] text-white'
                                : 'bg-white text-slate-600 shadow-xs'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="min-w-0 truncate">{shortenSpeakerLabel(opt.text)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : isMatchingMatrix ? (
        <div className={styles.readingQuestionCard}>
          <ReadingMatchingMatrix
            questions={questions}
            selectedOptions={
              new Map(
                questions.map((question) => [question.id, answers[question.id] ?? null])
              )
            }
            compact
            onAnswer={onAnswer}
          />
        </div>
      ) : isHoeren ? (
        <div className="space-y-2">
          {questions.map((question, idx) => {
            const textGroup =
              section.part === 1 ? extractTextGroupLabel(question.prompt) : null;
            const prevTextGroup =
              idx > 0 && section.part === 1
                ? extractTextGroupLabel(questions[idx - 1].prompt)
                : null;
            const showGroupDivider = textGroup !== null && textGroup !== prevTextGroup;

            return (
              <div key={question.id}>
                {showGroupDivider && (
                  <div
                    className={`mb-1.5 flex items-center gap-2 ${idx > 0 ? 'mt-3' : 'mt-0.5'}`}
                    data-testid={`hoeren-group-${textGroup.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-extrabold text-[#da2527]">
                      <Headphones size={11} />
                      <span>{textGroup}</span>
                    </span>
                    <div className="h-px flex-1 bg-slate-200/75" />
                  </div>
                )}
                <HoerenQuestionCard
                  question={question}
                  selectedOption={answers[question.id]}
                  onAnswer={(value) => onAnswer(question.id, value)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        questions.map((question) => (
          <div
            key={question.id}
            data-reading-question-id={question.id}
            className={styles.readingQuestionCard}
          >
            <ReadingQuestionRenderer
              question={question}
              displayNumber={question.order}
              providerFormat={providerFormat}
              selectedOption={answers[question.id]}
              compact
              onAnswer={(value) => onAnswer(question.id, value)}
            />
          </div>
        ))
      )}

      {/* Teil End Section đã duyệt theo ảnh số 6 */}
      <div className={styles.partEnd}>
        <div className={styles.partEndDots}>···</div>
        <h3 className={styles.partEndTitle}>
          {isLastPart ? 'Hết câu hỏi của bài test' : `Hết câu hỏi của Teil ${activePart}`}
        </h3>
        {isLastPart
          ? unansweredTotal > 0 && (
              <p className={styles.partEndSubtitle}>
                Bạn còn <strong>{unansweredTotal} câu</strong> chưa trả lời. Hãy hoàn thành bài của mình nhé!
              </p>
            )
          : unansweredInActivePart > 0 && (
              <p className={styles.partEndSubtitle}>
                Bạn còn <strong>{unansweredInActivePart} câu</strong> chưa trả lời ở phần này. Hãy hoàn thành bài của mình nhé!
              </p>
            )}
        {!isLastPart && onNextPart && nextPart && (
          <button type="button" className={styles.partEndNextBtn} onClick={onNextPart}>
            Tiếp tục sang Teil {nextPart} →
          </button>
        )}
      </div>
    </section>
  );
}
