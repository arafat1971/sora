// Screenshot a .dc.html design reference, serving its unpkg React/Babel
// dependencies from locally packed copies (see scripts/README.md).
// Usage: node scripts/ref-shot.js <url> <out.png> [buttonTextToClick]
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const CHROME =
  process.env.PW_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const LIBS = path.join(__dirname, 'libs');
const LOCAL = {
  'react.production.min.js': 'react-18.3.1.tgz/umd/react.production.min.js',
  'react-dom.production.min.js': 'react-dom-18.3.1.tgz/umd/react-dom.production.min.js',
  'babel.min.js': 'babel-standalone-7.29.0.tgz/babel.min.js',
};

(async () => {
  const [url, out, buttonText] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage({
    viewport: { width: 520, height: 1100 },
    deviceScaleFactor: 2,
  });
  await page.route('**unpkg.com/**', (route) => {
    const u = route.request().url();
    const hit = Object.keys(LOCAL).find((k) => u.endsWith(k));
    if (hit) {
      route.fulfill({
        body: fs.readFileSync(path.join(LIBS, LOCAL[hit]), 'utf8'),
        contentType: 'application/javascript',
      });
    } else {
      route.abort();
    }
  });
  page.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 200)));
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(9000);
  if (buttonText) {
    for (const b of await page.$$('button')) {
      const t = ((await b.textContent()) || '').trim();
      if (t.toLowerCase() === buttonText.toLowerCase()) {
        await b.click().catch(() => {});
        break;
      }
    }
    await page.waitForTimeout(2500);
  }
  // Screenshot the ~390-402px phone frame around the first screen, else viewport.
  const label = await page.$('[data-screen-label]');
  let target = null;
  if (label) {
    const h = await label.evaluateHandle((n) => {
      let p = n;
      while (p.parentElement) {
        const r = p.getBoundingClientRect();
        if (r.width > 380 && r.width < 460) break;
        p = p.parentElement;
      }
      return p;
    });
    target = h.asElement();
  }
  if (target) await target.screenshot({ path: out });
  else await page.screenshot({ path: out });
  await browser.close();
  console.log('saved', out);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
