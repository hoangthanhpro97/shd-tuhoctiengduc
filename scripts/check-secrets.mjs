import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();

// Patterns to detect potential secrets
const SECRET_PATTERNS = [
  { name: 'Private Key', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'AWS Access Key', regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/ },
  { name: 'Generic Secret Token', regex: /(?:bearer|token|apikey|api_key|password)\s*[:=]\s*['"][a-zA-Z0-9_\-]{24,}['"]/i },
  { name: 'Zalo / Social App Secret', regex: /app_secret\s*[:=]\s*['"][a-zA-Z0-9]{16,}['"]/i },
];

// Ignored files (templates, examples, specs)
const IGNORE_FILES = [
  '.env.example',
  'scripts/check-secrets.mjs',
  'docs/engineering-rules.md',
];

function checkTrackedFiles() {
  let trackedFiles = [];
  try {
    const output = execSync('git ls-files', { encoding: 'utf-8', cwd: ROOT_DIR });
    trackedFiles = output.split('\n').map(f => f.trim()).filter(Boolean);
  } catch (err) {
    console.error('Error running git ls-files:', err);
    process.exit(1);
  }

  let violations = [];

  for (const relPath of trackedFiles) {
    if (IGNORE_FILES.some(ign => relPath.endsWith(ign))) continue;
    if (relPath.endsWith('.png') || relPath.endsWith('.jpg') || relPath.endsWith('.ico')) continue;

    const fullPath = path.join(ROOT_DIR, relPath);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf-8');
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.regex.test(content)) {
        violations.push({ file: relPath, pattern: pattern.name });
      }
    }
  }

  if (violations.length > 0) {
    console.error('❌ Potential secrets detected in tracked files:');
    for (const v of violations) {
      console.error(`  - [${v.pattern}] in ${v.file}`);
    }
    process.exit(1);
  }

  console.log(`✓ check:secrets passed: ${trackedFiles.length} tracked files scanned. No secrets found.`);
}

checkTrackedFiles();

