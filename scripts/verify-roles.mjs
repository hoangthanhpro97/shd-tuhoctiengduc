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
const DATABASES = ['shd_tuhoctiengduc', 'shd_test'];

function fail(msg) {
  throw new Error(msg);
}

async function withClient(opts, fn) {
  const c = new pg.Client(opts);
  await c.connect();
  try {
    return await fn(c);
  } finally {
    await c.end();
  }
}

async function main() {
  console.log('--- Xác thực roles theo thiết kế v1.9 ---');

  await withClient({ ...base, database: 'shd_tuhoctiengduc' }, async (c) => {
    for (const role of NOLOGIN_ROLES) {
      const r = await c.query('SELECT rolcanlogin FROM pg_roles WHERE rolname = $1', [role]);
      if (r.rowCount === 0) fail(`Role NOLOGIN [${role}] không tồn tại`);
      if (r.rows[0].rolcanlogin) fail(`Role [${role}] phải NOLOGIN nhưng rolcanlogin = true`);
    }
    console.log(`✓ ${NOLOGIN_ROLES.length} role NOLOGIN đúng cấu hình.`);

    for (const { name } of LOGIN_ROLES) {
      const r = await c.query('SELECT rolcanlogin FROM pg_roles WHERE rolname = $1', [name]);
      if (r.rowCount === 0) fail(`Role LOGIN [${name}] không tồn tại`);
      if (!r.rows[0].rolcanlogin) fail(`Role [${name}] phải LOGIN nhưng rolcanlogin = false`);
    }
    console.log(`✓ ${LOGIN_ROLES.length} role LOGIN đúng cấu hình.`);

    const m = await c.query(`
      SELECT r.rolname
      FROM pg_auth_members am
      JOIN pg_roles r ON r.oid = am.roleid
      JOIN pg_roles mm ON mm.oid = am.member
      WHERE mm.rolname = 'shd_migrator'`);
    const have = new Set(m.rows.map((x) => x.rolname));
    const missing = NOLOGIN_ROLES.filter((r) => !have.has(r));
    if (missing.length) fail(`shd_migrator thiếu membership: ${missing.join(', ')}`);
    console.log('✓ shd_migrator là thành viên đủ 7 role NOLOGIN.');

    const o = await c.query(
      `SELECT datname, pg_get_userbyid(datdba) AS owner
       FROM pg_database WHERE datname = ANY($1::text[])`,
      [DATABASES]
    );
    if (o.rowCount !== DATABASES.length) fail('Thiếu database shd_tuhoctiengduc hoặc shd_test');
    for (const row of o.rows) {
      if (row.owner !== 'shd_migrator_owner') {
        fail(`Database [${row.datname}] có owner [${row.owner}], phải là shd_migrator_owner`);
      }
    }
    console.log('✓ Owner của cả hai database là shd_migrator_owner.');
  });

  for (const { name, pass } of LOGIN_ROLES) {
    await withClient({ ...base, user: name, password: pass, database: 'shd_tuhoctiengduc' }, async (c) => {
      const r = await c.query('SELECT 1 AS ok');
      if (r.rows[0].ok !== 1) fail(`[${name}] SELECT 1 không đúng`);
    });
    console.log(`✓ [${name}] đăng nhập shd_tuhoctiengduc và SELECT 1.`);
  }

  await withClient({ ...base, user: 'shd_migrator', password: env.SHD_MIGRATOR_PASSWORD, database: 'shd_test' }, async (c) => {
    const r = await c.query('SELECT 1 AS ok');
    if (r.rows[0].ok !== 1) fail('[shd_migrator] SELECT 1 trên shd_test không đúng');
  });
  console.log('✓ [shd_migrator] đăng nhập shd_test và SELECT 1.');

  console.log('✅ Xác thực roles thành công.');
}

main().catch((e) => {
  console.error('❌ Xác thực roles thất bại:', e.message);
  process.exit(1);
});
