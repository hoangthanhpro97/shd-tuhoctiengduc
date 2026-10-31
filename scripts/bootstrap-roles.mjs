import fs from 'node:fs';
import path from 'node:path';
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
const base = {
  host: env.POSTGRES_HOST || '127.0.0.1',
  port: Number(env.POSTGRES_PORT) || 5432,
  user: env.POSTGRES_USER || 'postgres',
  password: env.POSTGRES_PASSWORD,
};

const DATABASES = ['shd_tuhoctiengduc', 'shd_test'];
const NOLOGIN_ROLES = [
  'shd_migrator_owner',
  'shd_ledger_admin',
  'shd_attempt_mgr',
  'shd_auth_admin',
  'shd_exam_admin',
  'shd_privacy_admin',
  'shd_grader',
];
const LOGIN_ROLES = [
  { name: 'shd_migrator', pass: env.SHD_MIGRATOR_PASSWORD },
  { name: 'shd_app', pass: env.SHD_APP_PASSWORD },
  { name: 'shd_worker', pass: env.SHD_WORKER_PASSWORD },
  { name: 'shd_staff_api', pass: env.SHD_STAFF_API_PASSWORD },
  { name: 'shd_readonly', pass: env.SHD_READONLY_PASSWORD },
];
const APP_ROLES = ['shd_app', 'shd_worker', 'shd_staff_api', 'shd_readonly'];
const SCHEMA_CREATORS = [...NOLOGIN_ROLES, 'shd_migrator'];

async function withClient(database, fn) {
  const c = new pg.Client({ ...base, database });
  await c.connect();
  try {
    return await fn(c);
  } finally {
    await c.end();
  }
}

async function main() {
  console.log('--- Bootstrap 12 roles PostgreSQL (7 NOLOGIN + 5 LOGIN) ---');

  for (const { name, pass } of LOGIN_ROLES) {
    if (!pass) throw new Error(`Thiếu mật khẩu cho role [${name}] trong .env`);
  }

  await withClient('postgres', async (c) => {
    for (const db of DATABASES) {
      const r = await c.query('SELECT 1 FROM pg_database WHERE datname = $1', [db]);
      if (r.rowCount === 0) {
        await c.query(`CREATE DATABASE ${db}`);
        console.log(`✓ Đã tạo database ${db}`);
      }
    }

    for (const role of NOLOGIN_ROLES) {
      await c.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${role}') THEN
            CREATE ROLE ${role} NOLOGIN;
          ELSE
            ALTER ROLE ${role} NOLOGIN;
          END IF;
        END $$;`);
    }
    console.log(`✓ ${NOLOGIN_ROLES.length} role NOLOGIN sẵn sàng.`);

    for (const { name, pass } of LOGIN_ROLES) {
      const esc = pass.replace(/'/g, "''");
      await c.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${name}') THEN
            CREATE ROLE ${name} WITH LOGIN PASSWORD '${esc}';
          ELSE
            ALTER ROLE ${name} WITH LOGIN PASSWORD '${esc}';
          END IF;
        END $$;`);
    }
    console.log(`✓ ${LOGIN_ROLES.length} role LOGIN sẵn sàng.`);

    await c.query(`GRANT ${NOLOGIN_ROLES.join(', ')} TO shd_migrator`);
    console.log('✓ shd_migrator là thành viên của 7 role NOLOGIN.');

    for (const db of DATABASES) {
      await c.query(`ALTER DATABASE ${db} OWNER TO shd_migrator_owner`);
    }
    await c.query(`GRANT CONNECT ON DATABASE shd_tuhoctiengduc TO shd_migrator, ${APP_ROLES.join(', ')}`);
    await c.query(`GRANT CONNECT ON DATABASE shd_test TO shd_migrator`);
    console.log('✓ Owner database và quyền CONNECT.');
  });

  for (const db of DATABASES) {
    await withClient(db, async (c) => {
      await c.query(`GRANT USAGE, CREATE ON SCHEMA public TO ${SCHEMA_CREATORS.join(', ')}`);
      await c.query(`GRANT USAGE ON SCHEMA public TO ${APP_ROLES.join(', ')}`);
    });
    console.log(`✓ Quyền schema public trên [${db}].`);
  }

  console.log('✅ Bootstrap roles thành công.');
}

main().catch((e) => {
  console.error('❌ Bootstrap thất bại:', e.message);
  process.exit(1);
});
