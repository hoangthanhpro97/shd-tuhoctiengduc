import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:3032';
const outDir = path.join(root, 'screenshots', 'desktop');

await fs.mkdir(outDir, { recursive: true });

const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];

function parseMatrixTxTy(transformStr) {
  if (!transformStr || transformStr === 'none') return { tx: 0, ty: 0, raw: transformStr };
  const match2d = transformStr.match(/^matrix\(([^)]+)\)$/);
  if (match2d) {
    const parts = match2d[1].split(',').map((s) => Number.parseFloat(s.trim()));
    return { tx: parts[4] ?? 0, ty: parts[5] ?? 0, raw: transformStr };
  }
  const match3d = transformStr.match(/^matrix3d\(([^)]+)\)$/);
  if (match3d) {
    const parts = match3d[1].split(',').map((s) => Number.parseFloat(s.trim()));
    return { tx: parts[12] ?? 0, ty: parts[13] ?? 0, raw: transformStr };
  }
  return { tx: 0, ty: 0, raw: transformStr };
}

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await context.tracing.start({ screenshots: true, snapshots: true });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('/api/v1/attempts')) {
      failedRequests.push(`${res.status()} ${res.url()}`);
    }
  });

  const res = await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 35000 });
  if (!res || !res.ok()) throw new Error(`GET / returned ${res?.status() ?? 'no response'}`);
  await page.evaluate(() => document.fonts?.ready);

  // Foreground stability baseline + Hero Alignment (Test 04 & Test 05)
  const fgBefore = await page.evaluate(() => {
    const hero = document.querySelector('[data-testid="hero-section"]');
    const h1 = hero?.querySelector('h1');
    const p = hero?.querySelector('p');
    const cta = hero?.querySelector('button');
    const heroRect = hero?.getBoundingClientRect();
    const h1Rect = h1?.getBoundingClientRect();
    const pRect = p?.getBoundingClientRect();
    const ctaRect = cta?.getBoundingClientRect();
    return {
      heroCenterX: heroRect ? heroRect.left + heroRect.width / 2 : 0,
      heroTop: heroRect?.top ?? 0,
      heroHeight: heroRect?.height ?? 0,
      h1: h1Rect ? { left: h1Rect.left, top: h1Rect.top, centerX: h1Rect.left + h1Rect.width / 2 } : null,
      p: pRect ? { left: pRect.left, top: pRect.top, centerX: pRect.left + pRect.width / 2 } : null,
      cta: ctaRect ? { left: ctaRect.left, top: ctaRect.top, centerX: ctaRect.left + ctaRect.width / 2 } : null,
    };
  });

  if (
    !fgBefore.h1 ||
    !fgBefore.p ||
    !fgBefore.cta ||
    Math.abs(fgBefore.h1.centerX - fgBefore.heroCenterX) > 3 ||
    Math.abs(fgBefore.p.centerX - fgBefore.heroCenterX) > 3 ||
    Math.abs(fgBefore.cta.centerX - fgBefore.heroCenterX) > 3
  ) {
    throw new Error(`Test 05 Hero Alignment failed: ${JSON.stringify(fgBefore)}`);
  }

  // TEST 01 – Autonomous Motion (stationary pointer, measure T=0s, T=2s, T=5s)
  const readDriftSamples = async () =>
    page.evaluate(() => {
      const drifters = Array.from(document.querySelectorAll('[data-testid="floating-books-bg"] .shd-fb-drift'));
      return drifters.slice(0, 4).map((el) => ({
        transform: getComputedStyle(el).transform,
        state: getComputedStyle(el).animationPlayState,
      }));
    });

  const driftT0 = await readDriftSamples();
  await page.waitForTimeout(2000);
  const driftT2 = await readDriftSamples();
  await page.waitForTimeout(3000);
  const driftT5 = await readDriftSamples();

  const autonomousChanged = driftT0.every(
    (s, idx) => s.state === 'running' && s.transform !== driftT2[idx].transform && driftT2[idx].transform !== driftT5[idx].transform,
  );
  if (!autonomousChanged) {
    throw new Error(`Test 01 Autonomous Motion failed: ${JSON.stringify({ driftT0, driftT2, driftT5 })}`);
  }

  // TEST 02 – Mouse Parallax across 3 Planes (~1 : 0.5 : 0.25)
  const heroBox = await page.locator('[data-testid="hero-section"]').boundingBox();
  if (!heroBox) throw new Error('Hero boundingBox missing');
  await page.mouse.move(heroBox.x + heroBox.width * 0.5, heroBox.y + heroBox.height * 0.5);
  await page.waitForTimeout(120);
  await page.mouse.move(heroBox.x + heroBox.width * 0.92, heroBox.y + heroBox.height * 0.78, { steps: 14 });
  await page.waitForTimeout(550);

  const planesMovedRaw = await page.evaluate(() =>
    [0, 1, 2].map((i) => {
      const el = document.querySelector(`[data-testid="floating-books-bg"] [data-plane="${i}"]`);
      return el ? getComputedStyle(el).transform : 'none';
    }),
  );
  const pMoved = planesMovedRaw.map(parseMatrixTxTy);
  const ratioMidX = Math.abs(pMoved[0].tx) > 1 ? pMoved[1].tx / pMoved[0].tx : 0;
  const ratioFarX = Math.abs(pMoved[0].tx) > 1 ? pMoved[2].tx / pMoved[0].tx : 0;

  if (
    Math.abs(pMoved[0].tx) < 20 ||
    Math.abs(ratioMidX - 0.5) > 0.04 ||
    Math.abs(ratioFarX - 0.25) > 0.04
  ) {
    throw new Error(`Test 02 Mouse Parallax 1:0.5:0.25 failed: ${JSON.stringify({ pMoved, ratioMidX, ratioFarX })}`);
  }

  // TEST 04 – Foreground Stability after parallax & drift
  const fgAfter = await page.evaluate(() => {
    const hero = document.querySelector('[data-testid="hero-section"]');
    const h1 = hero?.querySelector('h1')?.getBoundingClientRect();
    const p = hero?.querySelector('p')?.getBoundingClientRect();
    const cta = hero?.querySelector('button')?.getBoundingClientRect();
    return {
      h1: h1 ? { left: h1.left, top: h1.top } : null,
      p: p ? { left: p.left, top: p.top } : null,
      cta: cta ? { left: cta.left, top: cta.top } : null,
    };
  });

  if (
    Math.abs((fgAfter.h1?.left ?? 0) - fgBefore.h1.left) > 0.5 ||
    Math.abs((fgAfter.h1?.top ?? 0) - fgBefore.h1.top) > 0.5 ||
    Math.abs((fgAfter.p?.left ?? 0) - fgBefore.p.left) > 0.5 ||
    Math.abs((fgAfter.cta?.left ?? 0) - fgBefore.cta.left) > 0.5
  ) {
    throw new Error(`Test 04 Foreground Stability failed: ${JSON.stringify({ fgBefore, fgAfter })}`);
  }

  // Capture crisp Hero screenshot with books centered/active
  await page.screenshot({ path: path.join(outDir, 'home-redesign-hero.png'), fullPage: false, animations: 'allow' });

  // TEST 03 – Pointer Leave smoothly resets plane offsets while autonomous float keeps running
  await page.evaluate(() => {
    document.querySelector('[data-testid="hero-section"]')?.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }));
  });
  await page.waitForTimeout(750);
  const planesAfterLeave = await page.evaluate(() =>
    [0, 1, 2].map((i) => getComputedStyle(document.querySelector(`[data-testid="floating-books-bg"] [data-plane="${i}"]`)).transform),
  );
  const pLeft = planesAfterLeave.map(parseMatrixTxTy);
  const driftAfterLeaveA = await readDriftSamples();
  await page.waitForTimeout(900);
  const driftAfterLeaveB = await readDriftSamples();

  if (
    Math.abs(pLeft[0].tx) > 3 ||
    Math.abs(pLeft[0].ty) > 3 ||
    driftAfterLeaveA[0].transform === driftAfterLeaveB[0].transform
  ) {
    throw new Error(`Test 03 Pointer Leave failed: ${JSON.stringify({ pLeft, driftAfterLeaveA, driftAfterLeaveB })}`);
  }

  await context.tracing.stop({ path: path.join(outDir, 'homepage-motion-trace.zip') });

  // TEST 06 – UI Corrections (forbidden eyebrows & removed "Bài test mới nhất")
  const uiTextCheck = await page.evaluate(() => {
    const text = document.body.innerText;
    const forbidden = [
      'Bài test mới nhất',
      'Cập nhật mới nhất',
      'Xem kho 37 đề thi',
      'SHD Education · Tự học Tiếng Đức A1–B2',
      'Phương pháp SHD',
      'Thư viện Online-Test chuẩn khảo thí',
      'Luyện theo từng Teil',
      'Kỹ năng sản sinh ngôn ngữ',
      'Chép chính tả · Diktat & Shadowing',
      'Phân loại trình độ A1 – B2',
      'Không gian học tập cá nhân hóa',
      'Di chuyển chuột để trải nghiệm',
      'Khám phá kho đề thi',
    ];
    const found = forbidden.filter((phrase) => text.toLowerCase().includes(phrase.toLowerCase()));
    const ctaCountInHero = document.querySelectorAll('[data-testid="hero-section"] .shd-fb-content a, [data-testid="hero-section"] .shd-fb-content button').length;
    return { found, ctaCountInHero };
  });

  if (uiTextCheck.found.length > 0 || uiTextCheck.ctaCountInHero !== 1) {
    throw new Error(`Test 06 UI Corrections failed: ${JSON.stringify(uiTextCheck)}`);
  }

  // TEST 07a – Pause/Resume, Hero CTA click, Prefers-Reduced-Motion & Cookie Overlap
  await page.getByTestId('floating-books-motion-toggle').click();
  await page.waitForTimeout(150);
  const pausedState = await page.evaluate(() => {
    const bg = document.querySelector('[data-testid="floating-books-bg"]');
    const drifter = bg?.querySelector('.shd-fb-drift');
    return {
      runningAttr: bg?.getAttribute('data-running'),
      playState: drifter ? getComputedStyle(drifter).animationPlayState : null,
    };
  });
  if (pausedState.runningAttr !== 'false' || pausedState.playState !== 'paused') {
    throw new Error(`Pause control failed: ${JSON.stringify(pausedState)}`);
  }
  await page.getByTestId('floating-books-motion-toggle').click();
  await page.waitForTimeout(150);

  // Test Hero Primary CTA opens AuthModal
  await page.getByRole('button', { name: /Đăng ký miễn phí ngay/i }).click();
  await page.waitForTimeout(150);
  const authDialogVisible = await page.locator('.auth-modal').isVisible();
  if (!authDialogVisible) throw new Error('Hero CTA did not open AuthModal');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);

  // Dismiss cookie banner before fullPage capture
  await page.getByRole('button', { name: 'Đã hiểu' }).click();
  await page.waitForTimeout(150);

  // Scroll page to trigger RevealOnScroll & decode all images cleanly
  const docHeight = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= docHeight; y += 500) {
    await page.evaluate((pos) => window.scrollTo({ top: pos, behavior: 'instant' }), y);
    await page.waitForTimeout(140);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

  const brokenImgs = await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    imgs.forEach((img) => {
      if (img.loading === 'lazy') img.loading = 'eager';
    });
    await Promise.all(
      imgs.map(
        (img) =>
          img.complete ||
          new Promise((resolve) => {
            const timer = setTimeout(resolve, 8000);
            img.addEventListener('load', () => { clearTimeout(timer); resolve(); }, { once: true });
            img.addEventListener('error', () => { clearTimeout(timer); resolve(); }, { once: true });
          }),
      ),
    );
    return imgs.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src);
  });
  if (brokenImgs.length > 0) throw new Error(`Broken images: ${JSON.stringify(brokenImgs)}`);

  // Verify quick filter stays 1-row on Desktop
  const filterSameRow = await page.evaluate(() => {
    const reg = document.querySelector('[aria-label="Bộ lọc bắt đầu ôn tập"]');
    const els = reg ? [...reg.querySelectorAll('select'), reg.querySelector('button')].filter(Boolean) : [];
    const tops = els.map((el) => Math.round(el.getBoundingClientRect().top));
    return tops.length === 5 && new Set(tops).size === 1;
  });
  if (!filterSameRow) throw new Error('HeroQuickFilter wrapped on 1440px desktop');

  await page.screenshot({ path: path.join(outDir, 'home-redesign-full.png'), fullPage: true, animations: 'disabled' });

  // Reduced-motion check
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(200);
  const reducedState = await page.evaluate(() => {
    const toggleEl = document.querySelector('[data-testid="floating-books-motion-toggle"]');
    return {
      running: document.querySelector('[data-testid="floating-books-bg"]')?.getAttribute('data-running'),
      toggleHidden: !toggleEl || getComputedStyle(toggleEl).display === 'none',
    };
  });
  if (reducedState.running !== 'false' || !reducedState.toggleHidden) {
    throw new Error(`prefers-reduced-motion check failed: ${JSON.stringify(reducedState)}`);
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  // Laptop 1280x800 & Tablet 768x1024 responsive checks
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(200);
  const w1280 = await page.evaluate(() => ({ bodyWidth: document.body.scrollWidth, viewportWidth: window.innerWidth }));
  if (w1280.bodyWidth > w1280.viewportWidth) throw new Error(`1280px overflow: ${JSON.stringify(w1280)}`);

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(200);
  const w768 = await page.evaluate(() => ({ bodyWidth: document.body.scrollWidth, viewportWidth: window.innerWidth }));
  if (w768.bodyWidth > w768.viewportWidth) throw new Error(`768px tablet overflow: ${JSON.stringify(w768)}`);

  // Signed-in StudentDashboard check
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => {
    window.localStorage.setItem(
      'shd-demo-user',
      JSON.stringify({ name: 'Nguyễn Minh Anh', email: 'minhanh@example.com', initials: 'MA', plan: 'Free' }),
    );
  });
  await page.reload({ waitUntil: 'networkidle', timeout: 35000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(800);
  const sHeight = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= sHeight; y += 500) {
    await page.evaluate((pos) => window.scrollTo({ top: pos, behavior: 'instant' }), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    await Promise.all(imgs.map((img) => img.complete || new Promise((r) => { const t = setTimeout(r, 6000); img.addEventListener('load', () => { clearTimeout(t); r(); }, { once: true }); })));
  });

  const studentCheck = await page.evaluate(() => ({
    hasGreeting: document.body.innerText.includes('Anh'),
    hasLatestRemoved: !document.body.innerText.includes('Bài test mới nhất'),
    hasRenewalBtn: Boolean(document.querySelector('[data-testid="renewal-trigger-top"]')),
    hasConsultSection: Boolean(document.getElementById('shd-consult')),
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  if (!studentCheck.hasGreeting || !studentCheck.hasLatestRemoved || !studentCheck.hasRenewalBtn || !studentCheck.hasConsultSection || studentCheck.bodyWidth > studentCheck.viewportWidth) {
    throw new Error(`StudentDashboard check failed: ${JSON.stringify(studentCheck)}`);
  }
  await page.screenshot({ path: path.join(outDir, 'home-redesign-student.png'), fullPage: true, animations: 'disabled' });

  // Mobile 375x812 Guest check
  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
  const mRes = await mobile.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 35000 });
  if (!mRes || !mRes.ok()) throw new Error(`Mobile GET / returned ${mRes?.status() ?? 'no response'}`);
  await mobile.evaluate(() => document.fonts?.ready);
  await mobile.waitForTimeout(350);
  const mobileCheck = await mobile.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
    heroVisible: Boolean(document.querySelector('[data-testid="hero-section"] h1')),
    hiddenDepthCount: Array.from(document.querySelectorAll('.shd-fb-book[data-depth="1"], .shd-fb-book[data-depth="2"]')).filter((el) => getComputedStyle(el).display !== 'none').length,
  }));
  if (!mobileCheck.heroVisible || mobileCheck.bodyWidth > mobileCheck.viewportWidth || mobileCheck.hiddenDepthCount > 0) {
    throw new Error(`Mobile check failed: ${JSON.stringify(mobileCheck)}`);
  }
  await mobile.screenshot({ path: path.join(outDir, 'home-redesign-mobile.png'), fullPage: false, animations: 'allow' });

  if (consoleErrors.length > 0 || pageErrors.length > 0 || failedRequests.length > 0) {
    throw new Error(`Runtime errors: ${JSON.stringify({ consoleErrors, pageErrors, failedRequests })}`);
  }

  console.log(JSON.stringify({
    test01_autonomousMotion: {
      t0: driftT0[0].transform,
      t2: driftT2[0].transform,
      t5: driftT5[0].transform,
      allRunning: autonomousChanged,
    },
    test02_mouseParallax: {
      plane0: pMoved[0],
      plane1: pMoved[1],
      plane2: pMoved[2],
      ratioMidX: Number(ratioMidX.toFixed(4)),
      ratioFarX: Number(ratioFarX.toFixed(4)),
    },
    test03_pointerLeave: { planesAfterLeave: pLeft },
    test04_foregroundStability: { fgBefore: fgBefore.h1, fgAfter: fgAfter.h1 },
    test05_heroAlignment: {
      heroCenterX: fgBefore.heroCenterX,
      h1CenterX: fgBefore.h1.centerX,
      pCenterX: fgBefore.p.centerX,
      ctaCenterX: fgBefore.cta.centerX,
    },
    test06_uiCorrections: uiTextCheck,
    test07_responsiveAndA11y: {
      w1440: filterSameRow,
      w1280,
      w768,
      mobileCheck,
      pausedState,
      reducedState,
      brokenImgsCount: brokenImgs.length,
    },
    studentCheck,
    consoleErrors,
    pageErrors,
  }, null, 2));
} finally {
  await browser.close();
}
