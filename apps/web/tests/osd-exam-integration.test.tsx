import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPublicExamPayload, type PublicQuestion } from '@shd/contracts';
import { getAllPublicExams, getExamBySlug, getSkillExercise, getSkillExercises, isPublicExam } from '../lib/server/exam-content-loader';
import { selectHomeHighlights } from '../data/access';
import { QuestionRenderer } from '../components/exam-room/questions/QuestionRenderer';
import { BinaryChoiceCard } from '../components/exam-room/questions/BinaryChoiceCard';
import { MatchingCard } from '../components/exam-room/questions/MatchingCard';
import { useExamSessionStore } from '../components/exam-room/examSessionStore';
import { getPublicExamBySlug } from '../lib/server/exam-service';

vi.mock('server-only', () => ({}));
const dbQuery = vi.hoisted(() => vi.fn());
vi.mock('../lib/server/db', () => ({ getAppPool: () => ({ query: dbQuery }) }));

const repoRoot = process.cwd().replace(/\\/g, '/').endsWith('apps/web') ? resolve(process.cwd(), '../..') : process.cwd();
const examDirectory = resolve(repoRoot, 'content/exams');
const fixtures = readdirSync(examDirectory).filter((file) => file.endsWith('.json')).map((file) => createPublicExamPayload(JSON.parse(readFileSync(resolve(examDirectory, file), 'utf8'))));
const expectedSlugs = [
  'osd-b1-mock-01',
  'osd-b1-test-02',
  'osd-b1-test-03',
  'osd-b1-test-04',
  'osd-b1-test-05',
  'osd-b1-test-06',
  'osd-b1-test-07',
  'osd-b1-test-08',
  'osd-b1-test-09',
  'osd-b1-test-10',
  'osd-b1-test-11',
  'osd-b1-test-12',
  'osd-b1-test-13',
  'osd-b1-test-14',
  'osd-b1-test-15',
  'b2-osd-mock-01',
  'osd-b2-test-02',
  'osd-b2-test-03',
  'osd-b2-test-04',
  'osd-b2-test-05',
  'osd-b2-test-06',
  'osd-b2-test-07',
  'osd-b2-test-08',
  'osd-b2-test-09',
  'osd-b2-test-10',
];

