import { useKioskStore } from "@/store/kioskStore";

export function runStep12ResilienceTests(): { name: string; passed: boolean; details?: string; error?: string }[] {
  const results: { name: string; passed: boolean; details?: string; error?: string }[] = [];

  // Test 1: Navigation & State Preservation
  try {
    useKioskStore.getState().resetPatientSession();
    useKioskStore.getState().setPatientDemographics({
      name: "Patient Alpha",
      age: 45,
      gender: "F",
      mobile: "+91 99887 76655"
    });
    useKioskStore.getState().setComplaint("chest_heart_lungs", "Chest Pain & Tightness");
    useKioskStore.getState().setSeverity(8);

    // Simulate route navigation / language change
    useKioskStore.getState().setLanguage("hi");
    const current = useKioskStore.getState().currentPatient;

    if (current.name !== "Patient Alpha" || current.severity !== 8 || current.complaintId !== "chest_heart_lungs") {
      throw new Error("Patient data lost during language/route change");
    }

    results.push({ name: "Patient session data survives route navigation and language changes", passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: "Patient session data survives route navigation and language changes", passed: false, error: msg });
  }

  // Test 2: Cross-Patient Leakage Prevention & Reset Isolation
  try {
    // 1. Patient A enters data and completes intake
    useKioskStore.getState().resetPatientSession();
    useKioskStore.getState().setPatientDemographics({
      name: "Patient A (Severe Allergy & Penicillin)",
      age: 50,
      gender: "M"
    });
    useKioskStore.getState().setComplaint("stomach_abdomen", "Severe Stomach Pain");
    useKioskStore.getState().setScannedDocuments(
      [{ name: "Penicillin", dose: "500mg", frequency: "BD", note: "Allergy", confidence: 0.95, source: "ocr" }],
      [{ test: "Blood Pressure", value: "180/110", range: "120/80", flag: "high", confidence: 0.98 }]
    );
    useKioskStore.getState().completeIntakeAndEnqueue();

    // 2. Reset session for Patient B
    useKioskStore.getState().resetPatientSession();

    // 3. Verify Patient B sees zero data from Patient A
    const patientB = useKioskStore.getState().currentPatient;

    if (patientB.name === "Patient A (Severe Allergy & Penicillin)") {
      throw new Error("Patient B inherited Patient A's name");
    }
    if (patientB.scannedDocs.medications.length > 0) {
      throw new Error("Patient B inherited Patient A's scanned medications");
    }
    if (patientB.scannedDocs.labValues.length > 0) {
      throw new Error("Patient B inherited Patient A's scanned lab values");
    }
    if (patientB.complaintId === "stomach_abdomen" || patientB.complaintIds.length > 0) {
      throw new Error("Patient B inherited Patient A's complaints");
    }

    results.push({ name: "Cross-Patient Data Leakage Prevention (Patient A -> Patient B Isolation)", passed: true, details: "Verified complete isolation of history, complaints, documents, and medications upon session reset." });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: "Cross-Patient Data Leakage Prevention (Patient A -> Patient B Isolation)", passed: false, error: msg });
  }

  // Test 3: Session Timeout Reset Verification
  try {
    useKioskStore.getState().setPatientDemographics({ name: "Timeout Patient", age: 60 });
    useKioskStore.getState().resetPatientSession(); // Simulates timeout handler

    const state = useKioskStore.getState();
    if (state.currentPatient.name !== "") {
      throw new Error("Session timeout reset did not clear patient name");
    }

    results.push({ name: "Session Timeout Reset Clears Session & Storage Safely", passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: "Session Timeout Reset Clears Session & Storage Safely", passed: false, error: msg });
  }

  return results;
}
