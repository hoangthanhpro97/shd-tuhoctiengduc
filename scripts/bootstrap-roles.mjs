import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

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

const client = new pg.Client({
  host: env.POSTGRES_HOST || '127.0.0.1',
  port: Number(env.POSTGRES_PORT) || 5432,
  user: env.POSTGRES_USER || 'postgres',
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB || 'postgres',
});

async function bootstrap() {
  console.log('--- Khởi tạo và đồng bộ 12 Roles PostgreSQL (7 NOLOGIN + 5 LOGIN) ---');
  try {
    await client.connect();
    console.log('✓ Kết nối thành công bằng superuser postgres.');

    // 1. Ensure databases exist
    const dbs = ['shd_tuhoctiengduc', 'shd_test'];
    for (const db of dbs) {
      const checkDb = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [db]);
      if (checkDb.rowCount === 0) {
        await client.query(`CREATE DATABASE ${db}`);
        console.log(`✓ Đã tạo database ${db}`);
      }
    }

    // 2. Create 7 NOLOGIN roles idempotently
    const nologinRoles = [
      'shd_migrator_owner',
      'shd_ledger_admin',
      'shd_attempt_mgr',
      'shd_auth_admin',
      'shd_exam_admin',
      'shd_privacy_admin',
      'shd_grader',
    ];

    for (const r of nologinRoles) {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${r}') THEN
            CREATE ROLE ${r} NOLOGIN;
          ELSE
            ALTER ROLE ${r} NOLOGIN;
          END IF;
        END $$;
      `);
      console.log(`✓ Role NOLOGIN [${r}] sẵn sàng.`);
    }

    // 3. Create / update 5 LOGIN roles idempotently
    const loginRoles = [
      { name: 'shd_migrator', pass: env.SHD_MIGRATOR_PASSWORD },
      { name: 'shd_app', pass: env.SHD_APP_PASSWORD },
      { name: 'shd_worker', pass: env.SHD_WORKER_PASSWORD },
      { name: 'shd_staff_api', pass: env.SHD_STAFF_API_PASSWORD },
      { name: 'shd_readonly', pass: env.SHD_READONLY_PASSWORD },
    ];

    for (const { name, pass } of loginRoles) {
      if (!pass) {
        throw new Error(`Thiếu biến môi trường mật khẩu cho role [${name}]!`);
      }
      // Escape single quotes in password if any
      const escapedPass = pass.replace(/'/g, "''");
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${name}') THEN
            CREATE ROLE ${name} WITH LOGIN PASSWORD '${escapedPass}';
          ELSE
            ALTER ROLE ${name} WITH LOGIN PASSWORD '${escapedPass}';
          END IF;
        END $$;
      `);
      console.log(`✓ Role LOGIN [${name}] sẵn sàng.`);
    }

    // 4. Grant membership of admin roles to shd_migrator
    await client.query(`
      GRANT shd_migrator_owner, shd_ledger_admin, shd_attempt_mgr, shd_auth_admin, shd_exam_admin, shd_privacy_admin, shd_grader TO shd_migrator;
    `);
    console.log('✓ Đã cấp quyền membership các NOLOGIN admin roles cho shd_migrator.');

    // 5. Set database ownership & connect permissions
    await client.query(`ALTER DATABASE shd_tuhoctiengduc OWNER TO shd_migrator_owner;`);
    await client.query(`ALTER DATABASE shd_test OWNER TO shd_migrator_owner;`);
    await client.query(`GRANT CONNECT ON DATABASE shd_tuhoctiengduc TO shd_migrator, shd_app, shd_worker, shd_staff_api, shd_readonly;`);
    await client.query(`GRANT CONNECT ON DATABASE shd_test TO shd_migrator;`);
    console.log('✓ Đã thiết lập DB ownership và quyền CONNECT.');

    // Connect to shd_tuhoctiengduc to setup schema permissions
    const appDbClient = new pg.Client({
      host: env.POSTGRES_HOST || '127.0.0.1',
      port: Number(env.POSTGRES_PORT) || 5432,
      user: env.POSTGRES_USER || 'postgres',
      password: env.POSTGRES_PASSWORD,
      database: 'shd_tuhoctiengduc',
    });
    await appDbClient.connect();
    await appDbClient.query(`
      GRANT USAGE, CREATE ON SCHEMA public TO shd_migrator_owner, shd_ledger_admin, shd_attempt_mgr, shd_auth_admin, shd_exam_admin, shd_privacy_admin, shd_grader;
      GRANT USAGE ON SCHEMA public TO shd_app, shd_worker, shd_staff_api, shd_readonly;
    `);
    await appDbClient.end();

    // Connect to shd_test to setup schema permissions
    const testDbClient = new pg.Client({
      host: env.POSTGRES_HOST || '127.0.0.1',
      port: Number(env.POSTGRES_PORT) || 5432,
      user: env.POSTGRES_USER || 'postgres',
      password: env.POSTGRES_PASSWORD,
      database: 'shd_test',
    });
    await testDbClient.connect();
    await testDbClient.query(`
      GRANT USAGE, CREATE ON SCHEMA public TO shd_migrator_owner, shd_ledger_admin, shd_attempt_mgr, shd_auth_admin, shd_exam_admin, shd_privacy_admin, shd_grader;
      GRANT USAGE ON SCHEMA public TO shd_app, shd_worker, shd_staff_api, shd_readonly;
    `);
    await testDbClient.end();

    console.log('✅ Hoàn tất bootstrap roles & database permissions thành công.');
  } catch (err) {
    console.error('❌ Lỗi khi bootstrap roles:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

bootstrap();
