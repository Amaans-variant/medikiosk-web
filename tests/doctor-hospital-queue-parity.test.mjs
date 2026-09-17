import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("doctor queue is gated to DOCTOR role", () => {
  const queueRoute = read("app/api/staff/queue/route.ts");
  assert.match(queueRoute, /requireStaff\("DOCTOR"\)/);
  assert.match(queueRoute, /withStaffTx/);
});

test("hospital overview is gated to HOSPITAL role", () => {
  const overviewRoute = read("app/api/hospital/overview/route.ts");
  assert.match(overviewRoute, /requireStaff\("HOSPITAL"\)/);
  assert.match(overviewRoute, /withStaffTx/);
});

test("hospital overview strictly respects role boundary by never exposing complaint text", () => {
  const overviewRoute = read("app/api/hospital/overview/route.ts");
  const hospitalPage = read("app/hospital/page.tsx");
  assert.doesNotMatch(overviewRoute, /primary_complaint|complaint_text/);
  assert.doesNotMatch(hospitalPage, /primaryComplaint|data-label="Complaint"/);
});

test("doctor queue query selects all canonical clinical fields without invalid columns", () => {
  const queueRoute = read("app/api/staff/queue/route.ts");
  assert.match(queueRoute, /s\.case_id/);
  assert.match(queueRoute, /s\.case_status/);
  assert.match(queueRoute, /primary_complaint/);
  assert.match(queueRoute, /complaint_count/);
  assert.match(queueRoute, /top_severity/);
  assert.match(queueRoute, /unreviewed_signals/);
  assert.match(queueRoute, /document_count/);
  assert.match(queueRoute, /documents_processing/);
  assert.match(queueRoute, /doctor_name/);
  // Ensure non-existent columns are NOT present
  assert.doesNotMatch(queueRoute, /s\.demo_flag/);
});

test("doctor console renders actionable summary cards and clinical queue columns", () => {
  const docPage = read("app/doctor/page.tsx");
  assert.match(docPage, /Clinical case queue/);
  assert.match(docPage, /Urgent review/);
  assert.match(docPage, /Awaiting review/);
  assert.match(docPage, /In consultation/);
  assert.match(docPage, /My active cases/);
  assert.match(docPage, /Total active queue/);
  assert.match(docPage, /<th>Priority<\/th>/);
  assert.match(docPage, /<th>Case<\/th>/);
  assert.match(docPage, /<th>Primary complaint<\/th>/);
  assert.match(docPage, /<th>Severity<\/th>/);
  assert.match(docPage, /<th>Safety<\/th>/);
  assert.match(docPage, /<th>Documents<\/th>/);
  assert.match(docPage, /<th>Waiting<\/th>/);
  assert.match(docPage, /<th>Doctor<\/th>/);
  assert.match(docPage, /<th>Action<\/th>/);
});

test("hospital console renders real operational funnel metrics and status filters", () => {
  const hospPage = read("app/hospital/page.tsx");
  assert.match(hospPage, /Hospital command centre/);
  assert.match(hospPage, /Kiosk intake/);
  assert.match(hospPage, /Awaiting review/);
  assert.match(hospPage, /Urgent review/);
  assert.match(hospPage, /In consultation/);
  assert.match(hospPage, /Completed today/);
  assert.match(hospPage, /Average waiting/);
  assert.match(hospPage, /OPD review queue/);
  assert.match(hospPage, /Document \/ diagnostics readiness/);
  assert.match(hospPage, /Kiosk network/);
  assert.match(hospPage, /Clinical staff on duty/);
  assert.match(hospPage, /Audit trail/);
});

test("both doctor and hospital consoles query matching active case statuses", () => {
  const queueRoute = read("app/api/staff/queue/route.ts");
  const overviewRoute = read("app/api/hospital/overview/route.ts");
  
  for (const status of ["AWAITING_REVIEW", "URGENT_REVIEW", "IN_CONSULTATION", "IN_PROGRESS"]) {
    assert.match(queueRoute, new RegExp(`'${status}'`));
    assert.match(overviewRoute, new RegExp(`'${status}'`));
  }
});

test("doctor console surfaces dedicated urgent attention section and debounced search", () => {
  const docPage = read("app/doctor/page.tsx");
  assert.match(docPage, /Needs immediate clinical attention/);
  assert.match(docPage, /getPriorityCategory/);
  assert.match(docPage, /debouncedQ/);
  assert.match(docPage, /document\.visibilityState/);
  assert.match(docPage, /You're up to date/);
});

test("hospital console surfaces attention required triage and plain-language audit trail", () => {
  const hospPage = read("app/hospital/page.tsx");
  assert.match(hospPage, /Attention required/);
  assert.match(hospPage, /Patient visit completed/);
  assert.match(hospPage, /Doctor started consultation/);
  assert.match(hospPage, /debouncedSearch/);
});

test("doctor case workspace renders checklist, next action engine and physician assessment", () => {
  const casePage = read("app/doctor/case/[sessionId]/page.tsx");
  assert.match(casePage, /What has been reviewed\?/);
  assert.match(casePage, /Next Action Engine|next-action-banner/);
  assert.match(casePage, /Physician assessment & notes/);
  assert.match(casePage, /Patient overview & history/);
  assert.match(casePage, /Return to Queue/);
});

