import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:3018';
const output = path.join(root, 'screenshots', 'desktop', 'exam-catalog-final-polish.png');

await fs.mkdir(path.dirname(output), { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const response = await desktop.goto(`${baseUrl}/de-thi`, { waitUntil: 'networkidle' });
  if (!response || !response.ok()) throw new Error(`Catalog returned ${response?.status() ?? 'no response'}.`);
  await desktop.evaluate(() => document.fonts?.ready);

  const state = await desktop.evaluate(() => {
    const hero = document.querySelector('main > header');
    const heroHeading = hero?.querySelector('h1');
    const usp = document.querySelector('section[aria-labelledby="why-online-test"]');
    const uspHeading = usp?.querySelector('h2');
    const titleWrap = uspHeading?.parentElement;
    const question = titleWrap?.querySelector('[data-testid="usp-question"]');
    const questionCircle = titleWrap?.querySelector('[data-testid="usp-question-circle"]');
    const onlineText = titleWrap?.querySelector('[data-testid="usp-online-text"]');
    const heroRect = hero?.getBoundingClientRect();
    const headingRect = heroHeading?.getBoundingClientRect();
    const uspHeadingLines = uspHeading ? [...uspHeading.children].map((node) => {
      const rect = node.getBoundingClientRect();
      return { text: node.textContent?.replace(/\s+/gu, ' ').trim(), top: Math.round(rect.top), bottom: Math.round(rect.bottom), width: Math.round(rect.width) };
    }) : [];
    const secondLine = uspHeading?.children[1];
    const uspHeadingRect = uspHeading?.getBoundingClientRect();
    const questionRect = question?.getBoundingClientRect();
    const questionCircleRect = questionCircle?.getBoundingClientRect();
    const onlineTextRect = onlineText?.getBoundingClientRect();
    const titleWrapRect = titleWrap?.getBoundingClientRect();
    return {
      heroClassName: hero?.className ?? '',
      heroTop: heroRect ? Math.round(heroRect.top) : null,
      heroHeadingTop: headingRect ? Math.round(headingRect.top) : null,
      uspClassName: usp?.className ?? '',
      uspHeadingLines,
      questionText: question?.textContent?.trim(),
    questionLeft: questionRect ? Math.round(questionRect.left) : null,
      questionTop: questionRect ? Math.round(questionRect.top) : null,
      questionWidth: questionRect ? Math.round(questionRect.width) : null,
      questionHeight: questionRect ? Math.round(questionRect.height) : null,
      questionCircleLeft: questionCircleRect ? Math.round(questionCircleRect.left) : null,
      questionCircleTop: questionCircleRect ? Math.round(questionCircleRect.top) : null,
      questionCircleWidth: questionCircleRect ? Math.round(questionCircleRect.width) : null,
      questionCircleHeight: questionCircleRect ? Math.round(questionCircleRect.height) : null,
      questionCircleZIndex: questionCircle ? getComputedStyle(questionCircle).zIndex : null,
      onlineTextLeft: onlineTextRect ? Math.round(onlineTextRect.left) : null,
      onlineTextRight: onlineTextRect ? Math.round(onlineTextRect.right) : null,
      onlineTextZIndex: onlineText ? getComputedStyle(onlineText).zIndex : null,
      questionLineTop: secondLine ? Math.round(secondLine.getBoundingClientRect().top) : null,
      questionLineText: secondLine?.textContent?.replace(/\s+/gu, ' ').trim(),
    questionZIndex: question ? getComputedStyle(question).zIndex : null,
    headingZIndex: uspHeading ? getComputedStyle(uspHeading).zIndex : null,
      headingRight: uspHeadingRect ? Math.round(uspHeadingRect.right) : null,
      titleWrapRight: titleWrapRect ? Math.round(titleWrapRect.right) : null,
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });

  if (!state.heroClassName.includes('pt-24') || !state.heroClassName.includes('sm:pt-28') || !state.heroClassName.includes('bg-gradient-to-b')) throw new Error(`Hero spacing/background mismatch: ${JSON.stringify(state)}.`);
  if (!state.uspClassName.includes('bg-gradient-to-b') || !state.uspClassName.includes('from-white') || !state.uspClassName.includes('via-[#fff5f5]') || state.uspClassName.includes('border-')) throw new Error(`USP background/border mismatch: ${JSON.stringify(state)}.`);
  if (state.uspHeadingLines.length !== 3 || !state.uspHeadingLines[1].text.includes('ÖSD & Goethe Online-Test') || state.uspHeadingLines[1].text.includes('tại SHD') || state.questionText !== '?' || !state.questionLineText?.includes('ÖSD & Goethe Online-Test')) throw new Error(`USP title structure mismatch: ${JSON.stringify(state)}.`);
  if (state.questionLeft === null || state.questionTop === null || state.questionLineTop === null || state.questionCircleWidth === null || state.questionWidth === null || state.questionCircleHeight === null || state.questionHeight === null || state.questionCircleWidth <= state.questionWidth || state.questionCircleZIndex !== '0' || state.questionCircleLeft === null || state.questionCircleTop === null || state.onlineTextRight === null || state.onlineTextZIndex !== '10' || state.questionCircleLeft >= state.onlineTextRight || state.questionCircleLeft + state.questionCircleWidth <= state.onlineTextRight || Math.abs((state.questionCircleLeft + state.questionCircleWidth / 2) - (state.questionLeft + state.questionWidth / 2)) > 3 || Math.abs((state.questionCircleTop + state.questionCircleHeight / 2) - (state.questionTop + state.questionHeight / 2)) > 3 || Math.abs((state.questionTop + state.questionHeight / 2) - (state.uspHeadingLines[1].top + (state.uspHeadingLines[1].bottom - state.uspHeadingLines[1].top) / 2)) > 4) throw new Error(`Question mark/circle is not centered beside Online-Test: ${JSON.stringify(state)}.`);
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
