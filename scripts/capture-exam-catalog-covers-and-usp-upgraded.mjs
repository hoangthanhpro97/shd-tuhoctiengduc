import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:3018';
const output = path.join(root, 'screenshots', 'desktop', 'exam-catalog-covers-and-usp-upgraded.png');

await fs.mkdir(path.dirname(output), { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const response = await desktop.goto(`${baseUrl}/de-thi`, { waitUntil: 'networkidle' });
  if (!response || !response.ok()) throw new Error(`Catalog returned ${response?.status() ?? 'no response'}.`);
  await desktop.evaluate(() => document.fonts?.ready);

  const state = await desktop.evaluate(() => ({
    uspTitles: [...document.querySelectorAll('section[aria-labelledby="why-online-test"] h3')].map((node) => node.textContent?.trim()),
    uspDescriptions: [...document.querySelectorAll('section[aria-labelledby="why-online-test"] p')].map((node) => node.textContent?.trim()),
    covers: document.querySelectorAll('#osd-b1 .exam-flat-cover, #osd-b2 .exam-flat-cover').length,
    watermarkCount: document.querySelectorAll('#osd-b1 .exam-flat-cover svg, #osd-b2 .exam-flat-cover svg').length,
    skillLabels: document.querySelectorAll('#osd-b1 .exam-flat-cover, #osd-b2 .exam-flat-cover').length,
    gradientClasses: [...document.querySelectorAll('#osd-b1 .exam-flat-cover > div.bg-gradient-to-br, #osd-b2 .exam-flat-cover > div.bg-gradient-to-br')].map((node) => node.className),
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  const expectedTitles = [
    'Đề thi ÖSD - Goethe mới nhất & nhiều nhất',
    'Giao diện test như thi thật',
    'Giải thích bẫy tư duy và từ vựng chi tiết',
  ];
  if (JSON.stringify(state.uspTitles) !== JSON.stringify(expectedTitles)) throw new Error(`Unexpected USP titles: ${JSON.stringify(state.uspTitles)}.`);
  if (state.uspDescriptions.length !== 3 || state.covers !== 8 || state.watermarkCount !== 8 || state.skillLabels !== 8) throw new Error(`Unexpected upgraded catalog structure: ${JSON.stringify(state)}.`);
  if (state.gradientClasses.length !== 8 || new Set(state.gradientClasses).size < 4) throw new Error(`Cover variants are not distinct: ${JSON.stringify(state.gradientClasses)}.`);
  if (state.bodyWidth > state.viewportWidth) throw new Error(`Desktop page overflows horizontally: ${JSON.stringify(state)}.`);

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
  const mobileResponse = await mobile.goto(`${baseUrl}/de-thi`, { waitUntil: 'networkidle' });
  if (!mobileResponse || !mobileResponse.ok()) throw new Error(`Mobile catalog returned ${mobileResponse?.status() ?? 'no response'}.`);
  const mobileState = await mobile.evaluate(() => ({ bodyWidth: document.body.scrollWidth, viewportWidth: window.innerWidth }));
  if (mobileState.bodyWidth > mobileState.viewportWidth) throw new Error(`Mobile page overflows horizontally: ${JSON.stringify(mobileState)}.`);

  await desktop.screenshot({ path: output, fullPage: true, animations: 'disabled' });
  console.log(JSON.stringify({ output: path.relative(root, output), state, mobileState }));
} finally {
  await browser.close();
}
