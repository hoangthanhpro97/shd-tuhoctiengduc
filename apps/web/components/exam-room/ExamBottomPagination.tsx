'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ExamRoom.module.css';
import { QuestionOverviewPopover, type OverviewQuestion } from './QuestionOverviewPopover';

type ExamBottomPaginationProps = {
  questions: OverviewQuestion[];
  activePart: number;
  isLoggedIn?: boolean;
  onSelectPart: (part: number) => void;
  onSelectQuestion: (question: OverviewQuestion) => void;
  onPreviousPart: () => void;
  onNextPart: () => void;
  onSubmit: () => void;
  onOverview: () => void;
  overviewOpen: boolean;
  currentId: string;
};

export function ExamBottomPagination({
  questions,
  activePart,
  isLoggedIn: _isLoggedIn = true,
  onSelectPart,
  onSelectQuestion,
  onPreviousPart,
  onNextPart,
  onSubmit,
  onOverview,
  overviewOpen,
  currentId,
}: ExamBottomPaginationProps) {
  const activeQuestions = questions.filter((question) => question.part === activePart);
  const parts = [...new Set(questions.map((question) => question.part))].sort((a, b) => a - b);
  const activeIndex = parts.indexOf(activePart);
  const previousPart = activeIndex > 0 ? parts[activeIndex - 1] : undefined;
  const nextPart = activeIndex >= 0 ? parts[activeIndex + 1] : undefined;

  return (
    <footer className={styles.readingBottom}>
      <div className={styles.readingBottomOverview}>
        <QuestionOverviewPopover
          questions={questions}
          currentId={currentId}
          open={overviewOpen}
          onToggle={onOverview}
          onSelect={onSelectQuestion}
        />
      </div>
      <nav className={styles.readingNavigationTrack} aria-label="Điều hướng Teil và câu hỏi">
        {parts.slice(0, activeIndex).map((part) => (
          <button
            type="button"
            key={part}
            onClick={() => onSelectPart(part)}
            className={styles.readingSmartPart}
            aria-label={`Mở Teil ${part}`}
          >
            T{part}
          </button>
        ))}
        <span className={styles.readingSmartPartActive}>TEIL {activePart}</span>
        <div className={styles.readingSmartQuestionNumbers}>
          {activeQuestions.map((question) => (
            <button
              type="button"
              key={question.id}
              onClick={() => onSelectQuestion(question)}
              className={`${styles.readingSmartQuestionNumber} ${
                question.answered ? styles.readingSmartQuestionAnswered : ''
              }`}
              aria-label={`Aufgabe ${question.order}`}
            >
              {question.order}
            </button>
          ))}
        </div>
        {parts.slice(activeIndex + 1).map((part) => (
          <button
            type="button"
            key={part}
            onClick={() => onSelectPart(part)}
            className={styles.readingSmartPart}
            aria-label={`Mở Teil ${part}`}
          >
            T{part}
          </button>
        ))}
      </nav>
      <div className={styles.readingBottomActions}>
        {previousPart !== undefined && (
          <button type="button" className={styles.readingSectionBackButton} onClick={onPreviousPart}>
            <ChevronLeft size={14} /> Teil {previousPart}
          </button>
        )}
        {nextPart !== undefined ? (
          <button type="button" className={styles.readingBottomNext} onClick={onNextPart}>
            Teil {nextPart} <ChevronRight size={14} />
          </button>
        ) : (
          <button type="button" className={styles.readingBottomNext} onClick={onSubmit}>
            Nộp bài
          </button>
        )}
      </div>
    </footer>
  );
}
