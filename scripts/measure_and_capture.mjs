import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const WORKSPACE = "C:\\Users\\Editer SHB\\shd-tuhoctiengduc";
const SCREENSHOTS_DIR = path.join(WORKSPACE, "docs", "ux", "screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Start Chrome Headless with Remote Debugging
const chromeProc = spawn(CHROME_PATH, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  `--remote-debugging-port=${PORT}`,
  '--remote-allow-origins=*',
  '--user-data-dir=' + path.join(WORKSPACE, '.chrome-temp-profile')
]);

let devtoolsWsUrl = null;
chromeProc.stderr.on('data', d => {
  const str = d.toString();
  console.log('[Chrome stderr]:', str);
  const match = str.match(/DevTools listening on (ws:\/\/[^\s]+)/);
  if (match) {
    devtoolsWsUrl = match[1];
  }
});

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForWsUrl() {
  for (let i = 0; i < 60; i++) {
    if (devtoolsWsUrl) return devtoolsWsUrl;
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        const data = await res.json();
        return data.webSocketDebuggerUrl;
      }
    } catch (e) {}
    await sleep(200);
  }
  throw new Error("Could not connect to Chrome DevTools port");
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
    });
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : null;
  }

  async setViewport(width, height, isMobile = false) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: isMobile
    });
  }

  async navigate(url) {
    await this.send("Page.navigate", { url });
    await sleep(400);
  }

  async captureScreenshot(filename) {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(res.data, "base64");
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, filename), buffer);
    console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
  }
}

async function run() {
  const wsUrl = await waitForWsUrl();
  console.log("Connected to Chrome:", wsUrl);

  // Create new target tab
  const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new`, { method: 'PUT' });
  const tabData = await newTabRes.json();
  const cdp = new CDPClient(tabData.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send("Page.enable");
  await cdp.send("DOM.enable");

  const results = {
    measurements: [],
    sub44TouchTargets: []
  };

  const tasks = [
    // 1. Index
    {
      page: "index.html",
      name: "index",
      url: `file:///${WORKSPACE.replace(/\\/g, '/')}/wireframes/index.html`,
      scenarios: [
        { label: "default", setup: "" }
      ]
    },
    // 2. Catalog
    {
      page: "catalog.html",
      name: "catalog",
      url: `file:///${WORKSPACE.replace(/\\/g, '/')}/wireframes/catalog.html`,
      scenarios: [
        { label: "filtered", setup: "setFilter('level', 'b1', document.querySelector('[data-val=\"b1\"]'))" },
        { label: "empty", setup: "simulateEmptyState()" }
      ]
    },
    // 3. Exam Room
    {
      page: "exam-room.html",
      name: "exam_room",
      url: `file:///${WORKSPACE.replace(/\\/g, '/')}/wireframes/exam-room.html`,
      scenarios: [
        { label: "lesen", setup: "switchSkill('lesen')" },
        { label: "hoeren", setup: "switchSkill('hoeren')" },
        { label: "offline", setup: "toggleOffline()" },
        { label: "audio_error", setup: "triggerAudioError()" },
        { label: "timeout", setup: "document.getElementById('exam-timer').classList.add('warning'); document.getElementById('exam-timer').innerHTML = '⏱ 00:00';" },
        { label: "submit_modal", setup: "openSubmitModal()" }
      ]
    },
    // 4. Result & Gate
    {
      page: "result-and-gate.html",
      name: "result",
      url: `file:///${WORKSPACE.replace(/\\/g, '/')}/wireframes/result-and-gate.html`,
      scenarios: [
        { label: "overview", setup: "" },
        { label: "gate_step1", setup: "openLeadGate(); goToStep1();" },
        { label: "gate_under18_form", setup: "openUnder18Form();" },
        { label: "gate_under18_pending", setup: "openUnder18Pending();" },
        { label: "gate_under18_parent_approval", setup: "openParentConfirmationView();" },
        { label: "gate_under18", setup: "openUnder18Form();" },
        { label: "parent_approval", setup: "openParentConfirmationView();" },
        { label: "gate_step2_otp", setup: "openLeadGate(); goToStep2();" },
        { label: "gate_step3_success", setup: "openLeadGate(); goToStep3();" }
      ]
    }
  ];

  for (const t of tasks) {
    for (const sc of t.scenarios) {
      // Test at 375px (Mobile)
      await cdp.setViewport(375, 812, true);
      await cdp.navigate(t.url);
      if (sc.setup) {
        await cdp.evaluate(sc.setup);
        await sleep(250);
      }

      // Measure scrollWidth vs clientWidth
      const metrics375 = await cdp.evaluate(`
        ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
        })
      `);

      // Touch target measurement on 375px
      const smallTargets = await cdp.evaluate(`
        (() => {
          const els = Array.from(document.querySelectorAll('button, a, input, select, .filter-pill, .palette-btn, .flag-toggle, .option-label, .pill-radio-label'));
          const bad = [];
          for (const el of els) {
            // Check if element is visible
            if (el.offsetParent === null && el.offsetWidth === 0 && el.offsetHeight === 0) continue;
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') continue;
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              if (rect.width < 44 || rect.height < 44) {
                bad.push({
                  tag: el.tagName.toLowerCase(),
                  id: el.id,
                  cls: el.className,
                  text: (el.innerText || el.value || '').trim().slice(0, 30),
                  width: Math.round(rect.width),
                  height: Math.round(rect.height)
                });
              }
            }
          }
          return bad;
        })()
      `);

      results.measurements.push({
        page: t.page,
        scenario: sc.label,
        viewport: "375px",
        scrollWidth: metrics375.scrollWidth,
        clientWidth: metrics375.clientWidth,
        pass: metrics375.scrollWidth <= metrics375.clientWidth
      });

      if (smallTargets && smallTargets.length > 0) {
        results.sub44TouchTargets.push({
          page: t.page,
          scenario: sc.label,
          targets: smallTargets
        });
      }

      // Screenshot 375px
      const fname375 = `${t.name}_375px_${sc.label}.png`;
      await cdp.captureScreenshot(fname375);

      // Test at 1280px (Desktop)
      await cdp.setViewport(1280, 800, false);
      await cdp.navigate(t.url);
      if (sc.setup) {
        await cdp.evaluate(sc.setup);
        await sleep(250);
      }

      const metrics1280 = await cdp.evaluate(`
        ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
        })
      `);

      results.measurements.push({
        page: t.page,
        scenario: sc.label,
        viewport: "1280px",
        scrollWidth: metrics1280.scrollWidth,
        clientWidth: metrics1280.clientWidth,
        pass: metrics1280.scrollWidth <= metrics1280.clientWidth
      });

      // Screenshot 1280px
      const fname1280 = `${t.name}_1280px_${sc.label}.png`;
      await cdp.captureScreenshot(fname1280);
    }
  }

  fs.writeFileSync(path.join(WORKSPACE, "docs", "ux", "audit_results.json"), JSON.stringify(results, null, 2));
  console.log("Audit completed successfully. Results written to docs/ux/audit_results.json");

  // Shutdown Chrome
  chromeProc.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  chromeProc.kill();
  process.exit(1);
});