describe('ÖSD exam integration', () => {
  beforeEach(() => { useExamSessionStore.getState().reset(); dbQuery.mockReset(); });

  it('loads all 25 real exams (15 B1 + 10 B2) in level and test order without private grading keys', async () => {
    const catalog = await getAllPublicExams();
    expect(catalog.map((exam) => exam.slug)).toEqual(expectedSlugs);
    expect(catalog.filter((exam) => exam.cefrLevel === 'B1')).toHaveLength(15);
    expect(catalog.filter((exam) => exam.cefrLevel === 'B2')).toHaveLength(10);
    for (const slug of expectedSlugs) {
      const exam = await getExamBySlug(slug);
      expect(exam).not.toBeNull();
      expect(JSON.stringify(exam)).not.toMatch(/"(?:serverGradingKeys|correctOption|trapExplanationVi|sourcePage|taskType)"/);
    }
    expect(isPublicExam({ ...fixtures[0], examMetadata: { ...fixtures[0].examMetadata, title: 'ÖSD B1 Synthetic Mock' } })).toBe(false);
    expect(isPublicExam({ ...fixtures[0], examMetadata: { ...fixtures[0].examMetadata, slug: 'osd-demo' } })).toBe(false);
  });

  it.each(['Lesen', 'Hoeren'] as const)('extracts every %s section and resolves its exact source questions', async (skill) => {
    const exercises = await getSkillExercises(skill);
    const sections = fixtures.flatMap((exam) => exam.sections.filter((section) => section.skill === skill));
    expect(exercises).toHaveLength(sections.length);
    expect(new Set(exercises.map((exercise) => exercise.sourceExamSlug))).toEqual(new Set(expectedSlugs));
    for (const exercise of exercises) {
      const resolved = await getSkillExercise(skill, exercise.slug);
      const source = await getExamBySlug(exercise.sourceExamSlug);
      const section = source!.sections.filter((candidate) => candidate.skill === skill)[Number(exercise.teil.replace(/\D/g, '')) - 1];
      expect(resolved?.title).toBe(section.stimulus?.title ?? section.title);
      expect(resolved?.durationMinutes).toBe(section.durationMinutes);
      expect(resolved?.sectionId).toBe(section.sectionId);
      expect(resolved?.parts).toEqual([...new Set(section.questions.map((question) => question.part))].sort((a, b) => a - b));
      expect(resolved?.reviewQuestions.map((question) => question.id)).toEqual(section.questions.map((question) => question.id));
    }
    const highlights = selectHomeHighlights(exercises);
    expect(highlights.map((exercise) => exercise.level)).toEqual(['B1', 'B1', 'B2', 'B2']);
    expect(new Set(highlights.map((exercise) => exercise.sourceExamSlug)).size).toBe(4);
  });

  it('selects two B1 and two B2 exam cards for the homepage', async () => {
    const catalog = await getAllPublicExams();
    const highlights = selectHomeHighlights(catalog.map((exam) => ({ ...exam, level: exam.cefrLevel })));
    expect(highlights.map((exam) => exam.slug)).toEqual(['osd-b1-mock-01', 'osd-b1-test-02', 'b2-osd-mock-01', 'osd-b2-test-02']);
  });

  it('renders every source question without exposing a grading key', () => {
    for (const exam of fixtures) {
      for (const question of exam.sections.flatMap((section) => section.questions)) {
        const html = renderToStaticMarkup(createElement(QuestionRenderer, { question, displayNumber: question.order, providerFormat: exam.examMetadata.providerFormat, onAnswer: vi.fn() }));
        expect(html).not.toMatch(/serverGradingKeys|correctOption|trapExplanationVi/);
        if (question.questionType === 'matching') expect(html).toContain('<select');
        if (question.questionType === 'multiple_choice') expect(html).not.toContain('type="text"');
      }
    }
  });

  it('preserves binary option IDs and saves one matching label rather than a JSON map', () => {
    const onChange = vi.fn();
    const options = [{ id: 'R', text: 'Richtig' }, { id: 'F', text: 'Falsch' }];
    const binary = BinaryChoiceCard({ displayNumber: 1, prompt: 'Aussage', options, onChange });
    const binaryButtons = binary.props.children.props.children;
    binaryButtons[0].props.onClick();
    expect(onChange).toHaveBeenLastCalledWith('R');
    const matching = MatchingCard({ displayNumber: 1, prompt: 'Situation', options: [{ id: 'a', text: 'Anzeige a' }, { id: '0', text: 'Keine Anzeige' }], onChange });
    matching.props.children[1].props.onChange({ target: { value: '0' } });
    expect(onChange).toHaveBeenLastCalledWith('0');
    const yesNo = renderToStaticMarkup(createElement(QuestionRenderer, { question: { id: 'opinion', order: 1, part: 1, prompt: 'Meinung', options: [{ id: 'Ja', text: 'Ja' }, { id: 'Nein', text: 'Nein' }], questionType: 'binary' }, displayNumber: 1, providerFormat: 'ÖSD', onAnswer: vi.fn() }));
    expect(yesNo).toContain('Nein');
    expect(yesNo).not.toContain('Richtig');
  });

  it('renders genuine short text without publishing an expected answer', () => {
    const question: PublicQuestion = { id: 'fill', order: 3, part: 1, prompt: 'Ergänzen Sie ein Wort.', options: [], questionType: 'short_text' };
    const html = renderToStaticMarkup(createElement(QuestionRenderer, { question, displayNumber: 3, providerFormat: 'ÖSD', onAnswer: vi.fn() }));
    expect(html).toContain('type="text"');
    expect(html).not.toContain('correctOption');
  });

  it('preserves canonical question types and zero options in the database public projection', async () => {
    const exam = fixtures.find((fixture) => fixture.examMetadata.slug === 'osd-b1-test-02')!;
    const sections = structuredClone(exam.sections);
    sections[0].questions[0] = { ...sections[0].questions[0], options: [], questionType: 'short_text' };
    const metadata = exam.examMetadata;
    dbQuery.mockResolvedValue({ rows: [{
      exam_id: 'db-only-exam', exam_code: 'db-only-exam', slug: 'osd-db-only', title: 'ÖSD database projection',
      provider_format: metadata.providerFormat, cefr_level: metadata.cefrLevel, disclaimer: metadata.disclaimer,
      total_duration_minutes: metadata.totalDurationMinutes, pass_percentage: metadata.passPercentage,
      scoring_policy: metadata.scoringPolicy, sections,
    }] });
    const result = await getPublicExamBySlug('osd-db-only');
    expect(result?.examMetadata.slug).toBe('osd-db-only');
    expect(result?.sections[0].questions[0]).toMatchObject({ questionType: 'short_text', options: [] });
    expect(result?.sections[0].questions.some((question) => question.questionType === 'matching')).toBe(true);
    expect(dbQuery.mock.calls[0][0]).toContain('JOIN question_types');
    expect(dbQuery.mock.calls[0][0]).not.toContain('answer_keys');
    expect(JSON.stringify(result)).not.toMatch(/serverGradingKeys|correctOption|trapExplanationVi/);
  });
});
