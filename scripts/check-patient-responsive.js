/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const languages = ["en", "hi", "bn", "te", "ta", "mr"];
const widths = [320, 390, 768, 1024, 1440];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const failures = [];

  for (const languageIndex of languages.keys()) {
    const language = languages[languageIndex];
    const context = await browser.newContext();
    const page = await context.newPage();

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${baseUrl}/patient`, { waitUntil: "networkidle" });
      await page.locator(".welcome-screen .primary-button").click();
      await page.waitForURL("**/patient/language");
      await page.locator(".language-option").nth(languageIndex).click();
      await page.waitForURL("**/patient/consent");

      const result = await page.evaluate(() => {
        const root = document.documentElement;
        const body = document.body;
        const controls = [...document.querySelectorAll("a, button")];
        return {
          lang: root.lang,
          overflow: root.scrollWidth > root.clientWidth || body.scrollWidth > body.clientWidth,
          clipped: controls.some((element) => element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight),
          smallTouchTarget: controls.some((element) => element.getBoundingClientRect().height < 44),
          unnamedControl: controls.some((element) => !element.getAttribute("aria-label") && !(element.textContent || "").trim()),
        };
      });

        if (result.lang !== language || result.overflow || result.clipped || result.smallTouchTarget || result.unnamedControl) {
        failures.push({ language, width, result });
      }
    }

    await context.close();
  }

  await browser.close();
  if (failures.length > 0) {
    console.error(JSON.stringify(failures, null, 2));
    process.exit(1);
  }
  console.log(`Patient responsive QA passed: ${languages.length} languages x ${widths.length} widths`);
})();
