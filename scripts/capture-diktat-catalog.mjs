import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = 3099;
const baseUrl = `http://localhost:${port}`;
const screenshotDir = path.join(root, 'screenshots', 'desktop');
const artifactDir = 'C:\\Users\\Editer SHB\\.gemini\\antigravity\\brain\\80235b60-8480-4532-87dd-8c78b2b5ba72';

console.log('Starting Next dev server on port', port);
const nextProc = spawn('npx', ['next', 'dev', '-p', String(port)], {
  cwd: path.join(root, 'apps', 'web'),
  shell: true,
  stdio: 'inherit',
});

async function waitForServer(url, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // wait
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server did not start at ${url} within ${timeoutMs}ms`);
}

async function run() {
  try {
    await waitForServer(`${baseUrl}/api/healthz`);
    console.log('Server is healthy! Launching browser...');

    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

      const testUrl = `${baseUrl}/chep-chinh-ta`;
      console.log(`Navigating to ${testUrl}...`);
      await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.evaluate(() => document.fonts?.ready);
      await page.waitForTimeout(1000);

      const catalogPath = path.join(screenshotDir, 'diktat-catalog-all-packages.png');
      await page.screenshot({ path: catalogPath, fullPage: true });
      fs.copyFileSync(catalogPath, path.join(artifactDir, 'diktat-catalog-all-packages.png'));
      console.log('Saved diktat catalog screenshot:', catalogPath);
    } finally {
      await browser.close();
    }
  } finally {
    console.log('Stopping dev server process...');
    nextProc.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
