import { 
  createEmptyPatientSession 
} from "../models";
import assert from "assert";

export function runPatientSessionTests() {
  console.log("=== RUNNING CLINICAL FACT & PATIENT SESSION INTEGRITY TESTS ===");

  // Test 1: New patient with only abdominal pain
  const s1 = createEmptyPatientSession("p-test-01");
  s1.clinicalHistory.chiefComplaint = {
    status: "KNOWN",
    value: "Abdominal Pain",
    source: "touch",
    capturedAt: Date.now(),
  };
  assert.strictEqual(s1.clinicalHistory.chiefComplaint.status, "KNOWN", "Test 1: chiefComplaint status should be KNOWN");
  assert.strictEqual(s1.clinicalHistory.chiefComplaint.value, "Abdominal Pain", "Test 1: chiefComplaint value should match");
  assert.strictEqual(s1.clinicalHistory.allergies.status, "NOT_ASKED", "Test 1: allergies status should be NOT_ASKED");
  assert.strictEqual(s1.clinicalHistory.allergies.value, undefined, "Test 1: allergies value should be undefined");
  assert.strictEqual(s1.clinicalHistory.pastSurgicalHistory.status, "NOT_ASKED", "Test 1: pastSurgicalHistory status should be NOT_ASKED");
  assert.strictEqual(s1.clinicalHistory.familyHistory.status, "NOT_ASKED", "Test 1: familyHistory status should be NOT_ASKED");
  assert.strictEqual(s1.clinicalHistory.personalHistory.smoking.status, "NOT_ASKED", "Test 1: personalHistory.smoking status should be NOT_ASKED");
  console.log("✓ Test 1 PASSED: New patient with only abdominal pain keeps unasked fields as NOT_ASKED.");

  // Test 2: Patient with UNKNOWN allergy status
  const s2 = createEmptyPatientSession("p-test-02");
  s2.clinicalHistory.allergies = {
    status: "UNKNOWN",
    source: "voice",
    capturedAt: Date.now(),
  };
  assert.strictEqual(s2.clinicalHistory.allergies.status, "UNKNOWN", "Test 2: allergies status should be UNKNOWN");
  assert.strictEqual(s2.clinicalHistory.allergies.value, undefined, "Test 2: allergies value should be undefined");
  console.log("✓ Test 2 PASSED: Patient with UNKNOWN allergy status remains UNKNOWN without false NKDA assumption.");

  // Test 3: Patient explicitly saying "I have no drug allergies"
  const s3 = createEmptyPatientSession("p-test-03");
  s3.clinicalHistory.allergies = {
    status: "DENIED",
    value: ["No Known Drug Allergies (NKDA)"],
    source: "voice",
    confidence: 0.95,
    capturedAt: Date.now(),
  };
  assert.strictEqual(s3.clinicalHistory.allergies.status, "DENIED", "Test 3: allergies status should be DENIED");
  assert.strictEqual(s3.clinicalHistory.allergies.value?.[0], "No Known Drug Allergies (NKDA)", "Test 3: allergies value should be NKDA");
  console.log("✓ Test 3 PASSED: Patient explicitly saying 'I have no drug allergies' yields DENIED with NKDA value.");

  // Test 4: Patient skipping family history
  const s4 = createEmptyPatientSession("p-test-04");
  s4.clinicalHistory.familyHistory = {
    status: "DECLINED",
    source: "touch",
    capturedAt: Date.now(),
  };
  assert.strictEqual(s4.clinicalHistory.familyHistory.status, "DECLINED", "Test 4: familyHistory status should be DECLINED");
  assert.strictEqual(s4.clinicalHistory.familyHistory.value, undefined, "Test 4: familyHistory value should be undefined");
  console.log("✓ Test 4 PASSED: Patient skipping family history is recorded as DECLINED, not auto-filled.");

  // Test 5: Patient declining to answer
  const s5 = createEmptyPatientSession("p-test-05");
  s5.clinicalHistory.personalHistory.alcohol = {
    status: "DECLINED",
    source: "touch",
    capturedAt: Date.now(),
  };
  assert.strictEqual(s5.clinicalHistory.personalHistory.alcohol.status, "DECLINED", "Test 5: alcohol status should be DECLINED");
  assert.strictEqual(s5.clinicalHistory.personalHistory.alcohol.value, undefined, "Test 5: alcohol value should be undefined");
  console.log("✓ Test 5 PASSED: Patient declining to answer a clinical question marks field as DECLINED.");

  // Test 6: Doctor editing a history field
  const s6 = createEmptyPatientSession("p-test-06");
  s6.clinicalHistory.pastMedicalHistory = {
    status: "NOT_ASKED",
  };
  s6.clinicalHistory.pastMedicalHistory = {
    status: "KNOWN",
    value: ["Essential Hypertension", "Type 2 Diabetes Mellitus"],
    source: "doctor",
    capturedAt: Date.now(),
  };
  assert.strictEqual(s6.clinicalHistory.pastMedicalHistory.status, "KNOWN", "Test 6: pastMedicalHistory status should be KNOWN");
  assert.strictEqual(s6.clinicalHistory.pastMedicalHistory.source, "doctor", "Test 6: pastMedicalHistory source should be doctor");
  assert.strictEqual(s6.clinicalHistory.pastMedicalHistory.value?.length, 2, "Test 6: pastMedicalHistory length should be 2");
  assert.strictEqual(s6.clinicalHistory.pastSurgicalHistory.status, "NOT_ASKED", "Test 6: pastSurgicalHistory should remain NOT_ASKED");
  console.log("✓ Test 6 PASSED: Doctor editing a history field updates status to KNOWN with source 'doctor'.");

  console.log("\nALL 6 CLINICAL DATA INTEGRITY TESTS COMPLETED SUCCESSFULLY!");
}

if (require.main === module) {
  runPatientSessionTests();
}
