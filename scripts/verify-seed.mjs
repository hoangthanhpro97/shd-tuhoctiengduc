import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { loadLocalEnv } from '../packages/db/dist/client.js';
import { loadSeedFixtures } from '../packages/db/dist/seed/seed-preflight.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
loadLocalEnv(root);
const connectionString = process.env.MIGRATOR_DATABASE_URL;
if (!connectionString) throw new Error('MIGRATOR_DATABASE_URL is required');

const pool = new pg.Pool({ connectionString });
const client = await pool.connect();
try {
  const fixtures = loadSeedFixtures(root);
  const expected = fixtures.reduce((acc, fixture) => {
    const questions = fixture.publicPayload.sections.flatMap((section) => section.questions);
    acc.exams += 1;
    acc.questions += questions.length;
    acc.keys += fixture.serverPayload.keys.length;
    return acc;
  }, { exams: 0, questions: 0, keys: 0 });
  const actual = {
    exams: Number((await client.query('SELECT count(*)::int AS count FROM exams')).rows[0].count),
    questions: Number((await client.query('SELECT count(*)::int AS count FROM questions')).rows[0].count),
    keys: Number((await client.query('SELECT count(*)::int AS count FROM answer_keys')).rows[0].count),
  };
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    throw new Error(`Seed parity failed: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
  console.log(`Seed parity passed: ${actual.exams} exams, ${actual.questions} questions, ${actual.keys} answer keys.`);
} finally {
  client.release();
  await pool.end();
}
