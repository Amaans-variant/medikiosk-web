/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright');

const widths = [320, 390, 768, 1024, 1440];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });

    const overflow = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      hasBodyOverflow: document.body.scrollWidth > window.innerWidth,
    }));

    const text = await page.locator('body').innerText();
    const a11y = {
      width,
      hasMediKiosk: /MediKiosk/i.test(text),
      hasPatientKiosk: /Patient Kiosk/i.test(text),
      hasDoctorConsole: /Doctor Console/i.test(text),
      overflow,
    };

    console.log(JSON.stringify(a11y));
  }

  await browser.close();
})();
