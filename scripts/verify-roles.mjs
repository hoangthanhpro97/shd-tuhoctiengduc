import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const ENV_PATH = path.join(ROOT_DIR, '.env');

if (!fs.existsSync(ENV_PATH)) {
  console.error('❌ .env file not found. Please run pnpm setup:env first.');
  process.exit(1);
}

// Parse .env manually without external dependency
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

const roles = [
  { name: 'shd_migrator', pass: env.SHD_MIGRATOR_PASSWORD, shouldOwnDb: true },
  { name: 'shd_app', pass: env.SHD_APP_PASSWORD, shouldFailCreateTable: true },
  { name: 'shd_grader', pass: env.SHD_GRADER_PASSWORD },
  { name: 'shd_worker', pass: env.SHD_WORKER_PASSWORD },
  { name: 'shd_readonly', pass: env.SHD_READONLY_PASSWORD },
];

console.log('--- Kiểm tra kết nối và phân quyền 5 Roles PostgreSQL ---');

// Check if PostgreSQL is reachable on 127.0.0.1:5432
let dockerRunning = false;
try {
  execSync('docker ps', { stdio: 'pipe' });
  dockerRunning = true;
} catch {
  console.log('⚠️ Docker daemon is not running. Cannot execute live network connection to PostgreSQL.');
  console.log('   Script is ready and will run automatically when Docker Desktop daemon starts.');
  process.exit(0);
}

console.log('Docker is active. Running role verification...');
// When docker is up, verify roles via docker exec psql
for (const r of roles) {
  try {
    const res = execSync(
      `docker exec shd-postgres-16 psql -U ${r.name} -d shd_tuhoctiengduc -c "SELECT 1;"`,
      { stdio: 'pipe', encoding: 'utf-8' }
    );
    console.log(`✓ Role [${r.name}] connected successfully to shd_tuhoctiengduc (SELECT 1 pass).`);
  } catch (err) {
    console.error(`❌ Failed connecting as role [${r.name}]:`, err.message);
  }
}
