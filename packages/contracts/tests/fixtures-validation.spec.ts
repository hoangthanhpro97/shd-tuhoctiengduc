import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { normalizeExamFixture, PublicQuestionSchema, validateExamFixture } from '../src/index.js';

const fixturesDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../../../content/exams');
const fixtureFiles = readdirSync(fixturesDirectory)
  .filter((fileName) => fileName.endsWith('.json'))
  .sort();

function collectOwnKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectOwnKeys(item, keys);
    return keys;
  }
  if (value && typeof value === 'object') {
    for (const [key, nestedValue] of Object.entries(value)) {
      keys.add(key);
      collectOwnKeys(nestedValue, keys);
    }
  }
  return keys;
}

describe('Exam fixture contracts', () => {
  it('discovers all JSON fixtures', () => {
    expect(fixtureFiles).toEqual(expect.arrayContaining([
      'b1-osd-mock-01.json', 'b2-osd-mock-01.json',
      'osd-b1-test-02.json', 'osd-b1-test-03.json', 'osd-b1-test-04.json',
      'osd-b2-test-02.json', 'osd-b2-test-03.json', 'osd-b2-test-04.json',
    ]));
  });

  describe.each(fixtureFiles)('%s', (fixtureFile) => {
    it('validates public and server payloads with matching question IDs', () => {
      const input = JSON.parse(readFileSync(join(fixturesDirectory, fixtureFile), 'utf8')) as unknown;
      const parsed = validateExamFixture(input);
      const publicQuestionIds = parsed.publicPayload.sections.flatMap((section) =>
        section.questions.map((question) => question.id),
      );
      const serverQuestionIds = parsed.serverPayload.keys.map((key) => key.questionId);

      expect(publicQuestionIds).toHaveLength(serverQuestionIds.length);
      expect(new Set(publicQuestionIds)).toEqual(new Set(serverQuestionIds));
      expect(parsed.serverPayload.keys.every((key) => key.points > 0)).toBe(true);
      expect(parsed.serverPayload.keys.every((key) => key.citation.length > 0)).toBe(true);
      expect(parsed.serverPayload.keys.every((key) => key.trapExplanationVi.length > 0)).toBe(true);
      for (const skill of ['Lesen', 'Hoeren'] as const) {
        const ids = new Set(parsed.publicPayload.sections.filter((section) => section.skill === skill).flatMap((section) => section.questions.map((question) => question.id)));
        const points = parsed.serverPayload.keys.filter((key) => ids.has(key.questionId)).reduce((sum, key) => sum + key.points, 0);
        const maximum = skill === 'Lesen' ? parsed.serverPayload.scoringPolicy.lesenMaxPoints : parsed.serverPayload.scoringPolicy.hoerenMaxPoints;
        expect(points).toBeCloseTo(maximum);
      }
    });

    it('does not expose server grading fields through the public payload', () => {
      const input = JSON.parse(readFileSync(join(fixturesDirectory, fixtureFile), 'utf8')) as unknown;
      const parsed = validateExamFixture(input);
      const publicKeys = collectOwnKeys(parsed.publicPayload);

      expect(publicKeys.has('answer')).toBe(false);
      expect(publicKeys.has('answerKey')).toBe(false);
      expect(publicKeys.has('answer_key')).toBe(false);
      expect(publicKeys.has('correctOption')).toBe(false);
      expect(publicKeys.has('trapExplanationVi')).toBe(false);
      expect(publicKeys.has('serverGradingKeys')).toBe(false);
      expect(publicKeys.has('keys')).toBe(false);

      for (const section of parsed.publicPayload.sections) {
        for (const question of section.questions) {
          expect(question.order <= 2 || question.publicExplanation === undefined).toBe(true);
        }
      }
    });
  });

  it('normalizes legacy parts without changing IDs, stimuli or total skill points', () => {
    const input = JSON.parse(readFileSync(join(fixturesDirectory, 'b1-osd-mock-01.json'), 'utf8'));
    const original = validateExamFixture(input);
    const skills = ['Lesen', 'Hoeren'];
    input.sections = skills.map((skill) => {
      const sections = input.sections.filter((section: { skill: string }) => section.skill === skill);
      return {
        sectionId: skill,
        skill,
        title: skill,
        durationMinutes: 60,
        totalQuestions: sections.reduce((sum: number, section: { totalQuestions: number }) => sum + section.totalQuestions, 0),
        parts: sections.map((section: { title: string; stimulus: unknown; questions: unknown[] }, index: number) => ({ part: index + 1, title: section.title, stimulus: section.stimulus, questions: section.questions })),
      };
    });
    const normalized = normalizeExamFixture(input);
    expect(normalized.publicPayload.sections.flatMap((section) => section.questions.map((question) => question.id))).toEqual(original.publicPayload.sections.flatMap((section) => section.questions.map((question) => question.id)));
    expect(normalized.publicPayload.sections.map((section) => section.stimulus)).toEqual(original.publicPayload.sections.map((section) => section.stimulus));
    expect(normalized.serverPayload).toEqual(original.serverPayload);
  });

  it('keeps late source explanations private and preserves source metadata', () => {
    const input = JSON.parse(readFileSync(join(fixturesDirectory, 'osd-b2-test-04.json'), 'utf8'));
    const parsed = normalizeExamFixture(input);
    const sourceQuestion = input.sections[0].questions[5];
    const publicQuestion = parsed.publicPayload.sections[0].questions[5];
    expect(publicQuestion.publicExplanation).toBeUndefined();
    expect(publicQuestion).not.toHaveProperty('sourcePage');
    expect(publicQuestion).not.toHaveProperty('taskType');
    expect(publicQuestion.questionType).toBe('multiple_choice');
    expect(parsed.raw.sections[0].questions![5].sourcePage).toBe(50);
    expect(parsed.serverPayload.keys.find((key) => key.questionId === sourceQuestion.id)?.trapExplanationVi).toContain(sourceQuestion.publicExplanation);
    expect(input.sections[0].questions[5]).toEqual(sourceQuestion);
  });

  it.each(['A', 'D', 'Richtig', 'Falsch', 'Ja', 'Nein', 'a', 'j', '0', 'Weiterbildung'])('supports the answer value %s without an answer enum', (answer) => {
    const input = JSON.parse(readFileSync(join(fixturesDirectory, 'osd-b1-test-02.json'), 'utf8'));
    const question = input.sections[0].questions[0];
    question.options = answer === 'Weiterbildung' ? [] : [{ id: answer, text: answer }, { id: 'other', text: 'Other' }];
    question.taskType = answer === 'Weiterbildung' ? 'short_text' : 'multiple_choice';
    input.serverGradingKeys.find((key: { questionId: string }) => key.questionId === question.id).correctOption = answer;
    const normalized = normalizeExamFixture(input);
    expect(normalized.serverPayload.keys[0].correctOption).toBe(answer);
    expect(normalized.publicPayload.sections[0].questions[0].options.some((option) => option.id === answer)).toBe(answer !== 'Weiterbildung');
  });

  it('rejects malformed choices, private fields and inconsistent grading data', () => {
    const input = JSON.parse(readFileSync(join(fixturesDirectory, 'osd-b1-test-02.json'), 'utf8'));
    expect(() => normalizeExamFixture({ ...input, serverGradingKeys: input.serverGradingKeys.slice(1) })).toThrow();
    input.serverGradingKeys[0].points = 2;
    expect(() => normalizeExamFixture(input)).toThrow('points mismatch');
    const question = { ...input.sections[0].questions[0] };
    delete question.taskType;
    expect(PublicQuestionSchema.safeParse({ ...question, correctOption: 'Richtig' }).success).toBe(false);
    expect(PublicQuestionSchema.safeParse({ ...question, options: [] }).success).toBe(false);
  });
});
