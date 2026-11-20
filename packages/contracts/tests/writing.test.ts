import { describe, expect, it } from 'vitest';
import { WritingTaskSchema } from '../src/index.js';

const base = {
  id: 'writing-test', slug: 'writing-test', examProvider: 'goethe_b1' as const, level: 'B1' as const,
  part: 1, partLabel: 'Aufgabe 1', taskType: 'INFORMAL_EMAIL' as const, title: 'Test', topic: 'Test',
  durationSeconds: 1200, durationScope: 'TASK' as const, instructionDe: 'Schreiben Sie.', instructionVi: 'Hãy viết.',
  bulletPoints: ['Punkt'], requirements: [{ textDe: 'Beschreiben', textVi: 'Mô tả', functionLabel: 'Beschreiben' }],
  writingTarget: { approximateWords: 80, register: 'informal' as const, textTypeLabel: 'E-Mail' },
  outline: [{ section: 'Anrede', suggestionDe: 'Liebe Lea,', tipVi: 'Thân mật.' }],
  modelAnswer: { textDe: 'Liebe Lea,', textVi: 'Lea thân mến.' }, redemittel: [{ phraseDe: 'Liebe Grüße', phraseVi: 'Thân mến', category: 'Kết thư' }],
  rubric: { rubricId: 'goethe-b1', provider: 'goethe_b1' as const, criteria: [{ key: 'content', labelDe: 'Aufgabenerfüllung', explanationVi: 'Đáp ứng đề.', maxPoints: 10 }] },
  source: { contentOrigin: 'SHD_AUTHORED' as const, isOfficialExamTask: false },
};

describe('Writing contract', () => {
  it('accepts Goethe B1, ÖSD ZDÖ B1 and Goethe B2 tasks', () => {
    expect(WritingTaskSchema.parse(base).examProvider).toBe('goethe_b1');
    expect(WritingTaskSchema.parse({ ...base, id: 'zdo', examProvider: 'osd_zdo_b1', taskType: 'REPLY_EMAIL', durationScope: 'TASK' }).examProvider).toBe('osd_zdo_b1');
    expect(WritingTaskSchema.parse({ ...base, id: 'b2', examProvider: 'goethe_b2', level: 'B2', taskType: 'FORUM_POST', durationSeconds: 4500, durationScope: 'MODULE', writingTarget: { ...base.writingTarget, approximateWords: 150, register: 'neutral' } }).level).toBe('B2');
  });

  it('rejects unsupported providers and malformed writing targets', () => {
    expect(() => WritingTaskSchema.parse({ ...base, examProvider: 'telc_b1' })).toThrow();
    expect(() => WritingTaskSchema.parse({ ...base, writingTarget: { ...base.writingTarget, register: 'casual' } })).toThrow();
  });
});
