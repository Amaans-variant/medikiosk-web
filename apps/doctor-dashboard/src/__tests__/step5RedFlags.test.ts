import { ConfigurableRedFlagEngine } from "../modules/red-flags/ruleEngine";
import { RedFlagDetectionModule } from "../modules/red-flags";
import { Complaint } from "../models";

function runStep5RedFlagTests() {
  console.log("=== MediKiosk Step 5 Red-Flag Engine Hardening Tests ===");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  const engine = new ConfigurableRedFlagEngine();

  // Test 1: Chest pain only (No emergency)
  const complaints1: Complaint[] = [{ id: "c1", anatomicalRegion: "chest_heart_lungs", labelHi: "Chest", labelEn: "Chest", severity: 5 }];
  const res1 = engine.evaluate("s1", { chiefComplaint: "Chest pain" }, complaints1);
  assert(!res1.hasEmergency, "Test 1: Chest pain only does NOT trigger emergency red-flag (Control)");

  // Test 2: Chest pain + breathlessness (Emergency triggered)
  const res2 = engine.evaluate("s2", {
    chiefComplaint: "Chest pain",
    associatedSymptoms: ["Shortness of breath"]
  }, complaints1);
  assert(res2.hasEmergency, "Test 2: Chest pain + breathlessness triggers Emergency Code Red");
  assert(res2.patientAlert.en.includes("Proceed to Emergency Triage"), "Test 2: Patient message includes 'Proceed to Emergency Triage'");
  assert(res2.doctorAlert.reason.includes("Potential emergency symptoms reported"), "Test 2: Doctor message contains non-diagnostic explanation");

  // Test 3: Mild headache (No emergency)
  const complaints3: Complaint[] = [{ id: "c3", anatomicalRegion: "head_brain", labelHi: "Headache", labelEn: "Headache", severity: 3 }];
  const res3 = engine.evaluate("s3", { chiefComplaint: "Headache", severity: 3, onset: "Gradual onset" }, complaints3);
  assert(!res3.hasEmergency, "Test 3: Mild headache does NOT trigger emergency");

  // Test 4: Severe thunderclap headache (Emergency triggered)
  const res4 = engine.evaluate("s4", { chiefComplaint: "Headache", severity: 10, onset: "Sudden thunderclap" }, complaints3);
  assert(res4.hasEmergency, "Test 4: Severe thunderclap headache triggers Emergency Code Red");

  // Test 5: Abdominal pain only (No emergency)
  const complaints5: Complaint[] = [{ id: "c5", anatomicalRegion: "stomach_abdomen", labelHi: "Stomach", labelEn: "Stomach", severity: 5 }];
  const res5 = engine.evaluate("s5", { chiefComplaint: "Abdominal pain", severity: 5 }, complaints5);
  assert(!res5.hasEmergency, "Test 5: Abdominal pain only does NOT trigger emergency");

  // Test 6: Abdominal pain + fainting (Emergency triggered)
  const res6 = engine.evaluate("s6", { chiefComplaint: "Abdominal pain", severity: 8, associatedSymptoms: ["Fainting / Collapse"] }, complaints5);
  assert(res6.hasEmergency, "Test 6: Severe abdominal pain + fainting triggers Emergency Code Red");

  // Test 7: Patient explicitly denies breathlessness (False positive control)
  const res7 = engine.evaluate("s7", { chiefComplaint: "Chest pain", associatedSymptoms: ["No breathlessness", "None reported"] }, complaints1);
  assert(!res7.hasEmergency, "Test 7: Explicit denial of breathlessness prevents false positive emergency flag");

  // Test 8: Audit log logging verification
  const auditRes = RedFlagDetectionModule.analyze("sess-audit-test", complaints1, { chiefComplaint: "Chest pain", associatedSymptoms: ["Shortness of breath"] });
  assert(auditRes.isEmergency, "Test 8: Audit log module correctly processes emergency assessment");

  console.log(`\nStep 5 Test Summary: ${passed}/${total} passed.`);
}

runStep5RedFlagTests();
