import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:3025';
const outDir = path.join(root, 'screenshots', 'desktop');

await fs.mkdir(outDir, { recursive: true });

async function ensureOk(page, route) {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
  if (!response || !response.ok()) {
    throw new Error(`GET ${route} returned ${response?.status() ?? 'no response'}`);
  }
  await page.evaluate(() => document.fonts?.ready);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });

  // 1. /de-thi/goethe
  await ensureOk(page, '/de-thi/goethe');
  const goetheHubState = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent?.replace(/\s+/gu, ' ').trim(),
    b1Books: document.querySelectorAll('#b1 a[href^="/de-thi/goethe-b1-tap-"]').length,
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  if (!goetheHubState.h1?.includes('Goethe') || goetheHubState.b1Books < 3 || goetheHubState.bodyWidth > goetheHubState.viewportWidth) {
    throw new Error(`Unexpected /de-thi/goethe state: ${JSON.stringify(goetheHubState)}`);
  }
  await page.screenshot({ path: path.join(outDir, 'goethe-b1-bookshelf-synced.png'), fullPage: true, animations: 'disabled' });

  // 2. /de-thi main catalog
  await ensureOk(page, '/de-thi');
  const catalogState = await page.evaluate(() => ({
    osdB1: document.querySelectorAll('#osd-b1 a.group').length,
    osdB2: document.querySelectorAll('#osd-b2 a.group').length,
    goetheB1: document.querySelectorAll('#goethe-b1 a[href^="/de-thi/goethe-b1-tap-"]').length,
    goetheMore: document.querySelector('a[href="/de-thi/goethe"]')?.getAttribute('href'),
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  if (catalogState.osdB1 !== 4 || catalogState.osdB2 !== 3 || catalogState.goetheB1 < 3 || catalogState.goetheMore !== '/de-thi/goethe') {
    throw new Error(`Unexpected /de-thi state: ${JSON.stringify(catalogState)}`);
  }
  await page.screenshot({ path: path.join(outDir, 'de-thi-goethe-catalog.png'), fullPage: true, animations: 'disabled' });

  // 3. /de-thi/goethe-b1-tap-1 detail view
  await ensureOk(page, '/de-thi/goethe-b1-tap-1');
  const detailState = await page.evaluate(() => ({
    title: document.querySelector('h1')?.textContent?.trim(),
    tabs: document.querySelectorAll('nav[aria-label="Chọn bộ đề Goethe"] a').length,
    buttons: document.querySelectorAll('button').length,
    text: document.body.innerText.includes('Goethe-Zertifikat B1'),
  }));
  if (!detailState.text || detailState.tabs < 3) {
    throw new Error(`Unexpected /de-thi/goethe-b1-tap-1 state: ${JSON.stringify(detailState)}`);
  }
  await page.screenshot({ path: path.join(outDir, 'goethe-b1-detail.png'), fullPage: true, animations: 'disabled' });

  // 4. Launch Goethe B1 Test 01 Lesen room via UI POST /api/v1/attempts
  const lesenAttempt = await page.evaluate(async () => {
    const res = await fetch('/api/v1/attempts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug: 'goethe-b1-test-01', mode: 'exam', sectionFilter: 'lesen' }),
    });
    return { ok: res.ok, body: await res.json() };
  });
  if (!lesenAttempt.ok || !lesenAttempt.body?.attemptId) {
    throw new Error(`Failed creating Lesen attempt: ${JSON.stringify(lesenAttempt)}`);
  }
  await ensureOk(page, `/lam-bai/${lesenAttempt.body.attemptId}`);
  await page.waitForFunction(() => document.body.innerText.includes('Teil 1') || document.body.innerText.includes('Goethe'));
  const lesenState = await page.evaluate(() => ({
    snippet: document.body.innerText.replace(/\s+/gu, ' ').slice(0, 400),
    hasGoethe: document.body.innerText.includes('Goethe'),
    sectionCountButtons: document.querySelectorAll('button').length,
  }));
  if (!lesenState.hasGoethe) {
    throw new Error(`Unexpected Lesen header state: ${JSON.stringify(lesenState)}`);
  }
  await page.screenshot({ path: path.join(outDir, 'goethe-b1-test01-lesen.png'), fullPage: false, animations: 'disabled' });

  // Verify Lesen Teil 3 matrix renders option "0" alongside A..J
  await page.locator('button[aria-label="Mở Teil 3"]').click();
  await page.waitForSelector('button[aria-label*="Aufgabe 13"]');
  const teil3HasZeroOption = await page.evaluate(() => {
    const hasZero = Boolean(document.querySelector('button[aria-label="Aufgabe 13, Anzeige 0"]'));
    const hasA = Boolean(document.querySelector('button[aria-label="Aufgabe 13, Anzeige A"], button[aria-label="Aufgabe 13, Anzeige a"]'));
    return hasZero && hasA;
  });
  if (!teil3HasZeroOption) {
    throw new Error('Expected Goethe Lesen Teil 3 matrix to contain both Anzeige A and Anzeige 0.');
  }

  // 5. Launch Goethe B1 Test 01 Hoeren room (Exam Mode) & verify audio loading
  const hoerenAttempt = await page.evaluate(async () => {
    const res = await fetch('/api/v1/attempts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug: 'goethe-b1-test-01', mode: 'exam', sectionFilter: 'hoeren' }),
    });
    return { ok: res.ok, body: await res.json() };
  });
  if (!hoerenAttempt.ok || !hoerenAttempt.body?.attemptId) {
    throw new Error(`Failed creating Hoeren attempt: ${JSON.stringify(hoerenAttempt)}`);
  }
  await ensureOk(page, `/lam-bai/${hoerenAttempt.body.attemptId}`);
  await page.waitForFunction(() => Boolean(document.querySelector('audio')?.getAttribute('src')));
  const hoerenState = await page.evaluate(() => {
    const audioEl = document.querySelector('audio');
    return {
      audioSrc: audioEl?.getAttribute('src') ?? null,
      hasTranscriptDisabledNote: document.body.innerText.includes('Chế độ thi'),
      snippet: document.body.innerText.replace(/\s+/gu, ' ').slice(0, 400),
    };
  });
  await page.screenshot({ path: path.join(outDir, 'goethe-b1-test01-hoeren.png'), fullPage: false, animations: 'disabled' });

  // Also check /de-thi/goethe-b1-tap-1/de-va-dap-an?skill=hoeren and /giai-thich
  await ensureOk(page, '/de-thi/goethe-b1-tap-1/de-va-dap-an?skill=hoeren');
  const fullKeyState = await page.evaluate(() => ({
    title: document.querySelector('h1')?.textContent?.trim(),
    hasTranscript: /transcript/iu.test(document.body.textContent ?? ''),
  }));
  if (!fullKeyState.title?.includes('Goethe-Zertifikat B1') || !fullKeyState.hasTranscript) {
    throw new Error(`Unexpected full-key Hoeren state: ${JSON.stringify(fullKeyState)}`);
  }

  await ensureOk(page, '/de-thi/goethe-b1-tap-1/giai-thich?skill=lesen');
  const explState = await page.evaluate(() => ({
    snippet: document.body.innerText.replace(/\s+/gu, ' ').slice(0, 250),
    text: document.body.innerText.includes('Goethe'),
  }));
  if (!explState.text) {
    throw new Error(`Unexpected explanation room header: ${JSON.stringify(explState)}`);
  }

  const audioProbe = await page.evaluate(async () => {
    const res = await fetch('/audio/goethe-b1/test-01-teil-1.mp3', { method: 'HEAD' });
    return { status: res.status, ok: res.ok };
  });
  if (!audioProbe.ok) {
    throw new Error(`Audio file failed HTTP probe: ${JSON.stringify(audioProbe)}`);
  }

  // 6. Skill hubs /luyen-doc/goethe & /luyen-nghe/goethe & mobile /de-thi/goethe
  await ensureOk(page, '/luyen-doc/goethe');
  await page.screenshot({ path: path.join(outDir, 'goethe-skill-luyen-doc.png'), fullPage: true, animations: 'disabled' });
  await ensureOk(page, '/luyen-nghe/goethe');
  await page.screenshot({ path: path.join(outDir, 'goethe-skill-luyen-nghe.png'), fullPage: true, animations: 'disabled' });

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
  await ensureOk(mobile, '/de-thi/goethe');
  const mobileState = await mobile.evaluate(() => ({ bodyWidth: document.body.scrollWidth, viewportWidth: window.innerWidth }));
  if (mobileState.bodyWidth > mobileState.viewportWidth) {
    throw new Error(`Mobile /de-thi/goethe overflows: ${JSON.stringify(mobileState)}`);
  }

  console.log(JSON.stringify({ goetheHubState, catalogState, detailState, lesenState, hoerenState, mobileState }));
} finally {
  await browser.close();
}
