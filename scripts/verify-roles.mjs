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

const nologinRoles = [
  'shd_migrator_owner',
  'shd_ledger_admin',
  'shd_attempt_mgr',
  'shd_auth_admin',
  'shd_exam_admin',
  'shd_privacy_admin',
  'shd_grader',
];

const loginRoles = [
  { name: 'shd_migrator', pass: env.SHD_MIGRATOR_PASSWORD },
  { name: 'shd_app', pass: env.SHD_APP_PASSWORD },
  { name: 'shd_worker', pass: env.SHD_WORKER_PASSWORD },
  { name: 'shd_staff_api', pass: env.SHD_STAFF_API_PASSWORD },
  { name: 'shd_readonly', pass: env.SHD_READONLY_PASSWORD },
];

console.log('--- Kiểm tra 7 NOLOGIN roles và 5 LOGIN roles PostgreSQL ---');

async function verify() {
  const superClient = new pg.Client({
    host: env.POSTGRES_HOST || '127.0.0.1',
    port: Number(env.POSTGRES_PORT) || 5432,
    user: env.POSTGRES_USER || 'postgres',
    password: env.POSTGRES_PASSWORD,
    database: 'shd_tuhoctiengduc',
  });

  try {
    await superClient.connect();

    // 1. Check NOLOGIN roles
    for (const role of nologinRoles) {
      const res = await superClient.query(
        `SELECT rolname, rolcanlogin FROM pg_roles WHERE rolname = $1`,
        [role]
      );
      if (res.rowCount === 0) {
        throw new Error(`❌ Role NOLOGIN [${role}] không tồn tại!`);
      }
      if (res.rows[0].rolcanlogin !== false) {
        throw new Error(`❌ Role [${role}] phải là NOLOGIN nhưng rolcanlogin = true!`);
      }
      console.log(`✓ Role NOLOGIN [${role}] tồn tại và đúng cấu hình NOLOGIN.`);
    }

    // 2. Check shd_migrator membership of admin roles
    for (const role of nologinRoles) {
      const res = await superClient.query(
        `SELECT 1 FROM pg_auth_members m
         JOIN pg_roles r_parent ON m.roleid = r_parent.oid
         JOIN pg_roles r_member ON m.member = r_member.oid
         WHERE r_parent.rolname = $1 AND r_member.rolname = 'shd_migrator'`,
        [role]
      );
      if (res.rowCount === 0) {
        throw new Error(`❌ shd_migrator chưa là member của [${role}]!`);
      }
    }
    console.log(`✓ shd_migrator là member đầy đủ của 7 NOLOGIN roles.`);

    // 3. Check database owner
    const dbOwnerRes = await superClient.query(
      `SELECT r.rolname FROM pg_database d
       JOIN pg_roles r ON d.datdba = r.oid
       WHERE d.datname = 'shd_tuhoctiengduc'`
    );
    if (dbOwnerRes.rows[0]?.rolname !== 'shd_migrator_owner') {
      console.warn(`⚠️ Database shd_tuhoctiengduc owner là [${dbOwnerRes.rows[0]?.rolname}], mong đợi [shd_migrator_owner].`);
    } else {
      console.log(`✓ Database shd_tuhoctiengduc được sở hữu bởi [shd_migrator_owner].`);
    }

    await superClient.end();

    // 4. Test live login connection for all 5 LOGIN roles
    for (const r of loginRoles) {
      const conn = new pg.Client({
        host: env.POSTGRES_HOST || '127.0.0.1',
        port: Number(env.POSTGRES_PORT) || 5432,
        user: r.name,
        password: r.pass,
        database: 'shd_tuhoctiengduc',
      });
      try {
        await conn.connect();
        const testRes = await conn.query('SELECT 1 as connected;');
        if (testRes.rows[0]?.connected === 1) {
          console.log(`✓ Role LOGIN [${r.name}] kết nối thành công và xác thực SELECT 1.`);
        }
      } finally {
        await conn.end();
      }
    }

    console.log('✅ Xác thực toàn bộ 12 Roles (7 NOLOGIN + 5 LOGIN) THÀNH CÔNG!');
  } catch (err) {
    console.error('❌ Kiểm tra roles thất bại:', err.message);
    process.exit(1);
  }
}

verify();
