import { describe, expect, it } from 'vitest';
import { getSkillExerciseTitle, matchesSkillExercise } from '../lib/skill-catalog';
import { getTopicVisual } from '../lib/topic-visuals';
import type { SkillExercise } from '../lib/server/exam-content-loader';

const exercise = (overrides: Partial<SkillExercise> = {}): SkillExercise => ({
  slug: 'osd-b1-test-02-lesen-1',
  title: 'Kỹ năng Đọc hiểu (Leseverstehen)',
  level: 'B1',
  provider: 'ÖSD',
  teil: 'Teil 1',
  skill: 'Lesen',
  questions: 30,
  attempts: 0,
  description: 'Reading fixture',
  topic: 'Kỹ năng Đọc hiểu (Leseverstehen)',
  sourceExamSlug: 'osd-b1-test-02',
  sectionId: 'sec_osd_b1_t2_lesen',
  durationMinutes: 65,
  parts: [1, 2, 3, 4, 5],
  reviewQuestions: [],
  vocabulary: [],
  content: undefined,
  audioUrl: undefined,
  transcript: undefined,
  ...overrides,
});

describe('shared Lesen/Hören catalogue rules', () => {
  it('replaces generic Lesen titles with a pure topic label without provider or test number', () => {
    expect(getSkillExerciseTitle(exercise())).toBe('Blog, Presse & Anzeigen');
    expect(getSkillExerciseTitle(exercise({ topic: 'ÖSD B1 Modelltest 02 · Lesen: fünf authentische Prüfungsteile' }))).toBe('Blog, Presse & Anzeigen');
  });

  it('matches normalized search, level, provider, and actual Teil values', () => {
    expect(matchesSkillExercise(exercise(), { query: 'blog presse', levels: ['B1'], providers: ['ÖSD'], teils: ['Teil 4'] })).toBe(true);
    expect(matchesSkillExercise(exercise(), { query: 'unused', levels: [], providers: [], teils: [] })).toBe(false);
  });

  it('combines multiple selections within a group and intersects groups', () => {
    const item = exercise({ parts: [1, 4] });
    const filters = { query: 'OSD B1 TEST 02', levels: ['B2', 'B1'], providers: ['ÖSD'], teils: ['Teil 3', 'Teil 4'] };
    expect(matchesSkillExercise(item, filters)).toBe(true);
    expect(matchesSkillExercise(item, { ...filters, levels: ['B2'] })).toBe(false);
    expect(matchesSkillExercise(item, { ...filters, providers: ['Goethe'] })).toBe(false);
    expect(matchesSkillExercise(item, { ...filters, teils: ['Teil 2', 'Teil 3'] })).toBe(false);
  });

  it('searches displayed topics and metadata without requiring accents', () => {
    const item = exercise({ title: 'Kỹ năng Đọc hiểu B2 (Leseverstehen)', topic: 'Kỹ năng Đọc hiểu B2 (Leseverstehen)', sourceExamSlug: 'osd-b2-test-03', level: 'B2' });
    expect(getSkillExerciseTitle(item)).toBe('Körperbild, Ernährung & Werbebrief');
    expect(matchesSkillExercise(item, { query: 'korperbild ernahrung', levels: [], providers: [], teils: [] })).toBe(true);
    expect(matchesSkillExercise(item, { query: 'ĐỌC HIỂU', levels: [], providers: [], teils: [] })).toBe(true);
  });

  it('keeps Hören topics and URLs independent of Lesen titles', () => {
    const item = exercise({ skill: 'Hoeren', title: 'Kỹ năng Nghe hiểu B2 (Hörverstehen)', topic: 'Kỹ năng Nghe hiểu B2 (Hörverstehen)', level: 'B2', sourceExamSlug: 'osd-b2-test-03' });
    expect(getSkillExerciseTitle(item)).toBe('Vegetarismus & Camping im Burgenland');
  });

  it('preserves specific source topic titles cleanly and chooses varied, deterministic reading images', () => {
    const item = exercise({ topic: 'Blog von Michael: Mein Umzug nach Berlin', sourceExamSlug: 'osd-b1-mock-01' });
    expect(getSkillExerciseTitle(item)).toBe('Blog von Michael: Mein Umzug nach Berlin');
    expect(getSkillExerciseTitle(exercise({ topic: 'Lesetext Blatt 1: Psychologie der Partnerwahl (S. 118)' }))).toBe('Psychologie der Partnerwahl');
    expect(getSkillExerciseTitle(exercise({ skill: 'Hoeren', topic: 'Hörtexte Teil 1: 5 Durchsagen und Telefonnachrichten' }))).toBe('5 Durchsagen und Telefonnachrichten');
    const images = [2, 3, 4].map((number) => getTopicVisual('lesen', 'Reading exercise', `osd-b1-test-0${number}-lesen-1`).imageUrl);
    expect(new Set(images).size).toBe(3);
    expect(getTopicVisual('lesen', 'Reading exercise', 'osd-b1-test-02-lesen-1').imageUrl).toBe(images[0]);
  });
});
