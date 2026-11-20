import { describe, expect, it } from 'vitest';
import { SpeakingTaskSchema } from '../src/index.js';

const base = {
  id: 'goethe-b1-teil-1-party-planen',
  slug: 'goethe-b1-teil-1-party-planen',
  examProvider: 'goethe_b1' as const,
  level: 'B1' as const,
  part: 1,
  taskType: 'PLAN_DIALOG' as const,
  title: 'Gemeinsam eine Party planen',
  topic: 'eine Party organisieren',
  durationSeconds: 180,
  instructionDe: 'Besprechen Sie die folgenden Punkte.',
  instructionVi: 'Hãy cùng thảo luận các ý sau.',
  bulletPoints: ['Wann?', 'Wo?'],
  dialogueTurns: [{ speaker: 'A' as const, textDe: 'Hallo!', textVi: 'Mở lời.', functionLabel: 'MỞ ĐẦU' }],
  redemittel: [{ phraseDe: 'Wie wäre es mit ...?', phraseVi: 'Hay là ... thì sao?', category: 'Đề xuất' }],
};

describe('Speaking contract', () => {
  it('accepts dialog, presentation, and feedback task payloads', () => {
    expect(SpeakingTaskSchema.parse(base).taskType).toBe('PLAN_DIALOG');
    expect(SpeakingTaskSchema.parse({
      ...base,
      id: 'osd-b1-slides',
      slug: 'osd-b1-slides',
      examProvider: 'osd_zb1',
      part: 2,
      taskType: 'PRESENTATION_SLIDES',
      slides: [{ folieNumber: 1, titleDe: 'Einführung', titleVi: 'Giới thiệu', contentDe: 'Heute ...', contentVi: 'Hôm nay ...', pedagogicalTip: 'Nói ngắn gọn.' }],
      dialogueTurns: undefined,
    }).taskType).toBe('PRESENTATION_SLIDES');
    expect(SpeakingTaskSchema.parse({
      ...base,
      id: 'osd-zdo-feedback',
      slug: 'osd-zdo-feedback',
      examProvider: 'osd_zdo_b1',
      part: 3,
      taskType: 'FEEDBACK_QA',
      feedbackCards: [{ category: 'Rückmeldung', phraseDe: 'Das war interessant.', phraseVi: 'Điều đó thật thú vị.' }],
      dialogueTurns: undefined,
    }).taskType).toBe('FEEDBACK_QA');
  });

  it('rejects invalid provider, level, and part values', () => {
    expect(() => SpeakingTaskSchema.parse({ ...base, examProvider: 'telc_b1' })).toThrow();
    expect(() => SpeakingTaskSchema.parse({ ...base, level: 'A2' })).toThrow();
    expect(() => SpeakingTaskSchema.parse({ ...base, part: 4 })).toThrow();
  });
});
