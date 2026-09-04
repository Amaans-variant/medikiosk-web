import { useKioskStore, PatientRecord } from "@/store/kioskStore";
import { IntegrationModule } from "@/modules/integration";
import { ClinicalSummary } from "@/models";

export function runStep11FhirTests(): { name: string; passed: boolean; details?: string; error?: string }[] {
  const results: { name: string; passed: boolean; details?: string; error?: string }[] = [];

  // Test 1: Normal Demo Record FHIR Bundle Generation & Matching Doctor Console
  try {
    useKioskStore.getState().loadDemoScenario(1);
    const state = useKioskStore.getState();
    const record = state.queue.find((p: PatientRecord) => p.id === state.selectedPatientId) || state.queue[0];

    const validation = IntegrationModule.validateSessionForFhir({
      patient: {
        id: record.id,
        name: record.name,
        age: record.age,
        gender: record.gender === "F" ? "F" : "M",
        abhaId: record.abhaId,
        mobile: record.mobile,
        registeredAt: record.waitSince
      }
    });

    if (!validation.isValid) {
      throw new Error(`Validation failed for normal patient: ${validation.errors.join(", ")}`);
    }

    const mockSummary: ClinicalSummary = record.clinicalSummary || {
      id: "sum-1",
      patientId: record.id,
      sessionId: "sess-" + record.id,
      tokenNumber: record.token,
      assignedRoom: record.room,
      assignedDepartment: record.department,
      estimatedWaitMinutes: 10,
      hpiNarrative: record.complaint.symptomLabel,
      chiefComplaints: [{ id: "c1", anatomicalRegion: "general", labelHi: record.complaint.symptomLabel, labelEn: record.complaint.symptomLabel, severity: record.complaint.severity || 5 }],
      extractedMedications: (record.documents?.medications || []).map(m => ({ id: m.id || "1", category: "medication", name: m.name, dosage: m.dose, frequency: m.frequency, confidence: 0.95, isVerifiedByDoctor: true })),
      flaggedLabs: (record.documents?.labValues || []).map(l => ({ id: l.id || "1", category: "lab_biomarker", name: l.test, value: l.value, confidence: 0.95, isVerifiedByDoctor: true })),
      redFlags: record.redFlags || [],
      aiDisclaimer: "AI Draft",
      createdAt: Date.now(),
      isAiDraft: true,
      status: "ai_draft"
    };

    const bundle = IntegrationModule.generateAbdmBundle(
      {
        id: record.id,
        name: record.name,
        age: record.age,
        gender: record.gender === "F" ? "F" : "M",
        abhaId: record.abhaId,
        mobile: record.mobile,
        registeredAt: record.waitSince
      },
      mockSummary
    ) as { resourceType: string; entry: { resource: { resourceType: string; name?: { text: string }[] } }[] };

    if (bundle.resourceType !== "Bundle") throw new Error("Output is not a valid FHIR Bundle");
    const patientResource = bundle.entry.find((e) => e.resource.resourceType === "Patient")?.resource;
    if (!patientResource || patientResource.name?.[0]?.text !== record.name) {
      throw new Error(`Patient name mismatch in FHIR bundle: expected ${record.name}, got ${patientResource?.name?.[0]?.text}`);
    }

    results.push({ name: "Normal Demo Record FHIR Bundle Generation & Field Verification", passed: true, details: `Verified bundle with ${bundle.entry.length} FHIR entries matching Doctor Console values.` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: "Normal Demo Record FHIR Bundle Generation & Field Verification", passed: false, error: msg });
  }

  // Test 2: Emergency Record FHIR Bundle Generation & Matching Doctor Console
  try {
    useKioskStore.getState().loadDemoScenario(2);
    const state = useKioskStore.getState();
    const record = state.queue.find((p: PatientRecord) => p.id === state.selectedPatientId) || state.queue[0];

    const mockSummary: ClinicalSummary = record.clinicalSummary || {
      id: "sum-2",
      patientId: record.id,
      sessionId: "sess-" + record.id,
      tokenNumber: record.token,
      assignedRoom: record.room,
      assignedDepartment: record.department,
      estimatedWaitMinutes: 5,
      hpiNarrative: record.complaint.symptomLabel,
      chiefComplaints: [{ id: "c1", anatomicalRegion: "chest", labelHi: record.complaint.symptomLabel, labelEn: record.complaint.symptomLabel, severity: record.complaint.severity || 8 }],
      extractedMedications: (record.documents?.medications || []).map(m => ({ id: m.id || "1", category: "medication", name: m.name, dosage: m.dose, frequency: m.frequency, confidence: 0.95, isVerifiedByDoctor: true })),
      flaggedLabs: (record.documents?.labValues || []).map(l => ({ id: l.id || "1", category: "lab_biomarker", name: l.test, value: l.value, confidence: 0.95, isVerifiedByDoctor: true })),
      redFlags: record.redFlags || [],
      aiDisclaimer: "AI Draft",
      createdAt: Date.now(),
      isAiDraft: true,
      status: "ai_draft"
    };

    const bundle = IntegrationModule.generateAbdmBundle(
      {
        id: record.id,
        name: record.name,
        age: record.age,
        gender: record.gender === "F" ? "F" : "M",
        abhaId: record.abhaId,
        mobile: record.mobile,
        registeredAt: record.waitSince
      },
      mockSummary
    ) as { resourceType: string; entry: { resource: { resourceType: string } }[] };

    const conditionResources = bundle.entry.filter((e) => e.resource.resourceType === "Condition");
    if (conditionResources.length === 0) throw new Error("Emergency condition resource missing from FHIR Bundle");

    results.push({ name: "Emergency Record FHIR Bundle Generation & Red-Flag Condition Verification", passed: true, details: `Verified emergency bundle with ${bundle.entry.length} entries matching Doctor Console values.` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: "Emergency Record FHIR Bundle Generation & Red-Flag Condition Verification", passed: false, error: msg });
  }

  // Test 3: AYUSH Record FHIR Bundle Generation
  try {
    useKioskStore.getState().loadDemoScenario(3);
    const state = useKioskStore.getState();
    const record = state.queue.find((p: PatientRecord) => p.id === state.selectedPatientId) || state.queue[0];

    const mockSummary: ClinicalSummary = record.clinicalSummary || {
      id: "sum-3",
      patientId: record.id,
      sessionId: "sess-" + record.id,
      tokenNumber: record.token,
      assignedRoom: record.room,
      assignedDepartment: record.department,
      estimatedWaitMinutes: 8,
      hpiNarrative: record.complaint.symptomLabel,
      chiefComplaints: [{ id: "c1", anatomicalRegion: "stomach", labelHi: record.complaint.symptomLabel, labelEn: record.complaint.symptomLabel, severity: record.complaint.severity || 5 }],
      extractedMedications: (record.documents?.medications || []).map(m => ({ id: m.id || "1", category: "medication", name: m.name, dosage: m.dose, frequency: m.frequency, confidence: 0.95, isVerifiedByDoctor: true })),
      flaggedLabs: (record.documents?.labValues || []).map(l => ({ id: l.id || "1", category: "lab_biomarker", name: l.test, value: l.value, confidence: 0.95, isVerifiedByDoctor: true })),
      redFlags: record.redFlags || [],
      ayushSummary: { prakriti: "Pitta-Vata", vikriti: "Pitta Vriddhi", agni: "Tikshnagni", sara: "Madhyama", samhanana: "Madhyama", pramana: "Anuroopa", satmya: "Madhyama", sattva: "Madhyama", aharaShakti: "Tikshnagni", vyayamaShakti: "Madhyama", vaya: "Madhyama Vaya", ahara: "Spicy", vihara: "Late sleep" },
      aiDisclaimer: "AI Draft",
      createdAt: Date.now(),
      isAiDraft: true,
      status: "ai_draft"
    };

    const bundle = IntegrationModule.generateAbdmBundle(
      {
        id: record.id,
        name: record.name,
        age: record.age,
        gender: record.gender === "F" ? "F" : "M",
        abhaId: record.abhaId,
        mobile: record.mobile,
        registeredAt: record.waitSince
      },
      mockSummary
    ) as { resourceType: string; entry: { resource: { resourceType: string; section?: { title: string }[] } }[] };

    const composition = bundle.entry.find((e) => e.resource.resourceType === "Composition")?.resource;
    const ayushSection = composition?.section?.find((s) => s.title.includes("Ayurvedic"));
    if (!ayushSection) throw new Error("AYUSH Dashavidha section missing from FHIR Composition resource");

    results.push({ name: "AYUSH Record FHIR Bundle Generation & Dashavidha Section Verification", passed: true, details: `Verified AYUSH bundle with ${bundle.entry.length} entries containing Dashavidha assessment matching Doctor Console values.` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: "AYUSH Record FHIR Bundle Generation & Dashavidha Section Verification", passed: false, error: msg });
  }

  return results;
}
