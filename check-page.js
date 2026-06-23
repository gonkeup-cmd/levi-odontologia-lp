const { chromium } = require('playwright');
const path = require('path');

const PROJECT_DIR = 'C:\\Users\\kborg\\webdesign-test';
const TARGET_URL = 'file:///' + path.join(PROJECT_DIR, 'index.html').replace(/\\/g, '/');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(TARGET_URL, { waitUntil: 'load' });
  await page.waitForTimeout(800);

  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < bodyHeight; y += 600) {
    await page.evaluate((py) => window.scrollTo(0, py), y);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  await page.screenshot({ path: path.join(PROJECT_DIR, 'screenshot-desktop.png'), fullPage: true });
  console.log('Desktop screenshot saved');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(PROJECT_DIR, 'screenshot-mobile.png'), fullPage: true });
  console.log('Mobile screenshot saved');

  console.log('Console errors:', JSON.stringify(consoleErrors));

  await browser.close();
})();
