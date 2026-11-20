'use client';

import type { PublicQuestion } from '@shd/contracts';
import { useExamSessionStore } from '../examSessionStore';
import { BinaryChoiceCard } from './BinaryChoiceCard';
import { FillInBlankCard } from './FillInBlankCard';
import { MatchingCard } from './MatchingCard';
import { MultipleChoiceCard } from './MultipleChoiceCard';

type QuestionKind = 'binary' | 'matching' | 'fill' | 'multiple';

function inferKind(question: PublicQuestion): QuestionKind {
  if (question.questionType === 'short_text') return 'fill';
  if (question.questionType === 'binary') return 'binary';
  if (question.questionType === 'matching') return 'matching';
  if (question.questionType === 'multiple_choice') return 'multiple';
  const metadata = question as PublicQuestion & { questionType?: string; type?: string };
  const declaredType = (metadata.questionType ?? metadata.type ?? '').toLowerCase();
  if (declaredType.includes('binary') || declaredType.includes('true_false')) return 'binary';
  if (declaredType.includes('matching') || declaredType.includes('match')) return 'matching';
  if (declaredType.includes('fill') || declaredType.includes('blank')) return 'fill';
  if (declaredType.includes('multiple')) return 'multiple';
  const prompt = question.prompt.toLowerCase();
  const optionText = question.options.map((option) => option.text.toLowerCase());
  if (prompt.includes('richtig') || prompt.includes('falsch') || prompt.includes('ja/nein') || (question.options.length === 2 && optionText.some((text) => text.includes('richtig') || text.includes('falsch') || text === 'ja' || text === 'nein'))) return 'binary';
  if (prompt.includes('zuordnung') || prompt.includes('überschrift') || prompt.includes('ghép') || prompt.includes('matching')) return 'matching';
  if (!question.options.length || question.options.some((option) => option.id === 'TEXT')) return 'fill';
  return 'multiple';
}

export function QuestionRenderer({ question, displayNumber, providerFormat: _providerFormat, selectedOption, onAnswer, questionLabel, badgeLabel, compact = false }: { question: PublicQuestion; displayNumber: number; providerFormat: string; selectedOption?: string | null; onAnswer: (value: string) => void; questionLabel?: string; badgeLabel?: string; compact?: boolean }) {
  const storeAnswer = useExamSessionStore((session) => session.answers[question.id]);
  const setAnswer = useExamSessionStore((session) => session.setAnswer);
  const value = storeAnswer !== undefined ? storeAnswer : selectedOption;
  const answer = (next: string) => { setAnswer(question.id, next); onAnswer(next); };
  const kind = inferKind(question);
  if (kind === 'binary') return <BinaryChoiceCard displayNumber={displayNumber} prompt={question.prompt} options={question.options} value={value} onChange={answer} label={questionLabel} badge={badgeLabel} compact={compact} />;
  if (kind === 'matching') return <MatchingCard displayNumber={displayNumber} prompt={question.prompt} options={question.options} value={value} onChange={answer} label={questionLabel} badge={badgeLabel} compact={compact} />;
  if (kind === 'fill') return <FillInBlankCard displayNumber={displayNumber} prompt={question.prompt} value={value} onChange={answer} label={questionLabel} badge={badgeLabel} compact={compact} />;
  return <MultipleChoiceCard displayNumber={displayNumber} prompt={question.prompt} options={question.options} value={value} onChange={answer} label={questionLabel} badge={badgeLabel} compact={compact} />;
}
