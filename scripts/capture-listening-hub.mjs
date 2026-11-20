import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:3018';
const output = path.join(root, 'screenshots', 'desktop', 'listening-hub-goethe-osd-horen.png');

await fs.mkdir(path.dirname(output), { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const response = await desktop.goto(`${baseUrl}/luyen-nghe`, { waitUntil: 'networkidle' });
  if (!response || !response.ok()) throw new Error(`Listening hub returned ${response?.status() ?? 'no response'}.`);
  await desktop.evaluate(() => document.fonts?.ready);
  const state = await desktop.evaluate(() => ({
    hero: document.querySelector('main > header h1')?.textContent?.replace(/\s+/gu, ' ').trim(),
    cards: document.querySelectorAll('main section a[href^="/luyen-nghe/"]').length,
    sidebar: Boolean(document.querySelector('input[placeholder*="Tìm tên bài"]')),
    pagination: Boolean(document.querySelector('[aria-label="Phân trang bài luyện nghe"]')),
    columns: [...document.querySelectorAll('main section a[href^="/luyen-nghe/"]')].slice(0, 3).map((node) => Math.round(node.getBoundingClientRect().left)),
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  if (!state.hero?.includes('Modelltests Hören') || state.cards === 0 || !state.sidebar || !state.pagination || new Set(state.columns).size !== 3 || state.bodyWidth > state.viewportWidth) throw new Error(`Unexpected listening hub structure: ${JSON.stringify(state)}.`);

  const search = desktop.locator('input[placeholder*="Tìm tên bài"]');
  await search.fill('osd-b2-test-04');
  const filteredCount = await desktop.locator('main section a[href^="/luyen-nghe/"]').count();
  if (filteredCount < 1) throw new Error(`Search filter returned no matching item: ${filteredCount}.`);
  const firstHref = await desktop.locator('main section a[href^="/luyen-nghe/"]').first().getAttribute('href');
  if (!firstHref?.startsWith('/luyen-nghe/')) throw new Error(`Listening detail link is invalid: ${firstHref}.`);
  await search.fill('');

  await desktop.locator('main > header button[aria-haspopup="dialog"]').click();
  if (!(await desktop.locator('[role="dialog"]').isVisible())) throw new Error('Listening CTA did not open AuthModal.');
  await desktop.locator('[aria-label="Đóng"]').click();
  await desktop.screenshot({ path: output, fullPage: true, animations: 'disabled' });

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
  const mobileResponse = await mobile.goto(`${baseUrl}/luyen-nghe`, { waitUntil: 'networkidle' });
  if (!mobileResponse || !mobileResponse.ok()) throw new Error(`Mobile listening hub returned ${mobileResponse?.status() ?? 'no response'}.`);
  const mobileState = await mobile.evaluate(() => ({ bodyWidth: document.body.scrollWidth, viewportWidth: window.innerWidth }));
  if (mobileState.bodyWidth > mobileState.viewportWidth) throw new Error(`Mobile listening hub overflows: ${JSON.stringify(mobileState)}.`);
  console.log(JSON.stringify({ output: path.relative(root, output), state, filteredCount, firstHref, mobileState }));
} finally {
  await browser.close();
}
