import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  normalizePhoneNumber,
  isValidIndianMobile,
  maskPhoneNumber,
  generatePhoneOtp,
  verifyPhoneOtp,
  DEMO_OTP,
} from "../lib/auth/otp.ts";
import {
  formatAbhaNumber,
  initiateAbdmVerification,
  confirmAbdmVerification,
} from "../lib/abdm.ts";

function read(rel) {
  return fs.readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
}

test("phone number helper normalizes, validates and masks Indian mobile numbers", () => {
  assert.equal(normalizePhoneNumber("+91 98765 43210"), "9876543210");
  assert.equal(normalizePhoneNumber("09876543210"), "9876543210");
  assert.equal(normalizePhoneNumber("9876543210"), "9876543210");

  assert.equal(isValidIndianMobile("9876543210"), true);
  assert.equal(isValidIndianMobile("8876543210"), true);
  assert.equal(isValidIndianMobile("7876543210"), true);
  assert.equal(isValidIndianMobile("6876543210"), true);
  assert.equal(isValidIndianMobile("5876543210"), false); // Indian mobiles start with 6-9
  assert.equal(isValidIndianMobile("12345"), false);

  assert.equal(maskPhoneNumber("9876543210"), "+91 ******3210");
});

test("phone OTP service generates and verifies valid OTP with cooldown enforcement", async () => {
  const testPhone = "9811122233";

  // Step 1: Generate OTP
  const gen = await generatePhoneOtp(testPhone);
  assert.equal(gen.success, true);
  assert.ok(gen.devOtp, "devOtp should be present in dev/test");

  // Step 2: Immediate re-request triggers cooldown
  const cooldown = await generatePhoneOtp(testPhone);
  assert.equal(cooldown.success, false);
  assert.match(cooldown.error || "", /wait \d+ seconds/);

  // Step 3: Verify with incorrect OTP
  const fail = await verifyPhoneOtp(testPhone, "000000");
  assert.equal(fail.verified, false);
  assert.match(fail.error || "", /Incorrect OTP/);

  // Step 4: Verify with correct OTP
  const pass = await verifyPhoneOtp(testPhone, String(gen.devOtp));
  assert.equal(pass.verified, true);

  // Step 5: Demo OTP is also accepted for sandbox/demo
  await generatePhoneOtp("9822233344");
  const demoPass = await verifyPhoneOtp("9822233344", DEMO_OTP);
  assert.equal(demoPass.verified, true);
});

test("ABDM ABHA service formats 14-digit IDs and verifies via ABDM OTP", async () => {
  const rawAbha = "14123456789821";
  assert.equal(formatAbhaNumber(rawAbha), "14-1234-5678-9821");

  // Initiate ABDM OTP
  const init = await initiateAbdmVerification("14-1234-5678-9821");
  assert.equal(init.success, true);
  assert.ok(init.txnId);
  assert.match(init.maskedMobile || "", /\+91 \*{6}\d{4}/);

  // Confirm ABDM OTP
  const confirm = await confirmAbdmVerification(String(init.txnId), String(init.devOtp));
  assert.equal(confirm.verified, true);
  assert.ok(confirm.profile);
  assert.equal(confirm.profile.verificationSource, "ABDM_OTP");
  assert.equal(confirm.profile.abhaLast4, "9821");
  assert.match(confirm.profile.abhaAddressMasked || "", /@abdm$/);
  assert.ok(confirm.profile.name);
});

test("patient login screen contains phone input, OTP flow, and ABHA tab", () => {
  const page = read("app/patient/login/page.tsx");
  assert.match(page, /Indian Mobile Number/);
  assert.match(page, /Get OTP via SMS/);
  assert.match(page, /Enter 6-digit OTP/);
  assert.match(page, /Verify OTP & Continue/);
  assert.match(page, /ABHA ID/);
});

test("identity screen maintains clinical privacy contract while supporting ABDM OTP", () => {
  const identity = read("app/patient/identity/page.tsx");
  assert.match(identity, /ABHA \(Optional\)/);
  assert.match(identity, /Continue without ABHA/);
  assert.match(identity, /never cached/);
  assert.match(identity, /Verify via ABDM OTP/);
  assert.match(identity, /Verify & Link ABHA/);
  assert.match(identity, /ABHA Verified/);
});
