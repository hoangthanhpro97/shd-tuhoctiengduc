import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import crypto from 'node:crypto';

const ROOT_DIR = process.cwd();
const ENV_PATH = path.join(ROOT_DIR, '.env');

if (!fs.existsSync(ENV_PATH)) {
  console.error('❌ .env file not found. Please run pnpm setup:env first.');
  process.exit(1);
}

// Parse .env manually
const env = {};
const lines = fs.readFileSync(ENV_PATH, 'utf-8').split('\n');
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    env[key] = val;
  }
}

const targetDb = process.argv.includes('--test') ? 'shd_test' : 'shd_tuhoctiengduc';
const dbUrl = process.argv.includes('--test')
  ? (env.TEST_DATABASE_URL || `postgresql://shd_migrator:${env.SHD_MIGRATOR_PASSWORD}@127.0.0.1:5432/shd_test`)
  : (env.MIGRATOR_DATABASE_URL || `postgresql://shd_migrator:${env.SHD_MIGRATOR_PASSWORD}@127.0.0.1:5432/shd_tuhoctiengduc`);

const client = new pg.Client({ connectionString: dbUrl });

async function runMigrations() {
  console.log(`--- Bắt đầu áp dụng Migrations cho Database [${targetDb}] bằng role shd_migrator ---`);
  const drizzleDir = path.join(ROOT_DIR, 'packages', 'db', 'drizzle');
  if (!fs.existsSync(drizzleDir)) {
    console.error(`❌ Thư mục migrations không tồn tại: ${drizzleDir}`);
    process.exit(1);
  }

  try {
    await client.connect();
    console.log(`✓ Đã kết nối tới [${targetDb}] với tư cách shd_migrator.`);

    // 1. Tạo bảng theo dõi migration nếu chưa có
    await client.query(`
      CREATE TABLE IF NOT EXISTS "__shd_migrations" (
        "id" serial PRIMARY KEY,
        "name" varchar(255) NOT NULL UNIQUE,
        "checksum" varchar(64),
        "execution_ms" integer,
        "applied_at" timestamptz NOT NULL DEFAULT clock_timestamp()
      );
    `);
    await client.query(`ALTER TABLE "__shd_migrations" ADD COLUMN IF NOT EXISTS "checksum" varchar(64);`);
    await client.query(`ALTER TABLE "__shd_migrations" ADD COLUMN IF NOT EXISTS "execution_ms" integer;`);
    await client.query('SELECT pg_advisory_lock(hashtext($1))', ['shd-tuhoctiengduc-migrations']);

    // 2. Đọc tất cả file .sql
    const files = fs.readdirSync(drizzleDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let appliedCount = 0;
    for (const file of files) {
      const checkRes = await client.query(
        `SELECT checksum FROM "__shd_migrations" WHERE "name" = $1`,
        [file]
      );
      if (checkRes.rowCount > 0) {
        const currentChecksum = crypto.createHash('sha256').update(fs.readFileSync(path.join(drizzleDir, file))).digest('hex');
        if (checkRes.rows[0].checksum && checkRes.rows[0].checksum !== currentChecksum) {
          throw new Error(`Checksum migration thay đổi sau khi đã áp dụng: [${file}]`);
        }
        continue;
      }

      console.log(`⏳ Đang thực thi migration: [${file}]...`);
      const sqlContent = fs.readFileSync(path.join(drizzleDir, file), 'utf-8');

      // Tách statement theo Drizzle separator "--> statement-breakpoint" nếu có
      const statements = sqlContent
        .split('--> statement-breakpoint')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const checksum = crypto.createHash('sha256').update(sqlContent).digest('hex');
      const startedAt = Date.now();
      await client.query('BEGIN;');
      try {
        for (const stmt of statements) {
          await client.query(stmt);
        }
        await client.query(
          `INSERT INTO "__shd_migrations" ("name", "checksum", "execution_ms") VALUES ($1, $2, $3)`,
          [file, checksum, Date.now() - startedAt]
        );
        await client.query('COMMIT;');
        console.log(`✓ Áp dụng thành công migration: [${file}]`);
        appliedCount++;
      } catch (err) {
        await client.query('ROLLBACK;');
        throw new Error(`Lỗi khi thực thi [${file}]: ${err.message}`);
      }
    }

    if (appliedCount === 0) {
      console.log(`✓ Database [${targetDb}] đã ở trạng thái mới nhất (no-op).`);
    } else {
      console.log(`✅ Đã áp dụng thành công ${appliedCount} migration(s) cho [${targetDb}].`);
    }
  } catch (err) {
    console.error(`❌ Lỗi migration trên [${targetDb}]:`, err.message);
    process.exit(1);
  } finally {
    try { await client.query('SELECT pg_advisory_unlock(hashtext($1))', ['shd-tuhoctiengduc-migrations']); } catch {}
    await client.end();
  }
}

runMigrations();
