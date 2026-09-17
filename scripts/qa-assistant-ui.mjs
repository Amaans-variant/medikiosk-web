// QA: patient assistant UI (real browser). Usage: node scripts/qa-assistant-ui.mjs
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

// 1. Fresh patient session → welcome screen
await page.goto(`${BASE}/patient`, { waitUntil: "networkidle" });
await page.waitForSelector(".patient-app", { timeout: 20000 });
check("welcome renders", (await page.locator(".patient-app").count()) > 0);

// 2. Open assistant from header
await page.getByRole("button", { name: "Assistant" }).click();
await page.waitForURL("**/patient/assistant", { timeout: 10000 });
check("assistant route opens", await page.locator(".assistant-page").isVisible());
check("identity shows", await page.locator(".assistant-avatar").isVisible());

// 3. Send a message with red-flag content
await page.locator(".assistant-input").fill("I have severe chest pain and shortness of breath");
await page.getByRole("button", { name: "Send" }).click();
await page.waitForSelector(".assistant-message--assistant .assistant-bubble", { timeout: 20000 });
check("assistant reply rendered", true);

const safetyVisible = await page.locator(".assistant-safety").isVisible();
check("safety alert shown for chest pain", safetyVisible);
check(
  "citations shown",
  (await page.locator(".assistant-citations li").count()) > 0,
  `count=${await page.locator(".assistant-citations li").count()}`
);

// 4. Persistence: reload → both turns still present
await page.reload({ waitUntil: "networkidle" });
await page.waitForFunction(
  () => document.querySelectorAll(".assistant-message").length >= 2 || document.querySelector(".assistant-error"),
  null,
  { timeout: 30000 }
).catch(() => {});
const patientMsgs = await page.locator(".assistant-message--patient").count();
const assistantMsgs = await page.locator(".assistant-message--assistant").count();
check("history persisted after reload", patientMsgs >= 1 && assistantMsgs >= 1, `patient=${patientMsgs} assistant=${assistantMsgs}`);
await page.screenshot({ path: "screenshots/assistant-qa-chat.png", fullPage: false });

// 5. Ayurveda question → AYU citation chip
await page.locator(".assistant-input").fill("What is dashavidha pariksha in Ayurveda?");
await page.getByRole("button", { name: "Send" }).click();
await page.waitForFunction(
  () => document.querySelectorAll(".assistant-citations__corpus--ayurveda").length > 0,
  null,
  { timeout: 20000 }
).catch(() => {});
check(
  "ayurveda corpus chip rendered",
  (await page.locator(".assistant-citations__corpus--ayurveda").count()) > 0
);

// 6. Multilingual UI strings (Hindi)
await page.getByRole("button", { name: /हिंदी|Choose your language/ }).first().click();
await page.waitForURL("**/patient/language", { timeout: 10000 });
await page.getByRole("button", { name: /हिंदी/ }).last().click();
await page.waitForURL(/\/patient(?!\/language)/, { timeout: 15000 });
await page.getByRole("button", { name: "सहायक" }).click();
await page.waitForURL("**/patient/assistant", { timeout: 10000 });
check(
  "assistant UI in Hindi",
  (await page.locator(".assistant-page").textContent() || "").includes("स्वास्थ्य सहायक")
);
// History from this session should hydrate in the Hindi view as well.
await page.waitForSelector(".assistant-message--assistant", { timeout: 20000 }).catch(() => {});

check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));

await page.screenshot({ path: "screenshots/assistant-qa.png", fullPage: false });
await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
