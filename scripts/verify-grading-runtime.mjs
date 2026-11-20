import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { loadLocalEnv } from '../packages/db/dist/client.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
loadLocalEnv(root);
const app = new pg.Client({ connectionString: process.env.DATABASE_URL });
const worker = new pg.Client({ connectionString: process.env.WORKER_DATABASE_URL });
await app.connect();
await worker.connect();
try {
  const visitor = await app.query(`SELECT create_visitor('runtime-verification-visitor') AS id`);
  const version = await app.query(`SELECT id FROM exam_versions WHERE status = 'published' ORDER BY id LIMIT 1`);
  const attempt = await app.query(`SELECT start_attempt('runtime-verification-visitor', $1, 'exam') AS id`, [version.rows[0].id]);
  await app.query(`SELECT submit_attempt($1, 'runtime-verification-visitor')`, [attempt.rows[0].id]);
  const snapshot = await worker.query(`SELECT load_grading_snapshot($1) AS snapshot`, [attempt.rows[0].id]);
  const data = snapshot.rows[0].snapshot;
  if (!data || !Array.isArray(data.sections)) throw new Error('Invalid grading snapshot');
  console.log(`Runtime grading boundary passed for attempt ${attempt.rows[0].id}: ${data.sections.length} sections.`);
} finally {
  await app.end();
  await worker.end();
}
