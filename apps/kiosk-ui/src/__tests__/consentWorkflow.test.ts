import assert from "assert";
import { ConsentPrivacyModule } from "../modules/consent-privacy";
import { useKioskStore } from "../store/kioskStore";

export function runConsentWorkflowTests() {
  console.log("=== RUNNING INFORMED CONSENT & PRIVACY WORKFLOW TESTS ===");

  // Test 1: ConsentPrivacyModule creates valid consent record
  const consentRecord = ConsentPrivacyModule.recordConsent("p-test-01", "sess-test-01", {
    abdmRecordLinkage: true,
  });
  assert.strictEqual(consentRecord.patientId, "p-test-01", "Test 1: Patient ID should match");
  assert.strictEqual(consentRecord.scope.intakeHistory, true, "Test 1: intakeHistory should be true");
  assert.strictEqual(consentRecord.scope.abdmRecordLinkage, true, "Test 1: abdmRecordLinkage should be true");
  assert.strictEqual(consentRecord.audioConsentVerified, true, "Test 1: audioConsentVerified should be true");
  console.log("✓ Test 1 PASSED: ConsentPrivacyModule generates compliant consent record.");

  // Test 2: Store setConsentStatus updates currentPatient state
  const store = useKioskStore.getState();
  store.setConsentStatus("ACCEPTED", {
    intakeHistory: true,
    documentOcr: false, // Patient opted out of OCR
    physicianSharing: true,
    abdmRecordLinkage: true,
  });

  const updatedPatient = useKioskStore.getState().currentPatient;
  assert.strictEqual(updatedPatient.consent.status, "ACCEPTED", "Test 2: Consent status should be ACCEPTED");
  assert.strictEqual(updatedPatient.consent.granted, true, "Test 2: Consent granted should be true");
  assert.strictEqual(updatedPatient.consent.scope.documentOcr, false, "Test 2: documentOcr should be false");
  assert.strictEqual(updatedPatient.consent.scope.intakeHistory, true, "Test 2: intakeHistory should be true");
  console.log("✓ Test 2 PASSED: KioskStore records accepted consent with granular scope.");

  // Test 3: Store setConsentStatus records DECLINED
  store.setConsentStatus("DECLINED", {
    intakeHistory: false,
    documentOcr: false,
    physicianSharing: false,
    abdmRecordLinkage: false,
  });

  const declinedPatient = useKioskStore.getState().currentPatient;
  assert.strictEqual(declinedPatient.consent.status, "DECLINED", "Test 3: Consent status should be DECLINED");
  assert.strictEqual(declinedPatient.consent.granted, false, "Test 3: Consent granted should be false");
  console.log("✓ Test 3 PASSED: KioskStore correctly records declined consent status.");

  // Test 4: completeIntakeAndEnqueue attaches consent to PatientRecord
  store.setConsentStatus("ACCEPTED", {
    intakeHistory: true,
    documentOcr: true,
    physicianSharing: true,
    abdmRecordLinkage: true,
  });
  store.completeIntakeAndEnqueue();

  const enqueuedRecord = useKioskStore.getState().queue[0];
  assert.ok(enqueuedRecord.consent, "Test 4: PatientRecord should have consent attached");
  assert.strictEqual(enqueuedRecord.consent?.status, "ACCEPTED", "Test 4: Enqueued consent status should be ACCEPTED");
  assert.strictEqual(enqueuedRecord.consent?.granted, true, "Test 4: Enqueued consent granted should be true");
  console.log("✓ Test 4 PASSED: Completed intake enqueues record with verified consent.");
}

runConsentWorkflowTests();
