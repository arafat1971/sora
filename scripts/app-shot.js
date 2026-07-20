// Screenshot the Expo web app at iPhone size (390x844 @2x).
// Usage: node scripts/app-shot.js <url> <out.png>
const { chromium } = require('playwright-core');

const CHROME =
  process.env.PW_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const [url, out] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  page.on('console', (m) => {
    if (m.type() === 'error') console.log('PAGE ERROR:', m.text().slice(0, 300));
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: out });
  await browser.close();
  console.log('saved', out);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
