import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:3018';
const withBannerOutput = path.join(root, 'screenshots', 'desktop', 'exam-catalog-with-banner.png');
const dismissedOutput = path.join(root, 'screenshots', 'desktop', 'exam-catalog-banner-dismissed.png');

await fs.mkdir(path.dirname(withBannerOutput), { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const desktopResponse = await desktop.goto(`${baseUrl}/de-thi`, { waitUntil: 'networkidle' });
  if (!desktopResponse || !desktopResponse.ok()) throw new Error(`Desktop catalog returned ${desktopResponse?.status() ?? 'no response'}.`);
  await desktop.evaluate(() => document.fonts?.ready);

  const state = await desktop.evaluate(() => ({
    hero: document.querySelector('main h1')?.textContent ?? '',
    heroLines: document.querySelectorAll('main > header h1 > span').length,
    recent: document.querySelectorAll('#updated a').length,
    b1: document.querySelectorAll('#osd-b1 a.group').length,
    b2: document.querySelectorAll('#osd-b2 a.group').length,
    goethe: document.querySelectorAll('#goethe a.group').length,
    telc: document.querySelectorAll('#telc a.group').length,
    filterText: document.querySelector('section#osd nav')?.textContent?.replace(/\s+/gu, ' ').trim() ?? '',
    sectionTitles: [...document.querySelectorAll('main h2')].map((heading) => heading.textContent?.replace(/\s+/gu, ' ').trim()),
    announcementPosition: (() => {
      const node = document.querySelector('main > header [data-testid="announcement-slot"]');
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      return { top: Math.round(rect.top), position: getComputedStyle(node).position, zIndex: getComputedStyle(node).zIndex };
    })(),
    heroBackground: getComputedStyle(document.querySelector('main > header')).backgroundImage,
    uspCells: [...document.querySelectorAll('section[aria-labelledby="why-online-test"] > div > *')].map((node) => {
      const rect = node.getBoundingClientRect();
      return { left: Math.round(rect.left), top: Math.round(rect.top) };
    }),
    heroTitleTop: Math.round(document.querySelector('main > header h1').getBoundingClientRect().top),
    updatedTop: Math.round(document.querySelector('#updated').getBoundingClientRect().top),
    uspTop: Math.round(document.querySelector('section[aria-labelledby="why-online-test"]').getBoundingClientRect().top),
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  if (!state.hero.includes('Online-Test') || !state.hero.includes('Miễn phí - SHD Tự Học Tiếng Đức') || state.heroLines !== 2) throw new Error(`Unexpected hero structure: ${JSON.stringify(state)}.`);
  if (state.recent !== 6 || state.b1 !== 4 || state.b2 !== 4 || state.goethe !== 2 || state.telc !== 2) throw new Error(`Unexpected catalog structure: ${JSON.stringify(state)}.`);
  if (!state.filterText.includes('Tất cả') || !state.filterText.includes('telc')) throw new Error(`Unexpected filter bar: ${state.filterText}.`);
  if (!state.sectionTitles.includes('Bài test từ ÖSD Zertifikat') || !state.sectionTitles.includes('Bài test từ Goethe-Zertifikat') || !state.sectionTitles.includes('Bài test từ telc Deutsch')) throw new Error(`Unexpected section headings: ${JSON.stringify(state.sectionTitles)}.`);
  if (!state.announcementPosition || state.announcementPosition.position !== 'absolute' || state.announcementPosition.zIndex !== '20') throw new Error(`Announcement is not a Hero overlay: ${JSON.stringify(state.announcementPosition)}.`);
  if (!state.heroBackground.includes('gradient')) throw new Error(`Hero gradient is missing: ${state.heroBackground}.`);
  if (state.uspCells.length !== 4 || state.uspCells[0].top !== state.uspCells[1].top || state.uspCells[2].top !== state.uspCells[3].top || state.uspCells[2].top <= state.uspCells[0].top || state.uspCells[0].left !== state.uspCells[2].left || state.uspCells[1].left !== state.uspCells[3].left) throw new Error(`USP is not a desktop 2x2 grid: ${JSON.stringify(state.uspCells)}.`);
  if (state.bodyWidth > state.viewportWidth) throw new Error(`Desktop page overflows horizontally: ${JSON.stringify(state)}.`);

  await desktop.locator('main > header button[aria-haspopup="dialog"]').click();
  if (!(await desktop.locator('[role="dialog"]').isVisible())) throw new Error('Hero CTA did not open AuthModal.');
  await desktop.locator('[aria-label="Đóng"]').click();
  await desktop.screenshot({ path: withBannerOutput, fullPage: true, animations: 'disabled' });

  await desktop.locator('main > header [aria-label="Đóng thông báo"]').click();
  await desktop.waitForFunction(() => getComputedStyle(document.querySelector('main > header [data-testid="announcement-bar"]')).opacity === '0');
  const dismissedState = await desktop.evaluate(() => {
    const hero = document.querySelector('main > header');
    const announcement = document.querySelector('main > header [data-testid="announcement-bar"]');
    const rect = hero?.getBoundingClientRect();
    return {
      heroTop: rect ? Math.round(rect.top) : null,
      heroBackground: hero ? getComputedStyle(hero).backgroundImage : '',
      announcementOpacity: announcement ? getComputedStyle(announcement).opacity : null,
      announcementDisplay: announcement ? getComputedStyle(announcement).display : null,
      heroTitleTop: Math.round(document.querySelector('main > header h1').getBoundingClientRect().top),
      updatedTop: Math.round(document.querySelector('#updated').getBoundingClientRect().top),
      uspTop: Math.round(document.querySelector('section[aria-labelledby="why-online-test"]').getBoundingClientRect().top),
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  if (dismissedState.announcementOpacity !== '0' || dismissedState.heroBackground === 'none' || dismissedState.bodyWidth > dismissedState.viewportWidth) throw new Error(`Unexpected dismissed banner state: ${JSON.stringify(dismissedState)}.`);
  if (dismissedState.heroTitleTop !== state.heroTitleTop || dismissedState.updatedTop !== state.updatedTop || dismissedState.uspTop !== state.uspTop) throw new Error(`Dismissal caused layout shift: ${JSON.stringify({ before: { heroTitleTop: state.heroTitleTop, updatedTop: state.updatedTop, uspTop: state.uspTop }, after: dismissedState })}.`);
  await desktop.screenshot({ path: dismissedOutput, fullPage: true, animations: 'disabled' });

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
  const mobileResponse = await mobile.goto(`${baseUrl}/de-thi`, { waitUntil: 'networkidle' });
  if (!mobileResponse || !mobileResponse.ok()) throw new Error(`Mobile catalog returned ${mobileResponse?.status() ?? 'no response'}.`);
  const mobileState = await mobile.evaluate(() => ({ bodyWidth: document.body.scrollWidth, viewportWidth: window.innerWidth }));
  if (mobileState.bodyWidth > mobileState.viewportWidth) throw new Error(`Mobile page overflows horizontally: ${JSON.stringify(mobileState)}.`);

  console.log(JSON.stringify({ outputs: [path.relative(root, withBannerOutput), path.relative(root, dismissedOutput)], state, dismissedState, mobileState }));
} finally {
  await browser.close();
}
