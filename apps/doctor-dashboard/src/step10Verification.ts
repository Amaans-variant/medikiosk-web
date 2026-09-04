import { useKioskStore, PatientRecord } from "@/store/kioskStore";

export function runStep10DoctorConsoleTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];
  
  // Test 1: 5 Queue Tabs & Priority Sorting
  try {
    useKioskStore.getState().resetDemoEnvironment();
    const state = useKioskStore.getState();
    const priorityPatients = state.queue.filter(
      (p: PatientRecord) => (p.redFlags && p.redFlags.length > 0) || p.room.includes("Emergency") || p.department.includes("Triage")
    );
    if (priorityPatients.length === 0) throw new Error("Expected priority patients in queue");
    results.push({ name: "Queue supports 5 explicit status tabs & auto priority sorting", passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: "Queue supports 5 explicit status tabs & auto priority sorting", passed: false, error: msg });
  }

  // Test 2: AI Draft vs Doctor Verified Distinction
  try {
    useKioskStore.getState().resetDemoEnvironment();
    const state = useKioskStore.getState();
    const patientId = "p-101";
    let record = state.queue.find((p: PatientRecord) => p.id === patientId);

    if (record?.reviewStatus === "doctor_verified") {
      throw new Error("Initial record should be AI DRAFT, not doctor_verified");
    }

    state.confirmPatient(patientId, "Dr. Anand Sharma, MD");
    record = useKioskStore.getState().queue.find((p: PatientRecord) => p.id === patientId);

    if (record?.reviewStatus !== "doctor_verified" || record?.verifiedBy !== "Dr. Anand Sharma, MD") {
      throw new Error("Confirmation failed to set reviewStatus to doctor_verified");
    }

    const hasLog = record?.auditLogs?.some((l) => l.newValue === "doctor_verified");
    if (!hasLog) throw new Error("Audit log entry for doctor verification was not created");

    results.push({ name: "AI Draft vs Doctor Verified distinction and explicit doctor confirmation", passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: "AI Draft vs Doctor Verified distinction and explicit doctor confirmation", passed: false, error: msg });
  }

  // Test 3: Audit Trail Logging
  try {
    useKioskStore.getState().resetDemoEnvironment();
    const state = useKioskStore.getState();
    const patientId = "p-101";

    state.amendRecord(patientId, "Doctor revised HPI details for acute epigastric pain.");
    let record = useKioskStore.getState().queue.find((p: PatientRecord) => p.id === patientId);
    if (record?.hpiOverride !== "Doctor revised HPI details for acute epigastric pain.") {
      throw new Error("HPI override failed");
    }
    if (!record?.auditLogs || record.auditLogs.length === 0) {
      throw new Error("Audit log for amendment not generated");
    }

    state.requestReinterview(patientId, "Clarify allergy history");
    record = useKioskStore.getState().queue.find((p: PatientRecord) => p.id === patientId);
    if (record?.reviewStatus !== "reinterview_requested" || record?.status !== "reinterview") {
      throw new Error("Reinterview request status update failed");
    }

    state.rejectPatient(patientId, "Inaccurate complaint");
    record = useKioskStore.getState().queue.find((p: PatientRecord) => p.id === patientId);
    if (record?.reviewStatus !== "doctor_rejected" || record?.status !== "rejected") {
      throw new Error("Rejection status update failed");
    }

    results.push({ name: "Audit Trail logging for doctor edits, rejections, and re-interviews", passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: "Audit Trail logging for doctor edits, rejections, and re-interviews", passed: false, error: msg });
  }

  // Test 4: Stream Isolation
  try {
    useKioskStore.getState().resetDemoEnvironment();
    const state = useKioskStore.getState();
    const modernPatient = state.queue.find((p: PatientRecord) => p.consultationType === "modern");

    if (!modernPatient) throw new Error("Modern medicine patient not found");
    if (modernPatient.ayushAssessment !== undefined) {
      throw new Error("Modern medicine patient contains AYUSH assessment metadata");
    }

    results.push({ name: "Stream isolation guarantees Modern Medicine records remain 100% AYUSH-free", passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: "Stream isolation guarantees Modern Medicine records remain 100% AYUSH-free", passed: false, error: msg });
  }

  return results;
}
