import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
const doctor = fs.readFileSync(path.join(root, "app/doctor/page.tsx"), "utf8");
const hospital = fs.readFileSync(path.join(root, "app/hospital/page.tsx"), "utf8");
const layout = fs.readFileSync(path.join(root, "app/layout.tsx"), "utf8");

test("viewport uses device width", () => {
  assert.match(layout, /width:\s*"device-width"/);
  assert.match(layout, /initialScale:\s*1/);
});

test("phone/tablet/laptop breakpoints exist", () => {
  for (const breakpoint of ["1024px", "800px", "640px", "480px", "360px"]) {
    assert.ok(css.includes(`max-width:${breakpoint}`) || css.includes(`max-width: ${breakpoint}`), `missing ${breakpoint}`);
  }
  assert.ok(css.includes("min-width:1280px") || css.includes("min-width: 1280px"));
});

test("mobile queue tables transform into cards", () => {
  assert.match(doctor, /doctor-queue-table/);
  assert.match(hospital, /hospital-queue-table/);
  assert.match(doctor, /data-label="Primary complaint"/);
  assert.match(hospital, /data-label="Priority"/);
  assert.doesNotMatch(hospital, /data-label="Complaint"/);
  assert.match(css, /\.doctor-queue-table td::before/);
  assert.match(css, /content:attr\(data-label\)/);
});

test("clinical and operations layouts collapse safely", () => {
  assert.match(css, /\.console-grid\{grid-template-columns:1fr\}/);
  assert.match(css, /\.ops-grid\{grid-template-columns:1fr\}/);
  assert.match(css, /\.dash-grid\{grid-template-columns:1fr\}/);
  assert.match(css, /\.kiosk-row,\.staff-row,\.audit-row\{flex-direction:column/);
});

test("mobile inputs and assistant composer avoid width overflow", () => {
  assert.match(css, /\.assistant-composer input\{min-width:0;width:100%\}/);
  assert.match(css, /\.language-chip select\{max-width:100%\}/);
  assert.match(css, /overflow-wrap:anywhere/);
  assert.match(css, /-webkit-text-size-adjust:100%/);
});

test("safe area and reduced motion support remain available", () => {
  assert.match(css, /safe-area-inset-left/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
