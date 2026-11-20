'use client';

import { useEffect, useState } from 'react';
import type { AttemptStatePayload, ExamPublicPayload } from '@shd/contracts';
import { useExamSessionStore } from '../examSessionStore';
import { useWorkstationSession } from './useWorkstationSession';
import { WorkstationShell } from './WorkstationShell';
import { convertExamToWorkstationPayload } from './payloadConverter';
import type { WorkstationPayload } from './types';
import styles from '../ExamRoom.module.css';

export interface ExamWorkstationCoreProps {
  attemptId?: string;
  initialPayload?: WorkstationPayload;
  forceSkill?: 'lesen' | 'hoeren';
}

export function ExamWorkstationCore({ attemptId, initialPayload, forceSkill }: ExamWorkstationCoreProps) {
  const [payload, setPayload] = useState<WorkstationPayload | null>(initialPayload ?? null);
  const [serverOffset, setServerOffset] = useState(0);
  const [initialAnswers, setInitialAnswers] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (initialPayload) {
      setPayload(initialPayload);
      return;
    }

    if (!attemptId) return;

    let cancelled = false;
    useExamSessionStore.getState().reset();

    async function loadAttempt() {
      try {
        const response = await fetch(`/api/v1/attempts/${attemptId}`, { cache: 'no-store' });
        if (!response.ok) return;
        const state = (await response.json()) as AttemptStatePayload;

        const examRes = await fetch(`/api/v1/exams/${state.slug}`, { cache: 'no-store' });
        if (!examRes.ok) return;
        const exam = (await examRes.json()) as ExamPublicPayload;

        if (cancelled) return;

        setServerOffset(new Date(state.serverNow).getTime() - Date.now());

        const ansMap: Record<string, string | null> = {};
        for (const a of state.answers) {
          ansMap[a.questionId] = a.selectedOption;
        }
        setInitialAnswers(ansMap);

        const converted = convertExamToWorkstationPayload(exam, state, forceSkill);
        setPayload(converted);
      } catch (err) {
        console.error('Failed to load workstation payload:', err);
      }
    }

    void loadAttempt();
    return () => {
      cancelled = true;
    };
  }, [attemptId, initialPayload, forceSkill]);

  if (!payload) {
    return <main className={styles.loading}>Đang mở phòng làm bài...</main>;
  }

  return (
    <ActiveWorkstationCore
      payload={payload}
      attemptId={attemptId}
      initialAnswers={initialAnswers}
      serverOffset={serverOffset}
    />
  );
}

function ActiveWorkstationCore({
  payload,
  attemptId,
  initialAnswers,
  serverOffset,
}: {
  payload: WorkstationPayload;
  attemptId?: string;
  initialAnswers: Record<string, string | null>;
  serverOffset: number;
}) {
  const session = useWorkstationSession({
    payload,
    attemptId,
    initialAnswers,
    serverOffset,
  });

  return (
    <WorkstationShell
      payload={payload}
      policy={session.policy}
      activeSection={session.activeSection}
      activeSectionIndex={session.activeSectionIndex}
      activePart={session.activePart}
      currentQuestionId={session.currentQuestionId}
      answers={session.answers}
      flaggedIds={session.flaggedIds}
      highlights={session.highlights}
      studentNotes={session.studentNotes}
      saveStatus={session.saveStatus}
      saveError={session.saveError}
      remainingSeconds={session.remainingSeconds}
      elapsedSeconds={session.elapsedSeconds}
      answerCount={session.answerCount}
      totalQuestions={session.totalQuestions}
      answeredInActivePart={session.answeredInActivePart}
      unansweredInActivePart={session.unansweredInActivePart}
      unansweredTotal={session.unansweredTotal}
      overviewQuestions={session.overviewQuestions}
      stimulusScrollRef={session.stimulusScrollRef}
      questionsScrollRef={session.questionsScrollRef}
      onChangePart={session.changePart}
      onSelectQuestion={session.selectQuestion}
      onToggleFlag={session.toggleFlag}
      onSaveAnswer={session.saveAnswer}
      onSubmit={session.submit}
      onAddHighlight={(text, color) => {
        session.setHighlights((prev) => [
          ...prev,
          {
            id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            text,
            color,
            part: session.activePart,
          },
        ]);
      }}
      onDeleteHighlight={(id) => {
        session.setHighlights((prev) => prev.filter((h) => h.id !== id));
      }}
      onSaveNote={({ quote, content }) => {
        session.setStudentNotes((prev) => [
          {
            id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            quote,
            content,
            part: session.activePart,
            createdAt: new Date().toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
          ...prev,
        ]);
      }}
      onDeleteNote={(id) => {
        session.setStudentNotes((prev) => prev.filter((n) => n.id !== id));
      }}
    />
  );
}
