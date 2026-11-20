import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:3018';
const catalogOutput = path.join(root, 'screenshots', 'desktop', 'exam-catalog-osd-more-link.png');
const osdOutput = path.join(root, 'screenshots', 'desktop', 'osd-online-test-academic.png');

await fs.mkdir(path.dirname(catalogOutput), { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const catalogResponse = await desktop.goto(`${baseUrl}/de-thi`, { waitUntil: 'networkidle' });
  if (!catalogResponse || !catalogResponse.ok()) throw new Error(`Catalog returned ${catalogResponse?.status() ?? 'no response'}.`);
  const catalogState = await desktop.evaluate(() => ({
    moreHref: document.querySelector('a[href="/de-thi/osd"]')?.getAttribute('href'),
    b1: document.querySelectorAll('#osd-b1 a.group').length,
    b2: document.querySelectorAll('#osd-b2 a.group').length,
  }));
  if (catalogState.moreHref !== '/de-thi/osd' || catalogState.b1 !== 4 || catalogState.b2 !== 4) throw new Error(`Unexpected catalog state: ${JSON.stringify(catalogState)}.`);
  await desktop.screenshot({ path: catalogOutput, fullPage: true, animations: 'disabled' });

  const osdResponse = await desktop.goto(`${baseUrl}/de-thi/osd`, { waitUntil: 'networkidle' });
  if (!osdResponse || !osdResponse.ok()) throw new Error(`OSD page returned ${osdResponse?.status() ?? 'no response'}.`);
  await desktop.evaluate(() => document.fonts?.ready);
  const osdState = await desktop.evaluate(() => ({
    hero: document.querySelector('main > header h1')?.textContent?.replace(/\s+/gu, ' ').trim(),
    recent: document.querySelectorAll('section h2').length,
    b1Cards: document.querySelectorAll('#b1 a[href^="/de-thi/"]').length,
    b2Cards: document.querySelectorAll('#b2 a[href^="/de-thi/"]').length,
    anchors: ['#osd-catalog', '#b1', '#b2', '#a1', '#a2'].every((href) => document.querySelector(`a[href="${href}"]`)),
    a1: document.querySelector('#a1')?.textContent?.includes('ÖSD Zertifikat A1 (ZA1)') && document.querySelector('#a1')?.textContent?.includes('Sắp ra mắt'),
    a2: document.querySelector('#a2')?.textContent?.includes('ÖSD Zertifikat A2 (ZA2)') && document.querySelector('#a2')?.textContent?.includes('Sắp ra mắt'),
    ctaHref: document.querySelector('main > header a')?.getAttribute('href'),
    ctaText: document.querySelector('main > header a')?.textContent?.trim(),
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  if (!osdState.hero?.includes('ÖSD Online-Test') || osdState.ctaHref !== 'https://shdeducation.vn' || osdState.ctaText !== 'Tìm hiểu khoá học' || !osdState.anchors || !osdState.a1 || !osdState.a2 || osdState.bodyWidth > osdState.viewportWidth) throw new Error(`Unexpected OSD state: ${JSON.stringify(osdState)}.`);
  await desktop.screenshot({ path: osdOutput, fullPage: true, animations: 'disabled' });

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
  const mobileResponse = await mobile.goto(`${baseUrl}/de-thi/osd`, { waitUntil: 'networkidle' });
  if (!mobileResponse || !mobileResponse.ok()) throw new Error(`Mobile OSD page returned ${mobileResponse?.status() ?? 'no response'}.`);
  const mobileState = await mobile.evaluate(() => ({ bodyWidth: document.body.scrollWidth, viewportWidth: window.innerWidth }));
  if (mobileState.bodyWidth > mobileState.viewportWidth) throw new Error(`Mobile OSD page overflows: ${JSON.stringify(mobileState)}.`);

  console.log(JSON.stringify({ outputs: [path.relative(root, catalogOutput), path.relative(root, osdOutput)], catalogState, osdState, mobileState }));
} finally {
  await browser.close();
}
