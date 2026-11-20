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

      // 1. Capture /luyen-nghe (Ảnh 1)
      const horenUrl = `${baseUrl}/luyen-nghe`;
      console.log(`Navigating to ${horenUrl}...`);
      await page.goto(horenUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.evaluate(() => document.fonts?.ready);
      await page.waitForTimeout(1000);

      const horenPath = path.join(screenshotDir, 'hero-luyen-horen-updated.png');
      await page.screenshot({ path: horenPath, fullPage: true });
      fs.copyFileSync(horenPath, path.join(artifactDir, 'hero-luyen-horen-updated.png'));
      console.log('Saved Hören screenshot:', horenPath);

      // 2. Capture /luyen-doc (Ảnh 2)
      const lesenUrl = `${baseUrl}/luyen-doc`;
      console.log(`Navigating to ${lesenUrl}...`);
      await page.goto(lesenUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.evaluate(() => document.fonts?.ready);
      await page.waitForTimeout(1000);

      const lesenPath = path.join(screenshotDir, 'hero-luyen-lesen-updated.png');
      await page.screenshot({ path: lesenPath, fullPage: true });
      fs.copyFileSync(lesenPath, path.join(artifactDir, 'hero-luyen-lesen-updated.png'));
      console.log('Saved Lesen screenshot:', lesenPath);

      console.log('SUCCESS! Both screenshots captured.');
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
