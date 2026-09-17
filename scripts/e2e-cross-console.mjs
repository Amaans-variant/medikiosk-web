// Cross-console E2E (real browser): one real case created on the patient
// kiosk, then traced through the doctor console and the hospital console.
// Usage: node scripts/e2e-cross-console.mjs
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}${detail ? ` (${detail})` : ""}`);
}

const browser = await chromium.launch();
const errorsByPage = {};

function track(page, name) {
  page.on("pageerror", (err) => {
    (errorsByPage[name] ??= []).push(String(err));
  });
}

// A controlled input filled BEFORE React hydration keeps the DOM value but
// React state stays empty; the next re-render resets the field. Wait for
// React to attach its value tracker (hydration marker) before filling.
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

const COMPLAIN = "Sharp pain behind my left eye, worse in the morning. I fell on my head two days ago.";

// ─────────────────────────── 1. PATIENT KIOSK ───────────────────────────
const patientCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const patient = await patientCtx.newPage();
track(patient, "patient");

await patient.goto(`${BASE}/patient`, { waitUntil: "domcontentloaded" });
await patient.locator(".welcome-screen .primary-button").click();
await patient.waitForURL("**/patient/language");
await patient.locator(".language-option").nth(0).click();
await patient.waitForURL("**/patient/consent");
await patient.locator(".primary-button").click();
await patient.waitForURL("**/patient/start");
await patient.locator(".primary-button").click();
await patient.waitForURL("**/patient/complaint");
await patient.locator("textarea").fill(COMPLAIN);
await patient.locator(".primary-button").click();
await patient.waitForURL("**/patient/anatomy");
await patient.locator('.body-part[aria-label="Head"]').click();
await patient.locator(".anatomy-subregion").filter({ hasText: "Face" }).click();
await patient.locator(".primary-action-stack .primary-button").first().click();

// Other-symptoms step (multiple complaints): the canonical run adds none.
await patient.waitForURL("**/patient/symptoms");
check("patient: reached other-symptoms step", true);
await patient.locator(".primary-action-stack .primary-button").first().click();
await patient.waitForURL("**/patient/interview");

async function answerInterview(page) {
  page.on("response", (res) => {
    if (res.url().includes("/api/") && res.status() >= 400) {
      console.log(`  [api-err] ${res.status()} ${res.request().method()} ${res.url()}`);
    }
  });
  for (let i = 0; i < 40; i++) {
    if (!page.url().includes("/patient/interview")) break; // interview done — do not click on later pages
    const doneBtn = page.locator("button", { hasText: "Continue to documents" });
    if (await doneBtn.count()) {
      await doneBtn.first().click();
      return;
    }
    const textArea = page.locator("textarea[id^='question-']").first();
    const numberInput = page.locator("input[id^='question-'][type='number']").first();
    const dateInput = page.locator("input[id^='question-']").first();
    const choiceBtn = page.locator(".interview-choices button").first();
    if (await textArea.isVisible().catch(() => false)) {
      await textArea.fill("Two days. About three times a day.");
    } else if (await numberInput.isVisible().catch(() => false)) {
      await numberInput.fill("3");
    } else if (await dateInput.isVisible().catch(() => false)) {
      await dateInput.fill("2026-09-09");
    } else if (await choiceBtn.isVisible().catch(() => false)) {
      // Yes/no and single-choice questions: pick the first offered option.
      await choiceBtn.click();
      console.log(`  [interview] chose "${(await choiceBtn.textContent())?.trim()}"`);
    } else {
      const qt = (await page.locator(".interview-card__question h2").textContent().catch(() => "?"))?.trim();
      console.log(`  [interview] no input/choice found for: ${qt} url=${page.url()}`);
      if (i >= 14) {
        await page.screenshot({ path: "screenshots/debug-cross-interview.png", fullPage: true }).catch(() => {});
        console.log(`  [interview] page text: ${((await page.locator("body").textContent().catch(() => "")) || "").replace(/\s+/g, " ").slice(0, 300)}`);
      }
    }
    const nextBtn = page.locator(".primary-action-stack .primary-button").first();
    await nextBtn.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForFunction(
      () => {
        const b = document.querySelector(".primary-action-stack button.primary-button");
        return b && !b.disabled;
      },
      null,
      { timeout: 4000 }
    ).catch(async () => {
      const q = await page.locator(".interview-card__question h2").textContent().catch(() => "?");
      const html = await page.evaluate(() => document.querySelector(".interview-card")?.innerHTML.slice(0, 400));
      throw new Error(`Next stayed disabled for: ${q}\n${html}`);
    });
    await nextBtn.click({ timeout: 5000 });
    await page.waitForTimeout(350);
  }
  if (page.url().includes("/patient/documents")) return; // completed via the completion card
  throw new Error("Interview did not finish in 40 steps");
}

await answerInterview(patient);
await patient.waitForURL("**/patient/documents", { timeout: 30000 });
check("patient: reached documents after interview", true);

// Submit to doctor
await patient.locator(".primary-action-stack .primary-button").filter({ hasText: "Submit to doctor" }).click();
await patient.waitForSelector(".completion-card", { timeout: 30000 });
const completionText = (await patient.locator(".completion-card").textContent()) ?? "";
const caseMatch = completionText.match(/CASE-\d+/);
check("patient: completion card with case id", Boolean(caseMatch), caseMatch?.[0] ?? "");
check("patient: urgent note shown (head trauma)", completionText.toLowerCase().includes("urgent"), "");
const caseId = caseMatch?.[0] ?? null;
await patient.screenshot({ path: "screenshots/e2e-patient-completion.png" });

// Session state must reflect the review status
const patientSession = await patient.evaluate(async () => {
  const res = await fetch("/api/patient/session");
  return res.ok ? (await res.json()).session : null;
});
check(
  "patient: case advanced to review status",
  patientSession?.caseStatus === "URGENT_REVIEW" || patientSession?.caseStatus === "AWAITING_REVIEW",
  patientSession?.caseStatus ?? "n/a"
);
check("patient: case id consistent", patientSession?.caseId === caseId, `${patientSession?.caseId} vs ${caseId}`);

// ─────────────────────── 2. DOCTOR CONSOLE ──────────────────────────────
const doctorCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const doctor = await doctorCtx.newPage();
track(doctor, "doctor");

await doctor.goto(`${BASE}/doctor/login`, { waitUntil: "domcontentloaded" });
await waitHydrated(doctor);
await doctor.locator('input[type="email"]').first().fill("doctor@medikiosk.local");
await doctor.locator('input[type="password"]').first().fill("doctor-demo-2026");
await doctor.locator('button[type="submit"]').click();
await doctor.waitForURL("**/doctor", { timeout: 30000 });
check("doctor: logged in", true);

const queueRow = doctor.locator("tr", { hasText: caseId ?? "CASE-0000" }).first();
await queueRow.waitFor({ timeout: 30000 });
check("doctor: case in queue", true, caseId);
const rowText = (await queueRow.textContent()) ?? "";
check("doctor: complaint text matches", rowText.includes("Sharp pain behind my left eye"), "");
check("doctor: unreviewed signals flagged", /unreviewed/.test(rowText), "");

await queueRow.locator("a").click();
await doctor.waitForURL("**/doctor/case/**", { timeout: 30000 });
// The URL carries the session uuid; the canonical case id renders in the header.
const doctorCaseId = ((await doctor.locator("h1").first().textContent()) ?? "").trim();
check("doctor: same case id in page header", doctorCaseId === caseId, `${doctorCaseId} vs ${caseId}`);

await doctor.waitForSelector("#signals-heading", { timeout: 15000 });
const signalsText = (await doctor.locator('section[aria-labelledby="signals-heading"]').textContent()) ?? "";
check("doctor: safety signal shown", signalsText.toLowerCase().includes("head trauma") || /head trauma|trauma|fall/.test(signalsText), "");

check("doctor: clinical history section", await doctor.locator("#history-heading").isVisible());
const historyText = (await doctor.locator('section[aria-labelledby="history-heading"]').textContent()) ?? "";
check("doctor: history contains complaint", historyText.includes("Sharp pain behind my left eye"), "");
check("doctor: history contains region", /head|face/i.test(historyText), "");
check("doctor: document evidence section", await doctor.locator("#docs-heading").isVisible());
check("doctor: AYUSH section present", await doctor.locator("#ayush-heading").isVisible());

// Review the safety signal (real state change, visible to hospital audit)
const markReviewed = doctor.getByRole("button", { name: "Mark reviewed" }).first();
await markReviewed.click();
await doctor.waitForFunction(
  () => {
    const el = document.querySelector('section[aria-labelledby="signals-heading"]');
    const txt = el?.textContent ?? "";
    return /Reviewed/.test(txt) && !/UNREVIEWED/.test(txt);
  },
  null,
  { timeout: 15000 }
).catch(() => {});
const afterSignals = (await doctor.locator('section[aria-labelledby="signals-heading"]').textContent()) ?? "";
check("doctor: signal marked reviewed", /Reviewed/.test(afterSignals) && !/UNREVIEWED/.test(afterSignals), "");

// Start + complete the consultation with a clinical note
await doctor.getByRole("button", { name: "Start consultation" }).click();
await doctor.waitForTimeout(400);
await doctor.locator("textarea[placeholder='What was assessed and concluded?']").fill("Assessed: post-traumatic fronto-orbital pain, no neurological signs on kiosk interview. Plan: follow-up review, caution for worsening headache or visual change.");
await doctor.getByRole("button", { name: "Complete consultation" }).click();
await doctor.waitForSelector("p[role='status']", { timeout: 15000 });
const doctorStatus = await doctor.locator("p[role='status']").first().textContent();
check("doctor: consultation completed", /completed/i.test(doctorStatus ?? ""), (doctorStatus ?? "").slice(0, 80));
await doctor.waitForFunction(
  () => /COMPLETED/.test(document.body.textContent ?? ""),
  null,
  { timeout: 15000 }
).catch(() => {});
const pageText = (await doctor.locator("body").textContent()) ?? "";
check("doctor: status badge COMPLETED", /COMPLETED/.test(pageText), "");
await doctor.screenshot({ path: "screenshots/e2e-doctor-case.png", fullPage: false });

// ─────────────────────── 3. HOSPITAL CONSOLE ────────────────────────────
const hospitalCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const hospital = await hospitalCtx.newPage();
track(hospital, "hospital");

// A real kiosk heartbeat so the network panel reflects live device state.
await fetch(`${BASE}/api/kiosk/heartbeat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ kioskId: "KIOSK-01", label: "Reception kiosk" }),
}).catch(() => {});

