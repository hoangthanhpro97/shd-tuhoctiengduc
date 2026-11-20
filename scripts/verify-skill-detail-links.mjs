import { chromium } from 'playwright';

const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:3018';
const browser = await chromium.launch({ headless: true });
try {
  for (const route of ['/luyen-doc', '/luyen-nghe']) {
    const page = await browser.newPage();
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    if (!response || !response.ok()) throw new Error(`${route} returned ${response?.status() ?? 'no response'}.`);
    const links = new Set();
    const collectLinks = async () => {
      for (const href of await page.locator(`main section a[href^="${route}/"]`).evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')).filter(Boolean))) links.add(href);
    };
    await collectLinks();
    const pagination = page.locator(`nav[aria-label*="${route === '/luyen-doc' ? 'đọc' : 'nghe'}"] button`);
    const pageTwo = pagination.filter({ hasText: '2' });
    if (await pageTwo.count()) {
      await pageTwo.click();
      await page.waitForTimeout(50);
      await collectLinks();
    }
    const failures = [];
    for (const href of links) {
      const detail = await page.request.get(`${baseUrl}${href}`);
      if (!detail.ok()) failures.push({ href, status: detail.status() });
    }
    if (failures.length) throw new Error(`${route} detail link failures: ${JSON.stringify(failures)}.`);
    console.log(JSON.stringify({ route, detailLinks: links.size, failures }));
    await page.close();
  }
} finally {
  await browser.close();
}
