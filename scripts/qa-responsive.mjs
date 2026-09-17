import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const viewports = [
  { name: "small-phone", width: 320, height: 568 },
  { name: "android-phone", width: 360, height: 800 },
  { name: "modern-phone", width: 390, height: 844 },
  { name: "large-phone", width: 414, height: 896 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "large-laptop", width: 1440, height: 900 },
];
const routes = ["/patient", "/doctor/login", "/hospital/login"];

const browser = await chromium.launch({ headless: true });
let failed = false;
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    for (const route of routes) {
      await page.goto(base + route, { waitUntil: "networkidle" });
      const result = await page.evaluate(() => {
        const root = document.documentElement;
        const overflow = root.scrollWidth > root.clientWidth + 1;
        const badControls = [...document.querySelectorAll("button,a,input,select,textarea")]
          .filter((element) => {
            const r = element.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return false;
            return r.width < 40 || r.height < 40;
          })
          .map((element) => ({
            tag: element.tagName,
            label: element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 40) || "unnamed",
            width: Math.round(element.getBoundingClientRect().width),
            height: Math.round(element.getBoundingClientRect().height),
          }));
        const clipped = [...document.querySelectorAll("main,header,section,article,form")]
          .filter((element) => {
            const r = element.getBoundingClientRect();
            return r.left < -1 || r.right > window.innerWidth + 1;
          })
          .map((element) => element.className || element.tagName)
          .slice(0, 8);
        return { overflow, badControls, clipped };
      });
      if (result.overflow || result.badControls.length || result.clipped.length) {
        console.error(`FAIL responsive ${route} @ ${viewport.name} ${viewport.width}x${viewport.height}`, result);
        failed = true;
      } else {
        console.log(`PASS responsive ${route} @ ${viewport.name} ${viewport.width}x${viewport.height}`);
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}
if (failed) process.exit(1);
