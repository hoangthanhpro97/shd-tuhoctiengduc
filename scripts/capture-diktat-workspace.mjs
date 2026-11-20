import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:3000';

const outputDir = path.join(root, 'screenshots', 'desktop');
await fs.mkdir(outputDir, { recursive: true });

const dictationOutput = path.join(outputDir, 'diktat-workspace-dual-voice.png');
const shadowingOutput = path.join(outputDir, 'diktat-shadowing-all.png');
const vocabOutput = path.join(outputDir, 'diktat-vocabulary-pronunciation.png');

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  
  const testUrl = `${baseUrl}/chep-chinh-ta/diktat-b1-phan-xa-song-giong`;
  console.log(`Navigating to ${testUrl}...`);
  const resp = await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 30000 });
  if (!resp || !resp.ok()) {
    throw new Error(`Failed to load ${testUrl}: status ${resp?.status()}`);
  }

  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(1000);

  // Type something into textarea to demonstrate typing & diff
  const textarea = page.locator('textarea');
  await textarea.fill('Arbeit ist ein wichtiger Teil des Lebens.');
  
  // Click check button to show feedback
  const checkBtn = page.getByRole('button', { name: 'Kiểm tra' });
  await checkBtn.click();
  await page.waitForTimeout(500);

  // 1. Capture Dictation workspace (Photo 1)
  console.log('Capturing dictation mode...');
  await page.screenshot({ path: dictationOutput, fullPage: true, animations: 'disabled' });

  // 2. Click "Shadowing" button to switch to Shadowing mode (Photo 2)
  console.log('Switching to shadowing mode...');
  const shadowingNavBtn = page.getByRole('button', { name: 'Shadowing' }).first();
  await shadowingNavBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: shadowingOutput, fullPage: true, animations: 'disabled' });

  // 3. Click "Từ vựng" button to switch to Vocabulary mode (Photo 3)
  console.log('Switching to vocabulary mode...');
  const vocabNavBtn = page.getByRole('button', { name: 'Từ vựng' }).first();
  await vocabNavBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: vocabOutput, fullPage: true, animations: 'disabled' });

  console.log(JSON.stringify({
    success: true,
    outputs: [
      path.relative(root, dictationOutput),
      path.relative(root, shadowingOutput),
      path.relative(root, vocabOutput),
    ],
  }));
} finally {
  await browser.close();
}
