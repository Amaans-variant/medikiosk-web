import { determineAyushProfile } from "../rules/ayushRules";
import { useKioskStore } from "../store/kioskStore";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runStep6Tests() {
  useKioskStore.getState().resetDemoEnvironment();

  // Test 1: Unselected fields return "Not assessed"
  const assessment = determineAyushProfile("", {});
  assert(assessment.prakriti === "Not assessed", "prakriti should be 'Not assessed'");
  assert(assessment.vikriti === "Not assessed", "vikriti should be 'Not assessed'");
  assert(assessment.sara === "Not assessed", "sara should be 'Not assessed'");
  assert(assessment.samhanana === "Not assessed", "samhanana should be 'Not assessed'");
  assert(assessment.pramana === "Not assessed", "pramana should be 'Not assessed'");
  assert(assessment.satmya === "Not assessed", "satmya should be 'Not assessed'");
  assert(assessment.sattva === "Not assessed", "sattva should be 'Not assessed'");
  assert(assessment.aharaShakti === "Not assessed", "aharaShakti should be 'Not assessed'");
  assert(assessment.vyayamaShakti === "Not assessed", "vyayamaShakti should be 'Not assessed'");
  assert(assessment.vaya === "Not assessed", "vaya should be 'Not assessed'");
  assert(assessment.ahara === "Not assessed", "ahara should be 'Not assessed'");
  assert(assessment.vihara === "Not assessed", "vihara should be 'Not assessed'");
  assert(assessment.agni === "Not assessed", "agni should be 'Not assessed'");
  assert(assessment.bala === "Not assessed", "bala should be 'Not assessed'");
  assert(assessment.koshtha === "Not assessed", "koshtha should be 'Not assessed'");

  // Test 2: Overrides are preserved while unselected fields return "Not assessed"
  const assessment2 = determineAyushProfile("Pitta-Vata", {
    vikriti: "Pitta Vriddhi",
    aharaShakti: "Tikshnagni",
  });
  assert(assessment2.prakriti === "Vata-Pitta", "prakriti should be 'Vata-Pitta'");
  assert(assessment2.vikriti === "Pitta Vriddhi", "vikriti should be 'Pitta Vriddhi'");
  assert(assessment2.aharaShakti === "Tikshnagni", "aharaShakti should be 'Tikshnagni'");
  assert(assessment2.sara === "Not assessed", "unselected sara should be 'Not assessed'");

  // Test 3: Modern Medicine consultation has no ayushAssessment
  const store = useKioskStore.getState();
  store.setConsultationType("modern");
  store.setComplaint("chest_heart_lungs", "Chest Pain");
  const token = store.completeIntakeAndEnqueue();

  const enqueued = store.queue.find((p) => p.token === token);
  assert(enqueued !== undefined, "Enqueued record should exist");
  assert(enqueued?.consultationType === "modern", "Consultation type should be modern");
  assert(enqueued?.ayushAssessment === undefined, "Modern patient must not have ayushAssessment");

  // Test 4: AYUSH consultation has ayushAssessment
  store.setConsultationType("ayurveda");
  store.setAyushData("Pitta-Vata");
  store.setAyushAssessmentField("vikriti", "Pitta Vriddhi");
  const token2 = store.completeIntakeAndEnqueue();

  const enqueued2 = store.queue.find((p) => p.token === token2);
  assert(enqueued2 !== undefined, "Enqueued record 2 should exist");
  assert(enqueued2?.consultationType === "ayurveda", "Consultation type should be ayurveda");
  assert(enqueued2?.ayushAssessment !== undefined, "AYUSH patient must have ayushAssessment");
  assert(enqueued2?.ayushAssessment?.prakriti === "Vata-Pitta", "Prakriti should be Vata-Pitta");
  assert(enqueued2?.ayushAssessment?.vikriti === "Pitta Vriddhi", "Vikriti should be Pitta Vriddhi");
  assert(enqueued2?.ayushAssessment?.sara === "Not assessed", "Unselected sara should be 'Not assessed'");

  console.log("✅ Step 6 AYUSH workflow hardening tests passed successfully!");
}
