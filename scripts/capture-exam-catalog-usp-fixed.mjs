import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:3018';
const output = path.join(root, 'screenshots', 'desktop', 'exam-catalog-usp-fixed.png');

await fs.mkdir(path.dirname(output), { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const response = await desktop.goto(`${baseUrl}/de-thi`, { waitUntil: 'networkidle' });
  if (!response || !response.ok()) throw new Error(`Catalog returned ${response?.status() ?? 'no response'}.`);
  await desktop.evaluate(() => document.fonts?.ready);

  const state = await desktop.evaluate(() => {
    const section = document.querySelector('section[aria-labelledby="why-online-test"]');
    const heading = section?.querySelector('h2');
    const headingLines = heading ? [...heading.children].map((node) => ({ text: node.textContent?.replace(/\s+/gu, ' ').trim(), top: Math.round(node.getBoundingClientRect().top), bottom: Math.round(node.getBoundingClientRect().bottom) })) : [];
    const question = heading?.querySelector('[aria-hidden="true"]');
    const questionRect = question?.getBoundingClientRect();
    const headingRect = heading?.getBoundingClientRect();
    return {
      sectionClassName: section?.className ?? '',
      headingLines,
      questionText: question?.textContent?.trim(),
      questionTop: questionRect ? Math.round(questionRect.top) : null,
      thirdLineBottom: headingLines[2]?.bottom ?? null,
      headingLeft: headingRect ? Math.round(headingRect.left) : null,
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  if (!state.sectionClassName.includes('bg-gradient-to-r') || !state.sectionClassName.includes('from-[#fff5f5]') || !state.sectionClassName.includes('border-rose-100/80')) throw new Error(`USP pastel background is missing: ${state.sectionClassName}.`);
  if (state.headingLines.length !== 3 || !state.headingLines[1].text.includes('ÖSD & Goethe Online-Test') || state.questionText !== '?') throw new Error(`Unexpected USP heading structure: ${JSON.stringify(state)}.`);
  if (state.questionTop === null || state.thirdLineBottom === null || Math.abs(state.questionTop - state.headingLines[2].top) > 6 || state.questionTop > state.thirdLineBottom) throw new Error(`Question mark is not attached to line three: ${JSON.stringify(state)}.`);
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
