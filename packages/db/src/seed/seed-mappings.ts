import type { ExamSection, ExamStimulus, PublicQuestion, QuestionKeyDetail } from '@shd/contracts';

export function getTrackCode(): string {
  return 'german';
}

export function getStandardCode(providerFormat: string): string {
  const normalized = providerFormat.toLowerCase();
  if (normalized.includes('ösd') || normalized.includes('osd') || normalized.includes('oesd')) return 'oesd';
  if (normalized.includes('goethe')) return 'goethe';
  if (normalized.includes('telc')) return 'telc';
  return 'shd_demo';
}

export function getSkillName(skill: ExamSection['skill']): string {
  return skill === 'Hoeren' ? 'Hören' : skill;
}

export function getQuestionTypeCode(question: PublicQuestion): string {
  return question.questionType ?? 'multiple_choice';
}

export function getStimulusContent(stimulus: ExamStimulus | undefined): string | null {
  return stimulus?.content ?? null;
}

export function getStimulusAssetPath(stimulus: ExamStimulus | undefined): string | null {
  return stimulus?.audioUrl ?? null;
}

export function getQuestionPoints(key: QuestionKeyDetail): string {
  return key.points.toFixed(2);
}
