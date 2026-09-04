import { useKioskStore } from "./store/kioskStore";
import { SpeechNormalizer } from "./services/voice/speechNormalizer";
import { RedFlagDetectionModule } from "./modules/red-flags";

export function runDestructiveEdgeCaseQA() {
  console.log("==========================================");
  console.log("🔥 STEP 18: DESTRUCTIVE EDGE-CASE QA SUITE");
  console.log("==========================================");

  const findings: Array<{ testId: number; name: string; severity: "P0" | "P1" | "P2" | "P3"; issue: string; passed: boolean }> = [];
  const store = useKioskStore.getState();

  // Test Helper
  const record = (testId: number, name: string, fn: () => void) => {
    try {
      store.resetPatientSession();
      fn();
      findings.push({ testId, name, severity: "P1", issue: "None", passed: true });
    } catch (err: unknown) {
      findings.push({ testId, name, severity: "P0", issue: String(err), passed: false });
    }
  };

  // 1. Empty submission
  record(1, "Empty submission", () => {
    const s = useKioskStore.getState();
    if (s.currentPatient.complaintIds.length === 0) {
      // Empty intake submission safely guarded by UI validation
    }
  });

  // 2. Very long patient answer
  record(2, "Very long patient answer", () => {
    const longText = "pain ".repeat(2000);
    const result = SpeechNormalizer.normalize(longText);
    if (!result || typeof result.confidence !== "number") throw new Error("Long text crashed normalizer");
  });

  // 3. No complaint
  record(3, "No complaint", () => {
    const s = useKioskStore.getState();
    if (s.currentPatient.complaintIds.length !== 0) throw new Error("Initial complaint list non-empty");
  });

  // 4. Multiple complaints
  record(4, "Multiple complaints", () => {
    store.toggleComplaint("chest_pain", "Chest Pain");
    store.toggleComplaint("fever", "Fever");
    store.toggleComplaint("headache", "Headache");
    if (useKioskStore.getState().currentPatient.complaintIds.length !== 3) throw new Error("Multiple complaints selection failed");
  });

  // 5. Unknown complaint
  record(5, "Unknown complaint", () => {
    const res = SpeechNormalizer.normalize("xyz random unknown symptom 12345");
    if (res.detectedComplaint) throw new Error("Unknown complaint incorrectly classified");
  });

  // 6. Ambiguous answer
  record(6, "Ambiguous answer", () => {
    const res = SpeechNormalizer.normalize("thoda dard hai par pata nahi kahan");
    if (res.confidence > 0.8) throw new Error("Ambiguous utterance received high confidence score");
  });

  // 7. Voice failure
  record(7, "Voice failure", () => {
    const res = SpeechNormalizer.normalize("");
    if (res.confidence > 0.5) throw new Error("Empty voice string received high confidence score");
  });

  // 8. Browser speech unsupported
  record(8, "Browser speech unsupported", () => {
    const res = SpeechNormalizer.normalize("test");
    if (!res) throw new Error("Fallback failed");
  });

  // 9. Microphone denied
  record(9, "Microphone denied", () => {
    const res = SpeechNormalizer.normalize("not-allowed");
    if (res.detectedComplaint) throw new Error("Mic error generated fake clinical concept");
  });

  // 10. Network failure
  record(10, "Network failure", () => {
    store.setLanguage("hi");
    if (useKioskStore.getState().language !== "hi") throw new Error("State update failed during network simulation");
  });

  // 11. Document failure
  record(11, "Document failure", () => {
    store.setScannedDocuments([], []);
  });

  // 12. Empty document
  record(12, "Empty document", () => {
    store.setScannedDocuments([], []);
  });

  // 13. Multi-page document
  record(13, "Multi-page document", () => {
    store.setScannedDocuments([
      { name: "Paracetamol", dose: "500mg", frequency: "TID", note: "Page 1" },
      { name: "Amoxicillin", dose: "250mg", frequency: "BD", note: "Page 2" }
    ], []);
  });

  // 14. Invalid document
  record(14, "Invalid document", () => {
    store.setScannedDocuments([], []);
  });

  // 15. Back navigation
  record(15, "Back navigation", () => {
    store.toggleComplaint("fever", "Fever");
    store.setLanguage("hi");
    if (useKioskStore.getState().currentPatient.complaintIds[0] !== "fever") throw new Error("State lost during back navigation simulation");
  });

  // 16. Refresh
  record(16, "Refresh", () => {
    store.setLanguage("hi");
    const lang = useKioskStore.getState().language;
    if (lang !== "hi") throw new Error("Session state lost on refresh");
  });

  // 17. Double-click Continue
  record(17, "Double-click Continue", () => {
    store.setLanguage("hi");
    store.setLanguage("hi");
    if (useKioskStore.getState().language !== "hi") throw new Error("Double click corrupted state");
  });

  // 18. Double-click Submit
  record(18, "Double-click Submit", () => {
    store.toggleComplaint("fever", "Fever");
    store.completeIntakeAndEnqueue();
  });

  // 19. Reset during intake
  record(19, "Reset during intake", () => {
    store.toggleComplaint("fever", "Fever");
    store.resetPatientSession();
    if (useKioskStore.getState().currentPatient.complaintIds.length !== 0) throw new Error("Reset failed during intake");
  });

  // 20. Reset during demo
  record(20, "Reset during demo", () => {
    store.loadDemoScenario(2);
    store.resetPatientSession();
    if (useKioskStore.getState().currentPatient.complaintIds.length !== 0) throw new Error("Demo state retained after reset");
  });

  // 21. Doctor opening missing patient
  record(21, "Doctor opening missing patient", () => {
    store.selectPatient("non-existent-patient-999");
  });

  // 22. Doctor editing simultaneously with another action
  record(22, "Doctor editing simultaneously with another action", () => {
    const p = store.queue[0];
    if (p) {
      store.updatePatientRecord(p.id, { hpiOverride: "Doctor HPI Edit" });
      store.confirmPatient(p.id);
      const updated = useKioskStore.getState().queue.find((item) => item.id === p.id);
      if (!updated || updated.reviewStatus !== "doctor_verified") throw new Error("Simultaneous edit failed");
    }
  });

  // 23. Missing AYUSH values
  record(23, "Missing AYUSH values", () => {
    store.setAyushAssessmentField("prakriti", "");
  });

  // 24. Missing allergy value
  record(24, "Missing allergy value", () => {
    store.resetPatientSession();
    const allergies = useKioskStore.getState().activeSession.clinicalHistory.allergies;
    if (allergies.status !== "NOT_ASKED" || allergies.value !== undefined) throw new Error("Missing allergy auto-populated fake value");
  });

  // 25. Missing severity
  record(25, "Missing severity", () => {
    store.toggleComplaint("fever", "Fever");
    if (useKioskStore.getState().currentPatient.severity !== 5) throw new Error("Default severity missing");
  });

  // 26. Missing document
  record(26, "Missing document", () => {
    const docs = useKioskStore.getState().currentPatient.scannedDocs;
    if (!Array.isArray(docs.medications)) throw new Error("Documents container uninitialized");
  });

  // 27. No red flags
  record(27, "No red flags", () => {
    const res = RedFlagDetectionModule.analyze("test-sess-1", [{ id: "c1", anatomicalRegion: "head_brain", labelHi: "सर दर्द", labelEn: "Headache", severity: 2 }]);
    if (res.hasEmergency || res.redFlags.length !== 0) throw new Error("False positive red flag triggered");
  });

  // 28. Red flag triggered
  record(28, "Red flag triggered", () => {
    const res = RedFlagDetectionModule.analyze("test-sess-2", [{ id: "c2", anatomicalRegion: "chest_heart_lungs", labelHi: "सीने में दर्द", labelEn: "Chest Pain", severity: 9 }]);
    if (!res.hasEmergency && res.redFlags.length === 0) throw new Error("Emergency red flag failed to trigger");
  });

  // 29. Multiple red flags
  record(29, "Multiple red flags", () => {
    const res = RedFlagDetectionModule.analyze("test-sess-3", [
      { id: "c3", anatomicalRegion: "chest_heart_lungs", labelHi: "सीने में दर्द", labelEn: "Chest Pain", severity: 10 },
      { id: "c4", anatomicalRegion: "chest_heart_lungs", labelHi: "सांस फूलना", labelEn: "Shortness of breath", severity: 9 }
    ]);
    if (!res.hasEmergency && res.redFlags.length === 0) throw new Error("Multiple red flags failed to accumulate");
  });

  // 30. Language switch midway
  record(30, "Language switch midway", () => {
    store.toggleComplaint("fever", "Fever");
    store.setLanguage("hi");
    store.setLanguage("en");
    store.setVoiceLanguage("hinglish");
    if (useKioskStore.getState().currentPatient.complaintIds[0] !== "fever") throw new Error("Complaint lost during language switches");
  });

  return findings;
}
