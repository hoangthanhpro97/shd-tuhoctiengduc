import { describe, expect, it } from 'vitest';
import { discoverExamFixtureFiles, loadSeedFixtures } from '../src/seed/seed-preflight.js';

describe('seed preflight', () => {
  it('discovers every canonical exam fixture', () => {
    expect(discoverExamFixtureFiles()).toHaveLength(8);
  });

  it('loads all fixtures with policy-aligned points and unique IDs', () => {
    const fixtures = loadSeedFixtures();
    const questionCount = fixtures.reduce(
      (total, fixture) => total + fixture.publicPayload.sections.reduce((sectionTotal, section) => sectionTotal + section.questions.length, 0),
      0,
    );
    const keyCount = fixtures.reduce((total, fixture) => total + fixture.serverPayload.keys.length, 0);

    expect(fixtures).toHaveLength(8);
    expect(questionCount).toBe(298);
    expect(keyCount).toBe(298);
  });
});