await hospital.goto(`${BASE}/hospital/login`, { waitUntil: "domcontentloaded" });
await waitHydrated(hospital);
await hospital.locator('input[type="email"]').first().fill("hospital@medikiosk.local");
await hospital.locator('input[type="password"]').first().fill("hospital-demo-2026");
await hospital.locator('button[type="submit"]').click();
await hospital.waitForURL("**/hospital", { timeout: 30000 });
check("hospital: logged in", true);

// The overview is fetched after navigation; wait for the case to actually render.
await hospital.waitForFunction(
  (cid) => (document.body.textContent ?? "").includes(cid),
  caseId ?? "CASE-0000",
  { timeout: 20000 }
).catch(() => {});
const hospitalText = (await hospital.locator("body").textContent()) ?? "";
// Completed cases intentionally leave the queue (queue = needs-attention);
// the hospital console records completion via the audit log + "Completed today".
check("hospital: case id visible in operations view", hospitalText.includes(caseId ?? "CASE-0000"), caseId);
const completionLine = (hospitalText.match(new RegExp(`case\\.completed[\\s\\S]{0,80}?${caseId ?? "CASE-\\d+"}`)) ?? [])[0];
check("hospital: completion recorded for the case (audit log)", typeof completionLine === "string", completionLine ?? "no case.completed line");
check("hospital: completed-today counter present", /Completed today/i.test(hospitalText), "");
check("hospital: kiosk network shows ONLINE", /ONLINE/.test(hospitalText), "");
check("hospital: doctor on duty listed", hospitalText.includes("Ananya"), "");
await hospital.screenshot({ path: "screenshots/e2e-hospital.png", fullPage: false });

// Cross-console consistency summary
check(
  "cross-console: identical case id across all three surfaces",
  caseId !== null && caseId === doctorCaseId && hospitalText.includes(caseId),
  caseId
);

for (const [name, errs] of Object.entries(errorsByPage)) {
  check(`no page errors: ${name}`, errs.length === 0, errs.slice(0, 2).join(" | "));
}

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
