import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootDir = path.resolve(packageDir, '../..');
const tscPath = path.join(rootDir, 'node_modules', 'typescript', 'bin', 'tsc');
const distDir = path.join(packageDir, 'dist');

fs.rmSync(distDir, { recursive: true, force: true });

function run(config) {
  const result = spawnSync(process.execPath, [tscPath, '-p', path.join(packageDir, config)], {
    cwd: rootDir,
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('tsconfig.json');
run('tsconfig.cjs.json');

fs.writeFileSync(
  path.join(distDir, 'cjs', 'package.json'),
  `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`,
);
