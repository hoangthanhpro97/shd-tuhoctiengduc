import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { createPublicExamPayload, parseExamFixture, type AttemptStatePayload } from '@shd/contracts';
import { convertExamToWorkstationPayload } from '../components/exam-room/core/payloadConverter';
import { ReadingQuestionRenderer } from '../components/exam-room/questions/ReadingQuestionRenderer';
import { buildGoetheBookSets } from '../data/exam-book-sets';

vi.mock('server-only', () => ({}));

const repoRoot = process.cwd().replace(/\\/g, '/').endsWith('apps/web') ? resolve(process.cwd(), '../..') : process.cwd();
const examDirectory = resolve(repoRoot, 'content/exams');

function loadGoetheFixtures() {
  return readdirSync(examDirectory)
    .filter((file) => /^goethe-b1-test-\d+\.json$/u.test(file))
    .sort((a, b) => Number(a.match(/(\d+)/)?.[1] ?? 0) - Number(b.match(/(\d+)/)?.[1] ?? 0))
    .map((file) => JSON.parse(readFileSync(resolve(examDirectory, file), 'utf8')) as unknown);
}

describe('Goethe-Zertifikat B1 integration', () => {
  const rawFixtures = loadGoetheFixtures();

  it('validates every synced Goethe B1 exam (30 Lesen + 30 Hören questions, verbatim citations, bilingual transcripts)', () => {
    expect(rawFixtures.length).toBeGreaterThanOrEqual(12);

    for (const raw of rawFixtures) {
      const parsed = parseExamFixture(raw);
      const readingSections = parsed.publicPayload.sections.filter((s) => s.skill === 'Lesen');
      const listeningSections = parsed.publicPayload.sections.filter((s) => s.skill === 'Hoeren');
      expect(readingSections).toHaveLength(5);
      expect(listeningSections).toHaveLength(4);
      expect(readingSections.reduce((sum, s) => sum + s.questions.length, 0)).toBe(30);
      expect(listeningSections.reduce((sum, s) => sum + s.questions.length, 0)).toBe(30);
      expect(parsed.serverPayload.keys).toHaveLength(60);

      for (const listening of listeningSections) {
        expect(listening.stimulus?.type).toBe('audio');
        expect(listening.stimulus?.audioUrl).toMatch(/^\/audio\/goethe-b1\/test-\d{2}-teil-[1-4]\.mp3$/);
        expect(listening.stimulus?.dialogueTranscript?.length ?? 0).toBeGreaterThan(0);
      }
    }
  });

  it('keeps zero option ("0") selectable for Goethe Lesen Teil 3 matching questions and converts workstation repetition flags', () => {
    const firstPublic = createPublicExamPayload(rawFixtures[0]);
    const now = new Date().toISOString();
    const state: AttemptStatePayload = {
      attemptId: 'attempt-goethe-test',
      examId: firstPublic.examMetadata.examId,
      slug: firstPublic.examMetadata.slug,
      versionId: 'v1',
      mode: 'exam',
      sectionFilter: 'hoeren',
      status: 'in_progress',
      startedAt: now,
      expiresAt: now,
      serverNow: now,
      answers: [],
    };
    const workstation = convertExamToWorkstationPayload(firstPublic, state, 'hoeren');

    expect(workstation.title).toContain('Goethe-Zertifikat B1');
    expect(workstation.sections).toHaveLength(4);
    const stimuli = workstation.sections.map((section) => section.stimulus);
    expect(stimuli[0]?.type).toBe('audio');
    expect(stimuli[0]?.type === 'audio' ? stimuli[0].audioIncludesRepetition : undefined).toBe(true);
    expect(stimuli[1]?.type === 'audio' ? stimuli[1].audioIncludesRepetition : undefined).toBeUndefined();
    expect(stimuli[2]?.type === 'audio' ? stimuli[2].audioIncludesRepetition : undefined).toBeUndefined();
    expect(stimuli[3]?.type === 'audio' ? stimuli[3].audioIncludesRepetition : undefined).toBe(true);

    const readingTeil3 = firstPublic.sections[2];
    const matchingQuestion = readingTeil3.questions[0];
    expect(matchingQuestion.options.some((option) => option.id === '0')).toBe(true);
    const html = renderToStaticMarkup(
      createElement(ReadingQuestionRenderer, {
        question: matchingQuestion,
        displayNumber: 13,
        providerFormat: firstPublic.examMetadata.providerFormat,
        onAnswer: vi.fn(),
      }),
    );
    expect(html).toContain('value="0"');
    expect(html).toContain('Anzeige A');
  });

  it('builds dynamic 4-test book volumes for any number of Goethe B1 exams', () => {
    const sets12 = buildGoetheBookSets(
      Array.from({ length: 12 }, (_, i) => ({
        slug: `goethe-b1-test-${String(i + 1).padStart(2, '0')}`,
        cefrLevel: 'B1',
      })),
    );
    expect(sets12).toHaveLength(3);
    expect(sets12.map((s) => s.slug)).toEqual(['goethe-b1-tap-1', 'goethe-b1-tap-2', 'goethe-b1-tap-3']);
    expect(sets12[2].examSlugs).toEqual(['goethe-b1-test-09', 'goethe-b1-test-10', 'goethe-b1-test-11', 'goethe-b1-test-12']);

    const sets13 = buildGoetheBookSets(
      Array.from({ length: 13 }, (_, i) => ({
        slug: `goethe-b1-test-${String(i + 1).padStart(2, '0')}`,
        cefrLevel: 'B1',
      })),
    );
    expect(sets13).toHaveLength(4);
    expect(sets13[3].slug).toBe('goethe-b1-tap-4');
    expect(sets13[3].examSlugs).toEqual(['goethe-b1-test-13']);
  });
});
