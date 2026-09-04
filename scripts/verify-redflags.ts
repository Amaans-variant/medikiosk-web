import { RedFlagDetectionModule } from "../apps/kiosk-ui/src/modules/red-flags";
import { RedFlagAuditLogService } from "../apps/kiosk-ui/src/modules/red-flags/auditLog";
import { Complaint } from "../apps/kiosk-ui/src/models";

console.log("==================================================================");
console.log("RED-FLAG DETECTION MODULE DETERMINISTIC CLINICAL TEST SUITE");
console.log("==================================================================");

function runTestCase(
  name: string,
  history: any,
  complaints: Complaint[],
  expectEmergency: boolean,
  expectedTriggerSnippet?: string
) {
  console.log("\n--- TEST CASE: " + name + " ---");
  const sessionId = "sess-test-" + Math.random().toString(36).slice(2, 7);
  const result = RedFlagDetectionModule.analyze(
    sessionId,
    complaints,
    history,
    { id: "pt-test-99", name: "Ramesh Sharma", token: 77 }
  );

  console.log("  Emergency Flagged: " + result.hasEmergency);
  console.log("  Detected Red-Flag Count: " + result.redFlags.length);
  if (result.detectedSymptoms.length > 0) {
    console.log("  Detected Symptoms: " + result.detectedSymptoms.join(", "));
  }

  // 1. Validate Diagnostic Language Constraint
  for (const rf of result.redFlags) {
    const textToCheck = (rf.condition + " " + rf.clinicalRationale).toLowerCase();
    if (textToCheck.includes("heart attack detected") || textToCheck.includes("stroke diagnosed")) {
      throw new Error("VIOLATION: Prohibited diagnostic claim found in: " + rf.condition);
    }
  }

  // 2. Validate Patient & Doctor Screen Alert Wording
  if (result.hasEmergency) {
    console.log("  [Patient Screen]: " + result.patientAlert.en + " / " + result.patientAlert.hi);
    console.log("  [Doctor/Triage Screen]: " + result.doctorAlert.badge);
    console.log("  [Doctor Reason]: " + result.doctorAlert.reason);
    console.log("  [Time Recorded]: " + result.doctorAlert.timeRecorded);

    if (!result.patientAlert.en.includes("Please contact hospital staff immediately")) {
      throw new Error("Patient alert missing mandatory instruction: Please contact hospital staff immediately.");
    }
    if (!result.doctorAlert.badge.includes("PRIORITY PATIENT")) {
      throw new Error("Doctor alert missing mandatory badge: 🚨 PRIORITY PATIENT");
    }
    if (!result.doctorAlert.reason.includes("Potential emergency symptoms reported — urgent clinical assessment recommended")) {
      throw new Error("Doctor alert reason violates required non-diagnostic phrasing.");
    }
  }

  // 3. Validate Expectation
  if (result.hasEmergency !== expectEmergency) {
    throw new Error("Failed " + name + ": Expected hasEmergency=" + expectEmergency + ", got " + result.hasEmergency);
  }

  if (expectedTriggerSnippet && result.redFlags.length > 0) {
    const found = result.redFlags.some(f => f.condition.toLowerCase().includes(expectedTriggerSnippet.toLowerCase()));
    if (!found) {
      throw new Error("Expected trigger containing " + expectedTriggerSnippet);
    }
  }

  console.log("  -> PASSED: " + name);
}

// 1. TEST: No red flag (routine mild symptom)
runTestCase(
  "1. No Red Flag (Mild Knee Aching)",
  {
    chiefComplaint: "Knee pain",
    duration: "2 weeks",
    severity: 3,
    associatedSymptoms: ["Mild stiffness"]
  },
  [{ id: "knee_joint", anatomicalRegion: "knee_joint", labelHi: "घुटने", labelEn: "Knee", severity: 3 }],
  false
);

// 2. TEST: Single symptom (mild localized chest ache WITHOUT breathlessness, sweating, or syncope)
runTestCase(
  "2. Single Symptom (Mild localized chest ache)",
  {
    chiefComplaint: "Chest pain",
    duration: "3 days",
    severity: 3,
    character: "Sharp localized",
    associatedSymptoms: ["None reported"]
  },
  [{ id: "chest_heart_lungs", anatomicalRegion: "chest_heart_lungs", labelHi: "छाती", labelEn: "Chest", severity: 3 }],
  false
);

// 3. TEST: Multiple symptoms (routine multiple symptoms without emergency combo)
runTestCase(
  "3. Multiple Symptoms (Abdominal cramps + gas + mild bloating)",
  {
    chiefComplaint: "Abdominal pain",
    duration: "2 days",
    severity: 4,
    associatedSymptoms: ["Dyspepsia", "Flatulence"]
  },
  [{ id: "stomach_abdomen", anatomicalRegion: "stomach_abdomen", labelHi: "पेट", labelEn: "Stomach", severity: 4 }],
  false
);

