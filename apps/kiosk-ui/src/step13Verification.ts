import { useKioskStore } from "@/store/kioskStore";

export function runStep13DemoLauncherTests(): { name: string; passed: boolean; details?: string; error?: string }[] {
  const results: { name: string; passed: boolean; details?: string; error?: string }[] = [];

  // Helper to execute sequence
  const runSequence = () => {
    // Demo 1
    useKioskStore.getState().loadDemoScenario(1);
    const d1 = useKioskStore.getState().currentPatient;
    if (!d1.name.includes("Ramesh Kumar")) {
      throw new Error(`Demo 1 patient name mismatch: expected Ramesh Kumar, got ${d1.name}`);
    }
    if (d1.complaintId !== "stomach_abdomen") {
      throw new Error(`Demo 1 complaint mismatch: expected stomach_abdomen, got ${d1.complaintId}`);
    }

    // Reset
    useKioskStore.getState().resetDemoEnvironment();
    const r1 = useKioskStore.getState().currentPatient;
    if (r1.name !== "" || r1.scannedDocs.medications.length > 0) {
      throw new Error("Reset after Demo 1 failed to clear currentPatient state");
    }

    // Demo 2
    useKioskStore.getState().loadDemoScenario(2);
    const d2 = useKioskStore.getState().currentPatient;
    if (!d2.name.includes("Sunita Devi")) {
      throw new Error(`Demo 2 patient name mismatch: expected Sunita Devi, got ${d2.name}`);
    }
    if (d2.severity !== 8 || d2.complaintId !== "chest_heart_lungs") {
      throw new Error(`Demo 2 severity/complaint mismatch: expected 8 / chest_heart_lungs, got ${d2.severity} / ${d2.complaintId}`);
    }

    // Reset
    useKioskStore.getState().resetDemoEnvironment();
    const r2 = useKioskStore.getState().currentPatient;
    if (r2.name !== "" || r2.scannedDocs.medications.length > 0) {
      throw new Error("Reset after Demo 2 failed to clear currentPatient state");
    }

    // Demo 3
    useKioskStore.getState().loadDemoScenario(3);
    const d3 = useKioskStore.getState().currentPatient;
    if (!d3.name.includes("Arjun Nair")) {
      throw new Error(`Demo 3 patient name mismatch: expected Arjun Nair, got ${d3.name}`);
    }
    if (d3.consultationType !== "ayurveda" || !d3.ayushAssessment?.prakriti) {
      throw new Error("Demo 3 AYUSH consultation type or Dashavidha Pariksha missing");
    }

    // Reset
    useKioskStore.getState().resetDemoEnvironment();
  };

  // Run sequence twice consecutively
  try {
    runSequence();
    runSequence();
    results.push({
      name: "SIH Demo Launcher Deterministic Scenarios (Demo 1 -> Reset -> Demo 2 -> Reset -> Demo 3 -> Reset x2)",
      passed: true,
      details: "Successfully verified deterministic data loading and zero data leakage across 2 consecutive runs."
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({
      name: "SIH Demo Launcher Deterministic Scenarios (Demo 1 -> Reset -> Demo 2 -> Reset -> Demo 3 -> Reset x2)",
      passed: false,
      error: msg
    });
  }

  return results;
}
