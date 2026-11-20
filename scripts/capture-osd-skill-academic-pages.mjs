import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:3018';
const routes = [
  { path: '/luyen-nghe/osd', skill: 'nghe', output: 'osd-listening-academic.png', hero: 'Luyện nghe ÖSD Hören Online-Test', catalog: 'Bài luyện nghe từ ÖSD Zertifikat' },
  { path: '/luyen-doc/osd', skill: 'đọc', output: 'osd-reading-academic.png', hero: 'Luyện đọc ÖSD Lesen Online-Test', catalog: 'Bài luyện đọc từ ÖSD Zertifikat' },
];

await fs.mkdir(path.join(root, 'screenshots', 'desktop'), { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    const response = await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
    if (!response || !response.ok()) throw new Error(`${route.path} returned ${response?.status() ?? 'no response'}.`);
    await page.evaluate(() => document.fonts?.ready);
    const state = await page.evaluate(() => ({
      hero: document.querySelector('main > header h1')?.innerText?.replace(/\s+/gu, ' ').trim(),
      recent: document.querySelectorAll('main section h2').length,
      catalog: document.querySelector('#osd-skill-catalog')?.textContent?.trim() ?? '',
      b1Cards: document.querySelectorAll('#b1 a[href^="/luyen-"]').length,
      b2Cards: document.querySelectorAll('#b2 a[href^="/luyen-"]').length,
      carouselTrack: document.querySelectorAll('#b1 .snap-x, #b2 .snap-x').length,
      b1ItemCount: document.querySelectorAll('#b1 .snap-x > a').length,
      b1FirstItemWidth: document.querySelector('#b1 .snap-x > a')?.getBoundingClientRect().width ?? 0,
      b1TrackWidth: document.querySelector('#b1 .snap-x')?.getBoundingClientRect().width ?? 0,
      a1: document.querySelector('#a1')?.textContent?.includes('Sắp ra mắt'),
      a2: document.querySelector('#a2')?.textContent?.includes('Sắp ra mắt'),
      anchors: ['#osd-skill-catalog', '#b1', '#b2', '#a1', '#a2'].every((href) => document.querySelector(`a[href="${href}"]`)),
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    if (!state.hero?.includes(route.hero) || !state.catalog || state.b1Cards < 4 || state.b2Cards < 4 || state.carouselTrack !== 2 || state.b1ItemCount < 4 || state.b1FirstItemWidth < 240 || state.b1FirstItemWidth > 290 || !state.a1 || !state.a2 || !state.anchors || state.bodyWidth > state.viewportWidth) throw new Error(`Unexpected ${route.path} state: ${JSON.stringify(state)}.`);
    await page.locator('main > header button[aria-haspopup="dialog"]').click();
    if (!(await page.locator('[role="dialog"]').isVisible())) throw new Error(`${route.path} CTA did not open AuthModal.`);
    await page.locator('[aria-label="Đóng"]').click();
    const firstLink = await page.locator('#b1 a[href^="/luyen-"]').first().getAttribute('href');
    if (!firstLink?.startsWith(route.path.startsWith('/luyen-nghe') ? '/luyen-nghe/' : '/luyen-doc/')) throw new Error(`Invalid ${route.skill} detail link: ${firstLink}.`);
    const output = path.join(root, 'screenshots', 'desktop', route.output);
    await page.screenshot({ path: output, fullPage: true, animations: 'disabled' });
    const mobile = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
    const mobileResponse = await mobile.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
    if (!mobileResponse || !mobileResponse.ok()) throw new Error(`Mobile ${route.path} returned ${mobileResponse?.status() ?? 'no response'}.`);
    const mobileState = await mobile.evaluate(() => ({ bodyWidth: document.body.scrollWidth, viewportWidth: window.innerWidth }));
    if (mobileState.bodyWidth > mobileState.viewportWidth) throw new Error(`Mobile ${route.path} overflows: ${JSON.stringify(mobileState)}.`);
    console.log(JSON.stringify({ route: route.path, output: path.relative(root, output), state, firstLink, mobileState }));
    await mobile.close();
    await page.close();
  }
} finally {
  await browser.close();
}