// 4. TEST: Emergency combinations
// 4A. Chest pain + breathlessness
runTestCase(
  "4A. Emergency Combo: Chest pain + breathlessness",
  {
    chiefComplaint: "Chest pain",
    associatedSymptoms: ["Shortness of breath / Dyspnea"]
  },
  [{ id: "chest_heart_lungs", anatomicalRegion: "chest_heart_lungs", labelHi: "छाती", labelEn: "Chest", severity: 7 }],
  true,
  "Chest Pain with Respiratory Compromise"
);

// 4B. Chest pain + severe sweating (diaphoresis)
runTestCase(
  "4B. Emergency Combo: Chest pain + severe cold sweats",
  {
    chiefComplaint: "Chest pain",
    associatedSymptoms: ["Cold sweats / Diaphoresis"]
  },
  [{ id: "chest_heart_lungs", anatomicalRegion: "chest_heart_lungs", labelHi: "छाती", labelEn: "Chest", severity: 8 }],
  true,
  "Chest Pain with Diaphoresis"
);

// 4C. Chest pain + fainting (syncope)
runTestCase(
  "4C. Emergency Combo: Chest pain + fainting",
  {
    chiefComplaint: "Chest pain",
    associatedSymptoms: ["Fainting / Syncope"]
  },
  [{ id: "chest_heart_lungs", anatomicalRegion: "chest_heart_lungs", labelHi: "छाती", labelEn: "Chest", severity: 9 }],
  true,
  "Chest Pain with Syncope"
);

// 4D. Sudden weakness + speech difficulty
runTestCase(
  "4D. Emergency Combo: Sudden weakness + speech difficulty",
  {
    chiefComplaint: "Headache",
    associatedSymptoms: ["Sudden weakness in arm", "Speech difficulty"]
  },
  [{ id: "head_brain", anatomicalRegion: "head_brain", labelHi: "सिर", labelEn: "Head", severity: 6 }],
  true,
  "Sudden Focal Neurological Symptoms"
);

// 4E. Severe abdominal pain + fainting
runTestCase(
  "4E. Emergency Combo: Severe abdominal pain (sev 9) + fainting",
  {
    chiefComplaint: "Abdominal pain",
    severity: 9,
    associatedSymptoms: ["Fainting / Collapse"]
  },
  [{ id: "stomach_abdomen", anatomicalRegion: "stomach_abdomen", labelHi: "पेट", labelEn: "Stomach", severity: 9 }],
  true,
  "Severe Abdominal Pain with Syncope"
);

// 4F. Severe breathing difficulty / Stridor
runTestCase(
  "4F. Emergency Combo: Severe acute respiratory distress / Stridor",
  {
    chiefComplaint: "Cough and breathing difficulty",
    associatedSymptoms: ["Severe dyspnea / Stridor"]
  },
  [{ id: "throat_neck", anatomicalRegion: "throat_neck", labelHi: "गला", labelEn: "Throat", severity: 8 }],
  true,
  "Severe Acute Respiratory Distress"
);

// 5. TEST: False / Ambiguous input
runTestCase(
  "5. False / Ambiguous input (Vague fatigue / tiredness)",
  {
    chiefComplaint: "General feeling unwell",
    associatedSymptoms: ["Tiredness", "Stress"]
  },
  [{ id: "fever_vitals", anatomicalRegion: "fever_vitals", labelHi: "बुखार", labelEn: "Fever", severity: 2 }],
  false
);

// 6. TEST: Audit Log Verification
console.log("\n--- TEST CASE: 6. Audit Log Verification ---");
const logs = RedFlagAuditLogService.getLogs();
console.log("  Total Audit Log Entries Recorded: " + logs.length);
if (logs.length === 0) {
  throw new Error("No audit logs recorded for triggered red flags!");
}
const latestLog = logs[0];
console.log("  Latest Audit Entry:", {
  auditId: latestLog.auditId,
  patientId: latestLog.patientId,
  severity: latestLog.severity,
  triggeringSymptoms: latestLog.triggeringSymptoms,
  priorityReason: latestLog.priorityReason,
  acknowledged: latestLog.acknowledged
});

// Acknowledge alert test
const ackSuccess = RedFlagAuditLogService.acknowledgeAlert(latestLog.auditId, "Dr. Priya Sharma (Triage Lead)");
console.log("  Alert Acknowledged by Doctor: " + ackSuccess);
console.log("  -> PASSED: Audit Log Verification\n");

console.log("==================================================================");
console.log("ALL RED-FLAG DETECTION SUITE TESTS PASSED WITH 100% COMPLIANCE!");
console.log("==================================================================\n");
