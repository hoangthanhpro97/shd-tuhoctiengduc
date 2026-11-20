import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:3000';
const outputRoot = path.join(root, 'screenshots');
const viewports = {
  desktop: { width: 1280, height: 800, isMobile: false },
  mobile: { width: 375, height: 812, isMobile: true },
};
const routes = [
  ['home', '/'],
  ['exam-catalog', '/de-thi'],
  ['exam-detail', '/de-thi/demo-b1-mock-02'],
  ['listening-catalog', '/luyen-nghe'],
  ['reading-catalog', '/luyen-doc'],
  ['diktat-catalog', '/chep-chinh-ta'],
  ['diktat-detail', '/chep-chinh-ta/diktat-a2-am-arbeitsplatz'],
  ['model-answers', '/bai-mau-schreiben'],
  ['model-answer-detail', '/bai-mau-schreiben/b1-schreiben-e-mail'],
  ['listening-detail', '/luyen-nghe/hoeren-b1-am-bahnhof'],
  ['reading-detail', '/luyen-doc/lesen-b1-ausbildung'],
  ['account-guest', '/tai-khoan'],
  ['pro-account', '/tai-khoan-pro'],
  ['not-found', '/trang-khong-ton-tai'],
];

async function ensureOutputDirectories() {
  await Promise.all(Object.keys(viewports).map((name) => fs.rm(path.join(outputRoot, name), { recursive: true, force: true }).then(() => fs.mkdir(path.join(outputRoot, name), { recursive: true }))));
}

async function waitForPage(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(350);
}

async function capture(page, viewportName, name, url, options = {}) {
  await page.goto(new URL(url, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
  await waitForPage(page);
  if (options.prepare) await options.prepare(page);
  const target = path.join(outputRoot, viewportName, `${name}.png`);
  await page.screenshot({ path: target, fullPage: true, animations: 'disabled' });
  console.log(`Saved ${path.relative(root, target)}`);
}

async function createAttempt(context) {
  const response = await context.request.post(new URL('/api/v1/attempts', baseUrl).toString(), {
    data: { slug: 'demo-b1-mock-02', mode: 'exam' },
  });
  if (!response.ok()) throw new Error(`Attempt creation failed: ${response.status()} ${await response.text()}`);
  const payload = await response.json();
  if (!payload.attemptId) throw new Error('Attempt response did not include attemptId.');
  return payload.attemptId;
}

async function captureViewport(browser, viewportName, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile, deviceScaleFactor: 1 });
  await context.addInitScript(() => window.localStorage.removeItem('shd-demo-user'));
  // Keep the exam room visible while its client countdown hydrates before capture.
  await context.route('**/api/v1/attempts/*/submit', (route) => route.abort());
  const page = await context.newPage();

  for (const [name, route] of routes) await capture(page, viewportName, name, route);

  await capture(page, viewportName, 'auth-modal', '/', {
    prepare: async (currentPage) => {
      await currentPage.getByRole('button', { name: /đăng nhập/i }).click();
      await currentPage.locator('.auth-modal').waitFor({ state: 'visible' });
    },
  });

  const attemptId = await createAttempt(context);
  await capture(page, viewportName, 'exam-room', `/lam-bai/${attemptId}`, {
    prepare: async (currentPage) => {
      await currentPage.locator('.exam-room-page').waitFor({ state: 'visible', timeout: 30_000 });
      await currentPage.locator('.question-palette').waitFor({ state: 'visible', timeout: 30_000 });
    },
  });

  await context.close();

  const authenticatedContext = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile, deviceScaleFactor: 1 });
  await authenticatedContext.addInitScript(() => window.localStorage.setItem('shd-demo-user', JSON.stringify({ name: 'Nguyễn Minh Anh', email: 'minhanh@example.com', initials: 'MA', plan: 'Free' })));
  const authenticatedPage = await authenticatedContext.newPage();
  await capture(authenticatedPage, viewportName, 'dashboard-hoc-tap', '/hoc-tap');
  await capture(authenticatedPage, viewportName, 'account-authenticated', '/tai-khoan');
  await capture(authenticatedPage, viewportName, 'pro-account-pricing', '/tai-khoan-pro');
  await authenticatedContext.close();
}

async function main() {
  await ensureOutputDirectories();
  const health = await fetch(new URL('/api/healthz', baseUrl));
  if (!health.ok) throw new Error(`Dev server is not healthy: ${health.status}`);

  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, viewport] of Object.entries(viewports)) await captureViewport(browser, name, viewport);
  } finally {
    await browser.close();
  }

  const files = [];
  for (const name of Object.keys(viewports)) {
    const entries = await fs.readdir(path.join(outputRoot, name));
    files.push(...entries.map((entry) => path.join(name, entry)));
  }
  if (files.length !== 38) throw new Error(`Expected 38 PNG files, found ${files.length}.`);
  console.log(`Captured ${files.length} screenshots in ${path.relative(root, outputRoot)}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
