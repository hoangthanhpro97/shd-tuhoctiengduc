'use client';

import { create } from 'zustand';

type ExamSessionState = {
  answers: Record<string, string | null>;
  setAnswer: (questionId: string, answer: string | null) => void;
  reset: () => void;
};

export const useExamSessionStore = create<ExamSessionState>((set) => ({
  answers: {},
  setAnswer: (questionId, answer) => set((current) => ({ answers: { ...current.answers, [questionId]: answer } })),
  reset: () => set({ answers: {} }),
}));

export const examSessionStore = {
  getState: useExamSessionStore.getState,
};

export type { ExamSessionState };
