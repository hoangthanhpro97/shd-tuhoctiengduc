import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:3018';
const output = path.join(root, 'screenshots', 'desktop', 'exam-catalog-flat.png');

await fs.mkdir(path.dirname(output), { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const response = await page.goto(`${baseUrl}/de-thi`, { waitUntil: 'networkidle' });
  if (!response || !response.ok()) throw new Error(`Catalog returned ${response?.status() ?? 'no response'}.`);
  await page.evaluate(() => document.fonts?.ready);

  const layout = await page.evaluate(() => {
    const getCards = (id) => [...document.querySelectorAll(`#${id} a.group`)].map((card) => {
      const rect = card.getBoundingClientRect();
      return { left: Math.round(rect.left), top: Math.round(rect.top) };
    });
    return { b1: getCards('osd-b1'), b2: getCards('osd-b2') };
  });
  if (layout.b1.length !== 4 || layout.b2.length !== 4) {
    throw new Error(`Expected four B1 and B2 cards, got ${layout.b1.length} and ${layout.b2.length}.`);
  }
  if (new Set(layout.b1.map(({ top }) => top)).size !== 1 || new Set(layout.b2.map(({ top }) => top)).size !== 1) {
    throw new Error(`Cards are not aligned in one desktop row: ${JSON.stringify(layout)}.`);
  }

  await page.screenshot({ path: output, fullPage: true, animations: 'disabled' });
  console.log(JSON.stringify({ output: path.relative(root, output), layout }));
} finally {
  await browser.close();
}
