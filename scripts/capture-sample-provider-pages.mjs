import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = 3097;
const baseUrl = `http://localhost:${port}`;
const screenshotDir = path.join(root, 'screenshots', 'desktop');
const artifactDir = 'C:\\Users\\Editer SHB\\.gemini\\antigravity\\brain\\80235b60-8480-4532-87dd-8c78b2b5ba72';

fs.mkdirSync(screenshotDir, { recursive: true });

console.log('Starting Next server on port', port);
const nextProc = spawn('npx', ['next', 'start', '-p', String(port)], {
  cwd: path.join(root, 'apps', 'web'),
  shell: true,
  stdio: 'inherit',
});

async function waitForServer(url, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // wait
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server did not start at ${url} within ${timeoutMs}ms`);
}

async function ensureAllImagesLoaded(page) {
  await page.evaluate(async () => {
    const scrollStep = 400;
    const totalHeight = document.body.scrollHeight;
    for (let pos = 0; pos < totalHeight; pos += scrollStep) {
      window.scrollTo({ top: pos, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });

    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            setTimeout(resolve, 5000);
          }),
      ),
    );
  });
  await page.waitForTimeout(800);
}

async function capturePage(page, route, filename) {
  const targetUrl = `${baseUrl}${route}`;
  console.log(`Navigating to ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.evaluate(() => document.fonts?.ready);
  await ensureAllImagesLoaded(page);

  const filePath = path.join(screenshotDir, filename);
  await page.screenshot({ path: filePath, fullPage: true });
  fs.copyFileSync(filePath, path.join(artifactDir, filename));
  console.log('Saved screenshot:', filePath);
}

async function run() {
  try {
    await waitForServer(`${baseUrl}/api/healthz`);
    console.log('Server is healthy! Launching browser...');

    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

      await capturePage(page, '/bai-mau/osd', 'bai-mau-osd-redesign.png');
      await capturePage(page, '/bai-mau/goethe', 'bai-mau-goethe-redesign.png');
      await capturePage(page, '/de-thi', 'de-thi-book-sets-redesign.png');

      // Capture Homepage HeroQuickFilter region & dropdown check
      console.log(`Navigating to ${baseUrl}/...`);
      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.evaluate(() => document.fonts?.ready);
      await ensureAllImagesLoaded(page);
      const region = page.getByRole('region', { name: 'Bộ lọc bắt đầu ôn tập' });
      await region.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const layoutInfo = await page.evaluate(() => {
        const reg = document.querySelector('[aria-label="Bộ lọc bắt đầu ôn tập"]');
        if (!reg) return null;
        const selects = Array.from(reg.querySelectorAll('select'));
        const btn = reg.querySelector('button');
        const examSelect = document.getElementById('hero-exam-month');
        const tops = [...selects, btn].filter(Boolean).map((el) => Math.round(el.getBoundingClientRect().top));
        return {
          tops,
          allSameRow: new Set(tops).size === 1,
          selectIds: selects.map((s) => s.id),
          examOptions: examSelect ? Array.from(examSelect.querySelectorAll('option')).map((o) => o.textContent) : [],
          buttonText: btn?.textContent?.trim(),
          hasExploreLink: Boolean(reg.querySelector('a')),
        };
      });
      console.log('HeroQuickFilter 1440px check:', JSON.stringify(layoutInfo));
      const quickFilterPath = path.join(screenshotDir, 'home-quick-filter-updated.png');
      await region.screenshot({ path: quickFilterPath });
      fs.copyFileSync(quickFilterPath, path.join(artifactDir, 'home-quick-filter-updated.png'));
      const fullHomePath = path.join(screenshotDir, 'home-updated.png');
      await page.screenshot({ path: fullHomePath, fullPage: true });
      fs.copyFileSync(fullHomePath, path.join(artifactDir, 'home-updated.png'));
      console.log('Saved homepage & quick-filter screenshots.');

      console.log('SUCCESS! All screenshots captured.');
    } finally {
      await browser.close();
    }
  } finally {
    console.log('Stopping server process...');
    nextProc.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
