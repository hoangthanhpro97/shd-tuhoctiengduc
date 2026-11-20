import { chromium } from 'playwright';

const baseUrl = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:3018';
const expectedAnchors = ['#osd-skill-catalog', '#b1', '#b2', '#a1', '#a2'];
const browser = await chromium.launch({ headless: true });
try {
  for (const route of ['/luyen-nghe/osd', '/luyen-doc/osd']) {
    const page = await browser.newPage();
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    if (!response || !response.ok()) throw new Error(`${route} returned ${response?.status() ?? 'no response'}.`);
    const anchors = await page.locator('a[href^="#"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')).filter(Boolean));
    if (!expectedAnchors.every((anchor) => anchors.includes(anchor))) throw new Error(`${route} missing anchors: ${JSON.stringify(anchors)}.`);
    const detailHref = await page.locator('#b1 a[href^="/luyen-"]').first().getAttribute('href');
    if (!detailHref) throw new Error(`${route} has no B1 detail link.`);
    const detailResponse = await page.request.get(`${baseUrl}${detailHref}`);
    if (!detailResponse.ok()) throw new Error(`${route} detail ${detailHref} returned ${detailResponse.status()}.`);
    await page.locator('main > header button[aria-haspopup="dialog"]').click();
    if (!(await page.locator('[role="dialog"]').isVisible())) throw new Error(`${route} CTA did not open AuthModal.`);
    console.log(JSON.stringify({ route, anchors, detailHref, detailStatus: detailResponse.status(), modal: true }));
    await page.close();
  }
} finally {
  await browser.close();
}
