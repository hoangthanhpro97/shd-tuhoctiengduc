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
  connectionString: env.MIGRATOR_DATABASE_URL || `postgresql://shd_migrator:${env.SHD_MIGRATOR_PASSWORD}@127.0.0.1:5432/shd_tuhoctiengduc`,
});

const expectedTables = [
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

const expectedViews = [
  'v_public_explanations',
  'v_attempt_item_scores',
  'v_masked_learners',
  'v_masked_guardians',
  'v_masked_leads',
  'v_masked_otp_challenges',
  'v_masked_consents',
  'v_contactable_leads',
  'v_worker_contactable_leads',
  'v_readonly_contactable_leads',
];

const protectedTables = [
  'visitors', 'exam_attempts', 'attempt_section_timers', 'attempt_answers',
  'attempt_audio_plays', 'attempt_entitlements', 'learners', 'guardians',
  'otp_challenges', 'consents', 'leads', 'lead_signals', 'content_reviews',
  'idempotency_keys',
];

async function checkDrift() {
  console.log('--- Kiểm tra Kiểm định Schema & Quyền Bảo Mật (Database Drift & Grant Verification) ---');
  try {
    await client.connect();

    // 1. Kiểm tra 43 bảng
    const tablesRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name != '__shd_migrations'
      ORDER BY table_name;
    `);
    const actualTables = tablesRes.rows.map((r) => r.table_name);
    console.log(`✓ Đếm số bảng cơ sở dữ liệu: ${actualTables.length}/43 bảng.`);
    if (actualTables.length !== 43) {
      const missing = expectedTables.filter((t) => !actualTables.includes(t));
      throw new Error(`Số lượng bảng không khớp (thiếu: ${missing.join(', ')})`);
    }

    // 2. Kiểm tra 10 Views
    const viewsRes = await client.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    const actualViews = viewsRes.rows.map((r) => r.table_name);
    console.log(`✓ Đếm số views bảo mật: ${actualViews.length}/10 views.`);
    if (actualViews.length !== 10) {
      const missingViews = expectedViews.filter((v) => !actualViews.includes(v));
      throw new Error(`Số lượng views không khớp (thiếu: ${missingViews.join(', ')})`);
    }

    // 3. Kiểm tra Zero-Direct-Write trên 14 bảng bảo mật cho shd_app, shd_staff_api, shd_worker (INV-34)
    const grantsRes = await client.query(`
      SELECT grantee, table_name, privilege_type
      FROM information_schema.role_table_grants
      WHERE table_schema = 'public'
        AND grantee IN ('shd_app', 'shd_staff_api', 'shd_worker')
        AND privilege_type IN ('INSERT', 'UPDATE', 'DELETE')
        AND table_name = ANY($1::text[])
    `, [protectedTables]);

    if (grantsRes.rowCount > 0) {
      console.error('❌ Phát hiện vi phạm Zero-Direct-Write (INV-34):');
      for (const row of grantsRes.rows) {
        console.error(`  - Role [${row.grantee}] có quyền ${row.privilege_type} trực tiếp trên bảng [${row.table_name}]!`);
      }
      throw new Error('Vi phạm bất biến Zero-Direct-Write INV-34!');
    }
    console.log('✓ Bất biến INV-34 (Zero-Direct-Write): Connecting roles có ZERO quyền ghi trực tiếp trên 14 bảng bảo mật.');

    // 4. Kiểm tra INV-40: cấm SELECT trực tiếp trên learners và guardians cho shd_staff_api và shd_worker
    const piiDirectSelectRes = await client.query(`
      SELECT grantee, table_name
      FROM information_schema.role_table_grants
      WHERE table_schema = 'public'
        AND grantee IN ('shd_staff_api', 'shd_worker')
        AND privilege_type = 'SELECT'
        AND table_name IN ('learners', 'guardians')
    `);
    if (piiDirectSelectRes.rowCount > 0) {
      console.error('❌ Phát hiện vi phạm INV-40 (Direct PII Read):');
      for (const row of piiDirectSelectRes.rows) {
        console.error(`  - Role [${row.grantee}] có quyền SELECT trực tiếp trên bảng [${row.table_name}]!`);
      }
      throw new Error('Vi phạm bất biến INV-40!');
    }
    console.log('✓ Bất biến INV-40: shd_staff_api và shd_worker hoàn toàn CẤM SELECT trực tiếp trên bảng PII gốc (learners, guardians).');

    // 5. Kiểm tra INV-01: cấm SELECT trực tiếp trên answer_keys cho shd_app, shd_staff_api, shd_worker
    const answerKeySelectRes = await client.query(`
      SELECT grantee, table_name
      FROM information_schema.role_table_grants
      WHERE table_schema = 'public'
        AND grantee IN ('shd_app', 'shd_staff_api', 'shd_worker', 'shd_readonly')
        AND privilege_type = 'SELECT'
        AND table_name = 'answer_keys'
    `);
    if (answerKeySelectRes.rowCount > 0) {
      throw new Error('Vi phạm bất biến INV-01: answer_keys bị rò rỉ quyền SELECT!');
    }
    console.log('✓ Bất biến INV-01: answer_keys được cô lập tuyệt đối khỏi toàn bộ connecting roles.');

    console.log('✅ KIỂM TRA DRIFT & MA TRẬN PHÂN QUYỀN THÀNH CÔNG 100%!');
  } catch (err) {
    console.error('❌ Kiểm tra Drift thất bại:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkDrift();
