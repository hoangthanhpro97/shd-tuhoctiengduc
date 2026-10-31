import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import pg from 'pg';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Không tìm thấy .env. Chạy pnpm setup:env trước.');
    process.exit(1);
  }
  const env = {};
  for (const raw of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i !== -1) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return env;
}

const env = loadEnv();
const isTest = process.argv.includes('--test');
const database = isTest ? 'shd_test' : 'shd_tuhoctiengduc';
const DRIZZLE_DIR = path.join(process.cwd(), 'packages', 'db', 'drizzle');
const LOCK_KEY = 'shd_schema_migrate';
const BREAKPOINT = '--> statement-breakpoint';

const client = new pg.Client({
  host: env.POSTGRES_HOST || '127.0.0.1',
  port: Number(env.POSTGRES_PORT) || 5432,
  user: 'shd_migrator',
  password: env.SHD_MIGRATOR_PASSWORD,
  database,
});

async function main() {
  fs.mkdirSync(DRIZZLE_DIR, { recursive: true });
  console.log(`--- Migrate [${database}] bằng role shd_migrator ---`);

  await client.connect();
  try {
    await client.query('SELECT pg_advisory_lock(hashtext($1))', [LOCK_KEY]);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "__shd_migrations" (
        "id" serial PRIMARY KEY,
        "name" varchar(255) NOT NULL UNIQUE,
        "checksum" varchar(64),
        "applied_at" timestamptz NOT NULL DEFAULT clock_timestamp()
      )`);
    await client.query('ALTER TABLE "__shd_migrations" ADD COLUMN IF NOT EXISTS "checksum" varchar(64)');

    const files = fs.readdirSync(DRIZZLE_DIR).filter((f) => f.endsWith('.sql')).sort();
    let applied = 0;

    for (const file of files) {
      const sql = fs.readFileSync(path.join(DRIZZLE_DIR, file), 'utf-8');
      const checksum = crypto.createHash('sha256').update(sql).digest('hex');

      const found = await client.query('SELECT checksum FROM "__shd_migrations" WHERE name = $1', [file]);
      if (found.rowCount > 0) {
        const stored = found.rows[0].checksum;
        if (stored === null) {
          await client.query('UPDATE "__shd_migrations" SET checksum = $2 WHERE name = $1', [file, checksum]);
        } else if (stored !== checksum) {
          throw new Error(
            `Migration [${file}] đã áp dụng nhưng nội dung đã thay đổi. ` +
            'Không sửa migration đã áp dụng; hãy tạo migration mới.'
          );
        }
        continue;
      }

      console.log(`⏳ ${file}`);
      const statements = sql.split(BREAKPOINT).map((s) => s.trim()).filter((s) => s.length > 0);

      await client.query('BEGIN');
      try {
        for (const stmt of statements) {
          await client.query(stmt);
        }
        await client.query('INSERT INTO "__shd_migrations" (name, checksum) VALUES ($1, $2)', [file, checksum]);
        await client.query('COMMIT');
        applied++;
        console.log(`✓ ${file}`);
      } catch (e) {
        await client.query('ROLLBACK');
        throw new Error(`Lỗi khi thực thi [${file}]: ${e.message}`);
      }
    }

    console.log(
      applied > 0
        ? `✅ Đã áp dụng ${applied} migration cho [${database}].`
        : `✓ [${database}] không có migration mới (no-op).`
    );
  } finally {
    await client.query('SELECT pg_advisory_unlock(hashtext($1))', [LOCK_KEY]).catch(() => {});
    await client.end();
  }
}

main().catch((e) => {
  console.error('❌ Migrate thất bại:', e.message);
  process.exit(1);
});
