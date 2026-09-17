import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";import path from "node:path";
const root=path.resolve(new URL("..",import.meta.url).pathname);const read=p=>fs.readFileSync(path.join(root,p),"utf8");
test("doctor queue is doctor-only",()=>{assert.match(read("app/api/staff/queue/route.ts"),/requireStaff\("DOCTOR"\)/)});
test("hospital overview does not expose chief complaint text",()=>{const api=read("app/api/hospital/overview/route.ts"),ui=read("app/hospital/page.tsx");assert.doesNotMatch(api,/primary_complaint|complaint_text/);assert.doesNotMatch(ui,/primaryComplaint|data-label="Complaint"/)});
test("hospital on-duty list requires an unexpired staff session",()=>{assert.match(read("app/api/hospital/overview/route.ts"),/staff_sessions[\s\S]*expires_at>now\(\)/)});
