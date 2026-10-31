import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execSync } from 'node:child_process';
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
const ROOT = process.cwd();

const EXPECTED_TABLES = [
  'tracks', 'exam_standards', 'levels', 'skills', 'question_types',
  'learning_goals', 'persona_types', 'exams', 'exam_versions', 'content_reviews',
  'sections', 'stimuli', 'assets', 'questions', 'question_options',
  'answer_keys', 'explanations',
  'visitors', 'exam_attempts', 'attempt_section_timers', 'attempt_answers',
  'attempt_audio_plays', 'attempt_entitlements', 'results', 'result_section_scores',
  'result_item_scores', 'learning_events',
  'learners', 'guardians', 'otp_challenges', 'consent_purposes', 'consent_texts', 'consents',
  'leads', 'lead_signals', 'crm_outbox', 'crm_links', 'crm_inbound_events', 'idempotency_keys',
  'staff_users', 'audit_logs', 'data_requests', 'app_settings',
];

const EXPECTED_VIEWS = [
  'v_public_explanations', 'v_attempt_item_scores',
  'v_masked_learners', 'v_masked_guardians', 'v_masked_leads',
  'v_masked_otp_challenges', 'v_masked_consents',
  'v_contactable_leads', 'v_worker_contactable_leads', 'v_readonly_contactable_leads',
];

// Bảng bảo mật: connecting roles không được ghi trực tiếp (INV-34).
// Đối chiếu lại với danh sách INV-34 trong 02-data-model.md v1.9 trước khi duyệt.
const PROTECTED = [
  'exam_attempts', 'attempt_section_timers', 'attempt_answers', 'attempt_audio_plays',
  'attempt_entitlements', 'learners', 'guardians', 'otp_challenges', 'consents',
  'leads', 'lead_signals', 'visitors', 'idempotency_keys', 'content_reviews',
  'exam_versions', 'data_requests', 'app_settings',
];

const WRITE_DENY = {
  shd_app: [...PROTECTED, 'crm_outbox'],
  shd_staff_api: [...PROTECTED, 'crm_outbox'],
  shd_worker: PROTECTED,
  shd_readonly: EXPECTED_TABLES,
};

const READ_DENY = [
  { role: 'shd_staff_api', tables: ['learners', 'guardians'] },
  { role: 'shd_worker', tables: ['learners', 'guardians'] },
  { role: 'shd_readonly', tables: ['learners', 'guardians', 'otp_challenges', 'consents', 'leads', 'visitors'] },
  { role: 'shd_app', tables: ['answer_keys'] },
  { role: 'shd_staff_api', tables: ['answer_keys'] },
  { role: 'shd_worker', tables: ['answer_keys'] },
  { role: 'shd_readonly', tables: ['answer_keys'] },
];

const client = new pg.Client({
  host: env.POSTGRES_HOST || '127.0.0.1',
  port: Number(env.POSTGRES_PORT) || 5432,
  user: 'shd_migrator',
  password: env.SHD_MIGRATOR_PASSWORD,
  database: 'shd_tuhoctiengduc',
});

async function hasPriv(role, table, priv) {
  const r = await client.query('SELECT has_table_privilege($1, $2, $3) AS ok', [role, `public.${table}`, priv]);
  return r.rows[0].ok === true;
}

function fail(msg) {
  throw new Error(msg);
}

async function checkStructure() {
  const t = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name <> '__shd_migrations'`);
  const tables = t.rows.map((r) => r.table_name);
  const missingT = EXPECTED_TABLES.filter((x) => !tables.includes(x));
  if (tables.length !== 43 || missingT.length) fail(`Bảng: ${tables.length}/43, thiếu [${missingT.join(', ')}]`);
  console.log('✓ 43/43 bảng đúng.');

  const v = await client.query(`
    SELECT table_name FROM information_schema.views WHERE table_schema = 'public'`);
  const views = v.rows.map((r) => r.table_name);
  const missingV = EXPECTED_VIEWS.filter((x) => !views.includes(x));
  if (views.length !== 10 || missingV.length) fail(`Views: ${views.length}/10, thiếu [${missingV.join(', ')}]`);
  console.log('✓ 10/10 view đúng.');
}

async function checkWriteDeny() {
  const violations = [];
  for (const [role, tables] of Object.entries(WRITE_DENY)) {
    for (const table of tables) {
      for (const priv of ['INSERT', 'UPDATE', 'DELETE']) {
        if (await hasPriv(role, table, priv)) violations.push(`${role} ${priv} ${table}`);
      }
    }
  }
  if (violations.length) fail(`Vi phạm INV-34: ${violations.join('; ')}`);
  console.log('✓ INV-34: không có quyền ghi trực tiếp trái thiết kế.');
}

async function checkReadDeny() {
  const violations = [];
  for (const { role, tables } of READ_DENY) {
    for (const table of tables) {
      if (await hasPriv(role, table, 'SELECT')) violations.push(`${role} SELECT ${table}`);
    }
  }
  if (violations.length) fail(`Vi phạm đọc PII/đáp án: ${violations.join('; ')}`);
  console.log('✓ INV-01, INV-40: không có quyền đọc trực tiếp trái thiết kế.');
}

function checkDrizzleGenerate() {
  const hasConfig = ['drizzle.config.ts', 'drizzle.config.js', 'drizzle.config.mjs']
    .some((f) => fs.existsSync(path.join(ROOT, 'packages', 'db', f)));
  if (!hasConfig) {
    console.log('⚠ CHƯA KIỂM: chưa có packages/db/drizzle.config.* (làm ở lệnh 2.3). Bỏ qua kiểm tra schema-vs-migration.');
    return;
  }
  const gen = spawnSync('pnpm', ['exec', 'drizzle-kit', 'generate'], {
    cwd: path.join(ROOT, 'packages', 'db'),
    stdio: 'inherit',
  });
  if (gen.status !== 0) fail('drizzle-kit generate thất bại');
  const changed = execSync('git status --porcelain packages/db/drizzle', { cwd: ROOT }).toString().trim();
  if (changed) fail(`Schema lệch migration. drizzle-kit sinh thêm:\n${changed}`);
  console.log('✓ Schema khớp migration (drizzle-kit generate không sinh thay đổi).');
}

async function main() {
  console.log('--- Kiểm tra drift schema và quyền ---');
  await client.connect();
  try {
    await checkStructure();
    await checkWriteDeny();
    await checkReadDeny();
  } finally {
    await client.end();
  }
  checkDrizzleGenerate();
  console.log('✅ Check drift hoàn tất.');
}

main().catch((e) => {
  console.error('❌ Check drift thất bại:', e.message);
  process.exit(1);
});
