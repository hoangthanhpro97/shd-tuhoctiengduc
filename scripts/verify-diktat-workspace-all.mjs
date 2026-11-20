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

if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

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

      const testUrl = `${baseUrl}/chep-chinh-ta/diktat-b1-phan-xa-song-giong`;
      console.log(`Navigating to ${testUrl}...`);
      await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.evaluate(() => document.fonts?.ready);
      await page.waitForTimeout(1000);

      // 1. Verify Mode 1: Dictation
      console.log('--- Verifying Mode 1: Dictation ---');
      const textarea = page.locator('textarea');
      await textarea.fill('Arbeit ist ein wichtiger Teil des Lebens.');
      
      const checkBtn = page.getByRole('button', { name: 'Kiểm tra' });
      await checkBtn.click();
      await page.waitForTimeout(500);

      const dictationPath = path.join(screenshotDir, 'diktat-workspace-dual-voice.png');
      await page.screenshot({ path: dictationPath, fullPage: true });
      fs.copyFileSync(dictationPath, path.join(artifactDir, 'diktat-workspace-dual-voice.png'));
      console.log('Saved dictation screenshot:', dictationPath);

      // 2. Switch to Mode 2: Shadowing
      console.log('--- Verifying Mode 2: Shadowing ---');
      const shadowingNavBtn = page.getByRole('button', { name: 'Shadowing' }).first();
      await shadowingNavBtn.click();
      await page.waitForTimeout(600);

      const shadowingPath = path.join(screenshotDir, 'diktat-shadowing-all.png');
      await page.screenshot({ path: shadowingPath, fullPage: true });
      fs.copyFileSync(shadowingPath, path.join(artifactDir, 'diktat-shadowing-all.png'));
      console.log('Saved shadowing screenshot:', shadowingPath);

      // 3. Switch to Mode 3: Vocabulary
      console.log('--- Verifying Mode 3: Vocabulary ---');
      const vocabNavBtn = page.getByRole('button', { name: 'Từ vựng' }).first();
      await vocabNavBtn.click();
      await page.waitForTimeout(600);

      const vocabPath = path.join(screenshotDir, 'diktat-vocabulary-pronunciation.png');
      await page.screenshot({ path: vocabPath, fullPage: true });
      fs.copyFileSync(vocabPath, path.join(artifactDir, 'diktat-vocabulary-pronunciation.png'));
      console.log('Saved vocabulary screenshot:', vocabPath);

      console.log('SUCCESS! All 3 mode screenshots captured and verified.');
    } finally {
      await browser.close();
    }
  } finally {
    console.log('Stopping dev server process...');
    nextProc.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
