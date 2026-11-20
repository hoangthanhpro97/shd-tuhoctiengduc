'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TextHighlight, StudentNote } from '../AuxiliaryDrawer';
import type {
  OverviewQuestionItem,
  WorkstationPayload,
  WorkstationPolicy,
  WorkstationSection,
} from './types';
import { resolveWorkstationPolicy } from './types';

export interface UseWorkstationSessionOptions {
  payload: WorkstationPayload;
  attemptId?: string;
  initialAnswers?: Record<string, string | null>;
  initialFlaggedIds?: string[];
  serverOffset?: number;
  onSaveAnswer?: (questionId: string, value: string) => Promise<void>;
  onSubmitExam?: () => Promise<void>;
}

export function useWorkstationSession({
  payload,
  attemptId,
  initialAnswers = {},
  initialFlaggedIds = [],
  serverOffset: _serverOffset = 0,
  onSaveAnswer,
  onSubmitExam,
}: UseWorkstationSessionOptions) {
  const policy: WorkstationPolicy = useMemo(
    () => resolveWorkstationPolicy(payload.skill, payload.mode),
    [payload.skill, payload.mode]
  );

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const activeSection: WorkstationSection = payload.sections[activeSectionIndex] ?? payload.sections[0];
  const activePart = activeSection.part;

  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    activeSection.questions[0]?.id ?? null
  );

  // Answers map
  const [answers, setAnswers] = useState<Record<string, string | null>>(initialAnswers);
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set(initialFlaggedIds));

  // Highlights and Student Notes
  const [highlights, setHighlights] = useState<TextHighlight[]>([]);
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([]);

  // Save states
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const answerRevisions = useRef(new Map<string, number>());
  const failedSaves = useRef(new Set<string>());
  const submitting = useRef(false);

  // Scroll containers
  const stimulusScrollRef = useRef<HTMLDivElement>(null);
  const questionsScrollRef = useRef<HTMLDivElement>(null);

  // Storage key for highlights & notes (scoped by skill so Full Test Lesen & Hören never collide)
  const storageId = `${attemptId || payload.id}-${payload.skill}`;

  // Load annotations from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedHls = window.localStorage.getItem(`shd-highlights-${storageId}`);
      if (savedHls) setHighlights(JSON.parse(savedHls));
      const savedNotes = window.localStorage.getItem(`shd-notes-${storageId}`);
      if (savedNotes) setStudentNotes(JSON.parse(savedNotes));
    } catch {
      // Ignore parse errors
    }
  }, [storageId]);

  // Persist annotations
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`shd-highlights-${storageId}`, JSON.stringify(highlights));
    } catch {
      // Ignore storage errors
    }
  }, [highlights, storageId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`shd-notes-${storageId}`, JSON.stringify(studentNotes));
    } catch {
      // Ignore storage errors
    }
  }, [studentNotes, storageId]);

  // All questions aggregated
  const allQuestions = useMemo(
    () => payload.sections.flatMap((section) => section.questions),
    [payload.sections]
  );

  // Total answers scoped strictly to this skill's questions
  const answerCount = useMemo(
    () =>
      allQuestions.filter((q) => {
        const val = answers[q.id];
        return val !== null && val !== undefined && val !== '';
      }).length,
    [allQuestions, answers]
  );

  const overviewQuestions: OverviewQuestionItem[] = useMemo(() => {
    return allQuestions.map((q) => ({
      id: q.id,
      order: q.order,
      part: q.part,
      answered: answers[q.id] !== null && answers[q.id] !== undefined && answers[q.id] !== '',
      flagged: flaggedIds.has(q.id),
    }));
  }, [allQuestions, answers, flaggedIds]);

  // Active section metrics
  const answeredInActivePart = useMemo(
    () =>
      activeSection.questions.filter(
        (q) => answers[q.id] !== null && answers[q.id] !== undefined && answers[q.id] !== ''
      ).length,
    [activeSection.questions, answers]
  );
  const totalInActivePart = activeSection.questions.length;
  const unansweredInActivePart = totalInActivePart - answeredInActivePart;
  const unansweredTotal = allQuestions.length - answerCount;

  // Timer: Countdown or Stopwatch
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(() => {
    if (policy.timerBehavior === 'countdown' && payload.durationSeconds) {
      return payload.durationSeconds;
    }
    return null;
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (policy.timerBehavior === 'stopwatch') {
      const interval = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      return () => window.clearInterval(interval);
    }
    if (policy.timerBehavior === 'countdown' && remainingSeconds !== null) {
      const interval = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev === null || prev <= 0) {
            window.clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => window.clearInterval(interval);
    }
  }, [policy.timerBehavior, remainingSeconds]);

  // Navigate part
  const changePart = useCallback(
    (partNumber: number) => {
      const targetIndex = payload.sections.findIndex((s) => s.part === partNumber);
      if (targetIndex >= 0) {
        setActiveSectionIndex(targetIndex);
        const nextSec = payload.sections[targetIndex];
        if (nextSec?.questions[0]) {
          setCurrentQuestionId(nextSec.questions[0].id);
        }
        // Smooth scroll both panes to top
        stimulusScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        questionsScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [payload.sections]
  );

  // Navigate question
  const selectQuestion = useCallback(
    (questionId: string) => {
      const targetSection = payload.sections.find((s) => s.questions.some((q) => q.id === questionId));
      if (targetSection && targetSection.part !== activePart) {
        changePart(targetSection.part);
      }
      setCurrentQuestionId(questionId);
      window.setTimeout(() => {
        const node = document.querySelector<HTMLElement>(`[data-reading-question-id="${CSS.escape(questionId)}"]`);
        node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    },
    [activePart, changePart, payload.sections]
  );

  // Toggle flag
  const toggleFlag = useCallback((questionId?: string) => {
    const id = questionId ?? currentQuestionId;
    if (!id) return;
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, [currentQuestionId]);

  // Save answer
  const saveAnswer = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value || null }));
      saveQueue.current = saveQueue.current
        .then(async () => {
          setSavingQuestionId(questionId);
          if (onSaveAnswer) {
            await onSaveAnswer(questionId, value);
          } else if (attemptId) {
            const revision = answerRevisions.current.get(questionId) ?? 0;
            const res = await fetch(`/api/v1/attempts/${attemptId}/answers`, {
              method: 'PUT',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                questionId,
                selectedOption: value || null,
                revision,
                timeSpentSeconds: 0,
              }),
            });
            if (!res.ok) throw new Error('Chưa lưu được câu trả lời.');
            const data = (await res.json()) as { revision: number };
            answerRevisions.current.set(questionId, data.revision);
          }
          failedSaves.current.delete(questionId);
          setSaveError(null);
          setSavingQuestionId(null);
        })
        .catch((err: unknown) => {
          failedSaves.current.add(questionId);
          setSavingQuestionId(null);
          setSaveError(err instanceof Error ? err.message : 'Chưa lưu được câu trả lời.');
        });
    },
    [attemptId, onSaveAnswer]
  );

  // Submit test
  const submit = useCallback(async () => {
    if (submitting.current) return;
    submitting.current = true;
    await saveQueue.current;
    try {
      if (onSubmitExam) {
        await onSubmitExam();
      } else if (attemptId) {
        const response = await fetch(`/api/v1/attempts/${attemptId}/submit`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ attemptId, userAnswers: [], timeSpentPerItem: {} }),
        });
        if (response.ok) {
          window.location.href = `/ket-qua/${attemptId}`;
        }
      } else {
        alert('Bài làm đã được ghi nhận thành công!');
      }
    } catch {
      setSaveError('Chưa nộp được bài. Vui lòng kiểm tra lại kết nối.');
    } finally {
      submitting.current = false;
    }
  }, [attemptId, onSubmitExam]);

  // Auto-submit on timer end in exam mode
  useEffect(() => {
    if (policy.timerBehavior === 'countdown' && remainingSeconds === 0 && !submitting.current) {
      void submit();
    }
  }, [policy.timerBehavior, remainingSeconds, submit]);

  return {
    policy,
    activeSectionIndex,
    activeSection,
    activePart,
    currentQuestionId,
    answers,
    flaggedIds,
    highlights,
    studentNotes,
    savingQuestionId,
    saveStatus: (savingQuestionId ? 'saving' : saveError ? 'error' : 'saved') as 'saving' | 'error' | 'saved',
    saveError,
    remainingSeconds,
    elapsedSeconds,
    allQuestions,
    overviewQuestions,
    answerCount,
    totalQuestions: allQuestions.length,
    answeredInActivePart,
    totalInActivePart,
    unansweredInActivePart,
    unansweredTotal,
    stimulusScrollRef,
    questionsScrollRef,
    changePart,
    selectQuestion,
    toggleFlag,
    saveAnswer,
    submit,
    setHighlights,
    setStudentNotes,
  };
}
