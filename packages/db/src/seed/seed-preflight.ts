import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { validateExamFixture, type ParsedExamFixture } from '@shd/contracts';
import type { SeedExam } from './seed-types.js';

export function getExamFixturesDirectory(repositoryRoot = process.cwd()): string {
  return resolve(repositoryRoot, 'content', 'exams');
}

export function discoverExamFixtureFiles(repositoryRoot = process.cwd()): string[] {
  return readdirSync(getExamFixturesDirectory(repositoryRoot))
    .filter((fileName) => fileName.endsWith('.json'))
    .sort()
    .map((fileName) => join(getExamFixturesDirectory(repositoryRoot), fileName));
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(value);
}

function assertPointPolicy(parsed: ParsedExamFixture, fileName: string): void {
  const keys = new Map(parsed.serverPayload.keys.map((key) => [key.questionId, key.points]));
  for (const skill of ['Lesen', 'Hoeren'] as const) {
    const actual = parsed.publicPayload.sections.filter((section) => section.skill === skill).flatMap((section) => section.questions).reduce((sum, question) => sum + (keys.get(question.id) ?? 0), 0);
    const expected = skill === 'Lesen'
       ? parsed.publicPayload.examMetadata.scoringPolicy.lesenMaxPoints
       : parsed.publicPayload.examMetadata.scoringPolicy.hoerenMaxPoints;
    if (Math.abs(actual - expected) > 0.001) {
      throw new Error(
        `${fileName}: ${skill} points ${actual.toFixed(2)} do not match policy ${expected.toFixed(2)}`,
      );
    }
  }
}

function assertPublicGate(parsed: ParsedExamFixture, fileName: string): void {
  for (const skill of ['Lesen', 'Hoeren'] as const) {
    const questions = parsed.publicPayload.sections.filter((section) => section.skill === skill).flatMap((section) => section.questions);
    const publicIds = questions.filter((question) => question.publicExplanation !== undefined).map((question) => question.id);
    const expected = questions.slice(0, Math.min(2, questions.length)).map((question) => question.id);
    if (JSON.stringify(publicIds) !== JSON.stringify(expected)) {
      throw new Error(`${fileName}: public explanations must cover the first two questions of each skill`);
    }
  }
}

export function parseSeedFixture(filePath: string): SeedExam {
  const fileName = filePath.split(/[\\/]/).at(-1) ?? filePath;
  const input = JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
  const parsed = validateExamFixture(input);
  assertPointPolicy(parsed, fileName);
  assertPublicGate(parsed, fileName);
  const contentHash = createHash('sha256').update(canonicalJson(input)).digest('hex');
  return {
    fileName,
    publicPayload: parsed.publicPayload,
    serverPayload: parsed.serverPayload,
    contentHash,
  };
}

export function loadSeedFixtures(repositoryRoot = process.cwd()): SeedExam[] {
  const fixtures = discoverExamFixtureFiles(repositoryRoot).map(parseSeedFixture);
  const ids = new Set<string>();
  for (const fixture of fixtures) {
    const id = fixture.publicPayload.examMetadata.examId;
    if (ids.has(id)) throw new Error(`Duplicate examId in seed fixtures: ${id}`);
    ids.add(id);
  }
  return fixtures;
}
