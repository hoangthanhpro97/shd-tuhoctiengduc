import { describe, expect, it } from 'vitest';
import pg from 'pg';
import { loadLocalEnv } from '../../src/client.js';

loadLocalEnv();
const databaseUrl = process.env.TEST_DATABASE_URL;
const integration = process.env.SHD_RUN_DB_INTEGRATION === '1';

describe.skipIf(!integration || !databaseUrl)('PostgreSQL Bước 2 integration', () => {
  it('contains the canonical seed counts', async () => {
    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    try {
      const result = await client.query(`
        SELECT
          (SELECT count(*)::int FROM exams) AS exams,
          (SELECT count(*)::int FROM questions) AS questions,
          (SELECT count(*)::int FROM answer_keys) AS answer_keys
      `);
      expect(result.rows[0]).toEqual({ exams: 8, questions: 298, answer_keys: 298 });
    } finally {
      await client.end();
    }
  });

  it('rejects direct answer key reads from the app role', async () => {
    const appUrl = process.env.DATABASE_URL;
    if (!appUrl) return;
    const client = new pg.Client({ connectionString: appUrl });
    await client.connect();
    try {
      await expect(client.query('SELECT * FROM answer_keys LIMIT 1')).rejects.toThrow(/permission denied/u);
    } finally {
      await client.end();
    }
  });
});
