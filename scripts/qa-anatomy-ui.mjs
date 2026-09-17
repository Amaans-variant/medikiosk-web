// QA: anatomy body diagram (real browser). Usage: node scripts/qa-anatomy-ui.mjs
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}${detail ? ` (${detail})` : ""}`);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));

// Walk the flow: welcome → language (English) → consent → start → complaint → anatomy
await page.goto(`${BASE}/patient`, { waitUntil: "networkidle" });
await page.locator(".welcome-screen .primary-button").click();
await page.waitForURL("**/patient/language");
await page.locator(".language-option").nth(0).click();
await page.waitForURL("**/patient/consent");
await page.locator(".primary-button").click();
await page.waitForURL("**/patient/start");
await page.locator(".primary-button").click();
await page.waitForURL("**/patient/complaint");
await page.locator("textarea").fill("Dull ache in the middle of my chest for two days.");
await page.locator(".primary-button").click();
await page.waitForURL("**/patient/anatomy");
check("anatomy renders", await page.locator(".body-figure-svg").isVisible());

// 1. Select chest on the figure
await page.locator('.body-part[aria-label="Chest"]').click();
check("chest selected on figure", (await page.locator('.body-part[aria-label="Chest"]').getAttribute("aria-pressed")) === "true");
check("subregion chips appear", (await page.locator(".anatomy-subregion").count()) >= 2, `count=${await page.locator(".anatomy-subregion").count()}`);

// 2. Pick a subregion
await page.locator(".anatomy-subregion").filter({ hasText: "Middle" }).click();
const selectedChip = page.locator(".anatomy-subregion--selected");
check("subregion selected", (await selectedChip.count()) === 1, await selectedChip.first().textContent());

// 3. Back view exposes the back region
await page.locator(".body-view-toggle__button").filter({ hasText: "Back" }).click();
const backInBackView = page.locator('.body-part[aria-label="Back"]');
check("back region in back view", await backInBackView.isVisible());
await backInBackView.click();
check("back selected", await backInBackView.getAttribute("aria-pressed") === "true");

// 4. Region persisted to the server session
const session = await page.evaluate(async () => {
  const res = await fetch("/api/patient/session");
  return res.ok ? (await res.json()).session : null;
});
check("region persisted to session", session?.bodyRegion === "back", JSON.stringify({ bodyRegion: session?.bodyRegion, bodySubregion: session?.bodySubregion }));

// 5. Toggle chest back on in front view
await page.locator(".body-view-toggle__button").filter({ hasText: "Front" }).click();
await page.locator('.body-part[aria-label="Chest"]').click();
check("chest re-selected in front view", (await page.locator('.body-part[aria-label="Chest"]').getAttribute("aria-pressed")) === "true");

check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));

await page.screenshot({ path: "screenshots/anatomy-qa.png", fullPage: false });
await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
