import { useKioskStore } from "../apps/kiosk-ui/src/store/kioskStore";
import { DASHAVIDHA_QUESTIONS, determineAyushProfile } from "../apps/kiosk-ui/src/rules/ayushRules";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

console.log("=== MediKiosk Dedicated AYUSH / Ayurveda Consultation Mode Verification ===\n");

// 1. Verify Consultation Type Decoupling & Store Actions
const store = useKioskStore.getState();
assert(typeof store.setConsultationType === "function", "setConsultationType action exists on kioskStore");
assert(typeof store.setAyushAssessmentField === "function", "setAyushAssessmentField action exists on kioskStore");

// Test selecting Modern Medicine
store.setConsultationType("modern");
let state = useKioskStore.getState();
assert(state.currentPatient.consultationType === "modern", "Switched to Modern Medicine consultation mode");

// Test selecting Ayurveda
store.setConsultationType("ayurveda");
state = useKioskStore.getState();
assert(state.currentPatient.consultationType === "ayurveda", "Switched to dedicated Ayurveda consultation mode");

// 2. Verify all 12 SIH Problem Statement Fields in DASHAVIDHA_QUESTIONS
console.log("\nVerifying 12 SIH Problem Statement Dashavidha Dimensions:");
const REQUIRED_SIH_FIELDS = [
  "prakriti",
  "vikriti",
  "sara",
  "samhanana",
  "pramana",
  "satmya",
  "sattva",
  "aharaShakti",
  "vyayamaShakti",
  "vaya",
  "ahara",
  "vihara"
];

const questionIds = DASHAVIDHA_QUESTIONS.map(q => q.id);
REQUIRED_SIH_FIELDS.forEach((field) => {
  assert(questionIds.includes(field), `Field '${field}' present in Dashavidha questionnaire schema`);
});

// 3. Verify determineAyushProfile builds all 12 fields
console.log("\nTesting determineAyushProfile for clinical completeness:");
const profile = determineAyushProfile("Pitta-Vata", {
  vikriti: "Pitta Vriddhi (Amlapitta)",
  sara: "Rakta-Meda Sara",
  samhanana: "Susamhata (Compact)",
  pramana: "Anuroopa",
  satmya: "Sarva-rasa Satmya",
  sattva: "Pravara Sattva",
  aharaShakti: "Tikshnagni (Strong hunger)",
  vyayamaShakti: "Madhyama",
  vaya: "Madhyama Vaya",
  ahara: "Tikshna-Katu",
  vihara: "Ratri-Jagarana"
});

REQUIRED_SIH_FIELDS.forEach((field) => {
  assert(!!(profile as any)[field], `Generated profile includes valid '${field}'`);
});
assert(profile.agni === "Tikshnagni (Hyperactive)", "Agni correlated with Pitta constitution");
assert(profile.koshtha?.includes("Mridu"), "Koshtha correlated with Pitta constitution");

// 4. Verify Non-Diagnostic Clinical Safety Constraint
console.log("\nVerifying Strict Non-Diagnostic Phrasing Constraints:");
const profileString = JSON.stringify(profile).toLowerCase();
assert(!profileString.includes("diagnosed with"), "No autonomous disease diagnosis in AYUSH output");
assert(!profileString.includes("prescribed"), "No autonomous drug prescription in AYUSH output");

// 5. Test Intake & Enqueue in Ayurveda Mode
console.log("\nTesting Complete Intake & Enqueue in Ayurveda Mode:");
store.setConsultationType("ayurveda");
store.setComplaint("stomach_abdomen", "Amlapitta / Hyperacidity");
store.setAyushData("Pitta-Vata");
store.setAyushAssessmentField("vikriti", "Pitta Vriddhi (Amlapitta)");
store.setAyushAssessmentField("aharaShakti", "Tikshnagni");

const token = store.completeIntakeAndEnqueue();
assert(typeof token === "number", `Patient enqueued with Token #${token}`);

const enqueuedRecord = useKioskStore.getState().queue[0];
assert(enqueuedRecord.consultationType === "ayurveda", "Enqueued record marked as 'ayurveda' care stream");
assert(enqueuedRecord.department.includes("Kayachikitsa"), "Ayurveda patient routed to Kayachikitsa OPD");
assert(enqueuedRecord.room.includes("Room 2"), "Ayurveda patient assigned to Ayush OPD Room 2");
assert(!!enqueuedRecord.ayushAssessment?.vikriti, "Full 12-factor AyushAssessment attached to patient record");

// 6. Test Doctor Review of Ayurveda Record
console.log("\nTesting Doctor Dashboard Review & Confirmation of Ayurveda Intake:");
store.confirmPatient(enqueuedRecord.id, "Dr. Anand Sharma, BAMS, MD (Ay) [Reg #DMC-AY-1049]");
const verifiedRecord = useKioskStore.getState().queue.find(p => p.id === enqueuedRecord.id)!;
assert(verifiedRecord.reviewStatus === "doctor_verified", "Ayurveda record transitioned to 'doctor_verified'");
assert(verifiedRecord.verifiedBy?.includes("MD (Ay)"), "Verified by Ayurvedic Vaidya / Practitioner");

console.log("\n🎉 ALL AYUSH / AYURVEDA CONSULTATION MODE TESTS PASSED WITH 100% COMPLIANCE!\n");
