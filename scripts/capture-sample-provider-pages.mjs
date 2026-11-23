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

console.log('Starting Next dev server on port', port);
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
  // Scroll down smoothly to trigger lazy loading of all images
  await page.evaluate(async () => {
    const scrollStep = 400;
    const totalHeight = document.body.scrollHeight;
    for (let pos = 0; pos < totalHeight; pos += scrollStep) {
      window.scrollTo(0, pos);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);

    // Wait for all img elements to complete loading
    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            setTimeout(resolve, 5000); // safety fallback
          }),
      ),
    );
  });
  await page.waitForTimeout(1000);
}

async function run() {
  try {
    await waitForServer(`${baseUrl}/api/healthz`);
    console.log('Server is healthy! Launching browser...');

    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

      // 1. Capture /bai-mau/osd
      const osdUrl = `${baseUrl}/bai-mau/osd`;
      console.log(`Navigating to ${osdUrl}...`);
      await page.goto(osdUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.evaluate(() => document.fonts?.ready);
      await ensureAllImagesLoaded(page);

      const osdPath = path.join(screenshotDir, 'bai-mau-osd-redesign.png');
      await page.screenshot({ path: osdPath, fullPage: true });
      fs.copyFileSync(osdPath, path.join(artifactDir, 'bai-mau-osd-redesign.png'));
      console.log('Saved ÖSD screenshot:', osdPath);

      // 2. Capture /bai-mau/goethe
      const goetheUrl = `${baseUrl}/bai-mau/goethe`;
      console.log(`Navigating to ${goetheUrl}...`);
      await page.goto(goetheUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.evaluate(() => document.fonts?.ready);
      await ensureAllImagesLoaded(page);

      const goethePath = path.join(screenshotDir, 'bai-mau-goethe-redesign.png');
      await page.screenshot({ path: goethePath, fullPage: true });
      fs.copyFileSync(goethePath, path.join(artifactDir, 'bai-mau-goethe-redesign.png'));
      console.log('Saved Goethe screenshot:', goethePath);

      console.log('SUCCESS! Both screenshots captured.');
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
