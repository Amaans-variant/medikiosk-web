// Multiple-complaints end-to-end (browser).
//
// Verifies the full "multiple complaints work" release path:
//   patient kiosk: chief complaint (SEVERE) → anatomy → ADD a second symptom
//   (VERY_SEVERE, head) → interview → documents → submit
//   → both complaints persisted (position 1 + 2)
//   → doctor console: queue shows "+1 more", case page lists the chief
//     complaint AND the "Other complaints" entry
//   → safety signals computed across ALL complaints.
//
// Run: node scripts/e2e-multi-complaint.mjs   (dev server on :3000, DB configured)

import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const CHIEF = "Sharp pain behind my left eye, worse in the morning. I fell on my head two days ago.";
const EXTRA = "Dizziness and nausea since the fall, worse when I stand up.";

let passed = 0;
let failed = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}${detail ? ` (${detail})` : ""}`);
  if (ok) passed += 1;
  else failed += 1;
}

async function waitHydrated(page, timeoutMs = 20000) {
  await page.waitForFunction(
    () => {
      const el = document.querySelector("input");
      return Boolean(el && el._valueTracker);
    },
    null,
    { timeout: timeoutMs }
  );
}

const browser = await chromium.launch();
const errors = [];
const patientCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const patient = await patientCtx.newPage();
patient.on("console", (msg) => {
  if (msg.type() === "error" && !/404|WebSocket/i.test(msg.text())) errors.push(`[patient] ${msg.text().slice(0, 160)}`);
});
patient.on("pageerror", (err) => errors.push(`[patient] ${String(err).slice(0, 160)}`));

try {
  // ── 1. Patient kiosk: chief complaint + extra symptom ──────────────────
  await patient.goto(`${BASE}/patient`, { waitUntil: "domcontentloaded" });
  // The welcome screen has no inputs; a pre-hydration click does nothing,
  // so click with retries until the navigation lands.
  let navigated = false;
  for (let attempt = 0; attempt < 8 && !navigated; attempt++) {
    await patient.locator(".welcome-screen .primary-button").first().click().catch(() => {});
    navigated = await patient
      .waitForURL("**/patient/language", { timeout: 4000 })
      .then(() => true)
      .catch(() => false);
    if (!navigated) await patient.waitForTimeout(500);
  }
  if (!navigated) throw new Error("welcome click never navigated (hydration)");
  await patient.locator(".language-option").nth(0).click();
  await patient.waitForURL("**/patient/consent");
  await patient.locator(".primary-button").click();
  await patient.waitForURL("**/patient/start");
  await patient.locator(".primary-button").click();
  await patient.waitForURL("**/patient/complaint");

  await patient.locator("textarea").fill(CHIEF);
  // Chief-complaint severity: SEVERE (scoped to the page's severity group).
  const chiefSeverity = patient.getByRole("group", { name: "How severe is it?" });
  await chiefSeverity.getByRole("button", { name: "Severe", exact: true }).click();
  await patient.locator(".primary-action-stack .primary-button").first().click();
  await patient.waitForURL("**/patient/anatomy");
  await patient.locator('.body-part[aria-label="Head"]').click();
  await patient.locator(".anatomy-subregion").filter({ hasText: "Face" }).click();
  await patient.locator(".primary-action-stack .primary-button").first().click();

  await patient.waitForURL("**/patient/symptoms");
  check("patient: reached other-symptoms step", true);
  await patient.locator("button", { hasText: "Add another symptom" }).click();
  const draftInput = await patient.getByRole("textbox", { name: "Describe the symptom in your own words." });
  await draftInput.fill(EXTRA);
  // The symptoms page has exactly one severity group: the draft card's.
  const draftSeverity = patient.getByRole("group", { name: "How severe is it?" }).first();
  await draftSeverity.getByRole("button", { name: "Very severe", exact: true }).click();
  // Optional region for the extra symptom: Head (scoped to the draft card's region group).
  const regionGroups = patient.locator(".symptom-card--draft .anatomy-region-list button");
  await regionGroups.filter({ hasText: "Head" }).first().click();
  await patient.locator(".symptom-card__save").click();
  await patient.waitForSelector(".symptom-card--saved", { timeout: 15000 });
  const savedCardText = (await patient.locator(".symptom-card--saved").first().textContent()) ?? "";
  check("patient: extra symptom listed after save", savedCardText.includes(EXTRA), savedCardText.slice(0, 60));

  await patient.locator(".primary-action-stack .primary-button").first().click();
  await patient.waitForURL("**/patient/interview");
  await patient.waitForTimeout(2500);

  // Answer the interview (same strategy as the cross-console run).
  for (let i = 0; i < 40; i++) {
    if (!patient.url().includes("/patient/interview")) break; // interview done — do not click on later pages
    const doneBtn = patient.locator("button", { hasText: "Continue to documents" });
    if (await doneBtn.count()) {
      await doneBtn.first().click();
      break;
    }
    const textArea = patient.locator("textarea[id^='question-']").first();
    const numberInput = patient.locator("input[id^='question-'][type='number']").first();
    const dateInput = patient.locator("input[id^='question-']").first();
    const choiceBtn = patient.locator(".interview-choices button").first();
    if (await textArea.isVisible().catch(() => false)) {
      await textArea.fill("Two days. About three times a day.");
    } else if (await numberInput.isVisible().catch(() => false)) {
      await numberInput.fill("3");
    } else if (await dateInput.isVisible().catch(() => false)) {
      await dateInput.fill("2026-09-09");
    } else if (await choiceBtn.isVisible().catch(() => false)) {
      await choiceBtn.click();
    }
    const nextBtn = patient.locator(".primary-action-stack .primary-button").first();
    await nextBtn.waitFor({ state: "visible", timeout: 8000 });
    await patient.waitForFunction(
      () => {
        const b = document.querySelector(".primary-action-stack button.primary-button");
        return b && !b.disabled;
      },
      null,
      { timeout: 4000 }
    ).catch(() => {});
    await nextBtn.click().catch(() => {});
    await patient.waitForTimeout(350);
  }
  await patient.waitForURL("**/patient/documents", { timeout: 60000 });

  await patient.locator(".primary-action-stack .primary-button").filter({ hasText: "Submit to doctor" }).click();
  await patient.waitForSelector(".completion-card", { timeout: 60000 });
  const completionText = (await patient.locator(".completion-card").textContent()) ?? "";
  const caseId = completionText.match(/CASE-\d+/)?.[0] ?? null;
  check("patient: completion card with case id", Boolean(caseId), caseId ?? "");
  check("patient: urgent note shown (head trauma)", completionText.toLowerCase().includes("urgent"), "");

  // Both complaints persisted server-side, in order, with severities.
  const complaints = await patient.evaluate(async () => {
    const res = await fetch("/api/patient/complaints", { cache: "no-store" });
    return res.ok ? (await res.json()).complaints : [];
  });
  check(
    "api: two complaints persisted in order",
    complaints.length === 2 && complaints[0]?.position === 1 && complaints[1]?.position === 2,
    `count=${complaints.length}`
  );
  check("api: chief complaint text + SEVERE", complaints[0]?.complaintText === CHIEF && complaints[0]?.severity === "SEVERE", `${complaints[0]?.severity}`);
  check(
    "api: extra symptom text + VERY_SEVERE + head region",
    complaints[1]?.complaintText === EXTRA && complaints[1]?.severity === "VERY_SEVERE" && complaints[1]?.bodyRegion === "head",
    `${complaints[1]?.severity}/${complaints[1]?.bodyRegion}`
  );

  // ── 2. Doctor console: queue + case page show both complaints ──────────
  const doctorCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const doctor = await doctorCtx.newPage();
  doctor.on("console", (msg) => {
    if (msg.type() === "error" && !/404|WebSocket/i.test(msg.text())) errors.push(`[doctor] ${msg.text().slice(0, 160)}`);
  });
  doctor.on("pageerror", (err) => errors.push(`[doctor] ${String(err).slice(0, 160)}`));

  await doctor.goto(`${BASE}/doctor/login`, { waitUntil: "domcontentloaded" });
  await waitHydrated(doctor);
  await doctor.locator('input[type="email"]').first().fill("doctor@medikiosk.local");
  await doctor.locator('input[type="password"]').first().fill("doctor-demo-2026");
  await doctor.locator('button[type="submit"]').click();
  await doctor.waitForURL("**/doctor", { timeout: 30000 });
  check("doctor: logged in", true);

  const queueRow = doctor.locator("tr", { hasText: caseId ?? "CASE-0000" }).first();
  await queueRow.waitFor({ timeout: 30000 });
  const queueRowText = (await queueRow.textContent()) ?? "";
  check("doctor: queue shows +1 more (2 complaints)", /\+1 more/.test(queueRowText), queueRowText.slice(0, 120));
  check("doctor: queue shows chief complaint", queueRowText.includes(CHIEF.slice(0, 40)), "");

  await queueRow.locator("a").first().click();
  await doctor.waitForURL("**/doctor/case/**", { timeout: 30000 });
  await doctor.waitForSelector("h1", { timeout: 30000 });
  const casePageText = (await doctor.locator("body").textContent()) ?? "";
  check("doctor: case id in page header", casePageText.includes(caseId ?? ""), caseId ?? "");
  check("doctor: chief complaint shown", casePageText.includes(CHIEF), "");
  check("doctor: 'Other complaints' section present", /Other complaints/i.test(casePageText), "");
  check("doctor: extra symptom shown under other complaints", casePageText.includes(EXTRA), "");
  check("doctor: both severities visible", /SEVERE/.test(casePageText) && /VERY SEVERE|VERY_SEVERE/i.test(casePageText), "");
  check("doctor: safety signal shown", /safety|signal/i.test(casePageText), "");

  await doctor.screenshot({ path: "screenshots/e2e-multi-complaint-case.png", fullPage: false });
} finally {
  await browser.close();
}

check("no unexplained console/page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
console.log(`\n${passed}/${passed + failed} multi-complaint checks passed`);
process.exit(failed > 0 ? 1 : 0);
