import { PatientSession, Patient, ClinicalSummary } from "../../models";

export interface FhirValidationResult {
  isValid: boolean;
  errors: string[];
}

export class FhirIntegrationService {
  /**
   * Validates required patient session fields before generating FHIR R4 Bundle
   */
  public static validateSessionForFhir(session: PatientSession | { patient: Patient; summary?: ClinicalSummary }): FhirValidationResult {
    const errors: string[] = [];

    const patient = 'patient' in session ? session.patient : undefined;
    if (!patient || !patient.id) {
      errors.push("Missing required field: Patient ID");
    }
    if (!patient || !patient.name || patient.name.trim() === "") {
      errors.push("Missing required field: Patient Name");
    }
    if (!patient || !patient.gender) {
      errors.push("Missing required field: Patient Gender");
    }
    if (!patient || patient.age === undefined || patient.age < 0) {
      errors.push("Missing required field: Patient Age");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generates a standard HL7 FHIR R4 Bundle for ABDM Health Repository Export from PatientSession or Patient Record
   */
  public static createFhirR4BundleFromSession(session: PatientSession): Record<string, unknown> {
    const validation = this.validateSessionForFhir(session);
    if (!validation.isValid) {
      throw new Error(`FHIR Bundle Validation Failed: ${validation.errors.join("; ")}`);
    }

    const { patient, sessionId, complaints, clinicalHistory, ayushAssessment, documents, metadata } = session;
    const now = new Date(metadata?.startedAt || Date.now()).toISOString();

    const fhirEntries: Record<string, unknown>[] = [];

    // 1. Patient Resource
    const patientResourceId = `Patient/${patient.id}`;
    fhirEntries.push({
      fullUrl: `urn:uuid:${patient.id}`,
      resource: {
        resourceType: "Patient",
        id: patient.id,
        identifier: [
          {
            system: "https://healthid.ndhm.gov.in",
            value: patient.abhaId || "ABHA-UNLINKED"
          }
        ],
        name: [{ text: patient.name }],
        telecom: [{ system: "phone", value: patient.mobile }],
        gender: patient.gender === "M" ? "male" : patient.gender === "F" ? "female" : "other"
      }
    });

    // 2. Encounter Resource
    const encounterId = `Encounter-${sessionId}`;
    fhirEntries.push({
      fullUrl: `urn:uuid:${encounterId}`,
      resource: {
        resourceType: "Encounter",
        id: encounterId,
        status: "in-progress",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "AMB",
          display: "ambulatory"
        },
        subject: { reference: patientResourceId, display: patient.name },
        period: { start: now },
        reasonCode: complaints.map(c => ({
          text: c.labelEn || c.labelHi,
          coding: c.snomedCt ? [{ system: "http://snomed.info/sct", code: c.snomedCt, display: c.labelEn }] : undefined
        }))
      }
    });

    // 3. Condition Resources (Complaints)
    const conditionReferences: { reference: string; display: string }[] = [];
    complaints.forEach((c, idx) => {
      const condId = `Condition-${sessionId}-${idx}`;
      conditionReferences.push({ reference: `Condition/${condId}`, display: c.labelEn || c.labelHi });
      fhirEntries.push({
        fullUrl: `urn:uuid:${condId}`,
        resource: {
          resourceType: "Condition",
          id: condId,
          clinicalStatus: {
            coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }]
          },
          subject: { reference: patientResourceId },
          encounter: { reference: `Encounter/${encounterId}` },
          code: {
            text: c.labelEn || c.labelHi,
            coding: c.snomedCt ? [{ system: "http://snomed.info/sct", code: c.snomedCt, display: c.labelEn }] : undefined
          },
          severity: {
            text: `Severity ${c.severity}/10`
          },
          note: c.duration ? [{ text: `Duration: ${c.duration}` }] : undefined
        }
      });
    });

    // 4. Observation Resources (Vitals & Labs)
    if (patient.vitals) {
      if (patient.vitals.bp) {
        fhirEntries.push({
          fullUrl: `urn:uuid:Obs-BP-${sessionId}`,
          resource: {
            resourceType: "Observation",
            id: `Obs-BP-${sessionId}`,
            status: "final",
            code: { coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure panel" }] },
            subject: { reference: patientResourceId },
            valueString: patient.vitals.bp
          }
        });
      }
      if (patient.vitals.spO2) {
        fhirEntries.push({
          fullUrl: `urn:uuid:Obs-SpO2-${sessionId}`,
          resource: {
            resourceType: "Observation",
            id: `Obs-SpO2-${sessionId}`,
            status: "final",
            code: { coding: [{ system: "http://loinc.org", code: "2708-6", display: "Oxygen saturation" }] },
            subject: { reference: patientResourceId },
            valueQuantity: { value: patient.vitals.spO2, unit: "%", system: "http://unitsofmeasure.org", code: "%" }
          }
        });
      }
    }

    // 5. MedicationStatement Resources
    const medList = clinicalHistory.medications.value || [];
    medList.forEach((medName, idx) => {
      const medId = `Med-${sessionId}-${idx}`;
      fhirEntries.push({
        fullUrl: `urn:uuid:${medId}`,
        resource: {
          resourceType: "MedicationStatement",
          id: medId,
          status: "active",
          subject: { reference: patientResourceId },
          medicationCodeableConcept: { text: medName }
        }
      });
    });

    // 6. AllergyIntolerance Resources
    const allergyList = clinicalHistory.allergies.value || [];
    allergyList.forEach((alg, idx) => {
      const algId = `Allergy-${sessionId}-${idx}`;
      fhirEntries.push({
        fullUrl: `urn:uuid:${algId}`,
        resource: {
          resourceType: "AllergyIntolerance",
          id: algId,
          clinicalStatus: {
            coding: [{ system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", code: "active" }]
          },
          patient: { reference: patientResourceId },
          code: { text: alg }
        }
      });
    });

    // 7. DocumentReference Resources
    documents.forEach((doc) => {
      fhirEntries.push({
        fullUrl: `urn:uuid:${doc.id}`,
        resource: {
          resourceType: "DocumentReference",
          id: doc.id,
          status: "current",
          subject: { reference: patientResourceId },
          type: { text: doc.documentType },
          category: [{ text: doc.documentType }],
          date: new Date(doc.uploadedAt).toISOString()
        }
      });
    });

    // 8. Composition Resource (Clinical Summary Root)
    const isAyurveda = session.consultationType === "ayurveda";
    const sections: Record<string, unknown>[] = [
      {
        title: "Chief Complaints & History of Present Illness",
        text: {
          status: "generated",
          div: `<div><p><strong>Chief Complaint:</strong> ${clinicalHistory.chiefComplaint.value || complaints.map(c => c.labelEn).join(', ') || 'Not reported'}</p><p><strong>Severity:</strong> ${clinicalHistory.severity.value || 5}/10</p><p><strong>Duration:</strong> ${clinicalHistory.duration.value || 'Acute'}</p></div>`
        }
      },
      {
        title: "Past & Family Medical History",
        text: {
          status: "generated",
          div: `<div><p><strong>Medical:</strong> ${(clinicalHistory.pastMedicalHistory.value || []).join(', ') || 'None'}</p><p><strong>Allergies:</strong> ${(clinicalHistory.allergies.value || []).join(', ') || 'None reported'}</p></div>`
        }
      }
    ];

    if (isAyurveda && ayushAssessment) {
      sections.push({
        title: "Ayurvedic Dashavidha Pariksha Summary",
        text: {
          status: "generated",
          div: `<div><p><strong>Prakriti:</strong> ${ayushAssessment.prakriti || 'Not assessed'}</p><p><strong>Vikriti:</strong> ${ayushAssessment.vikriti || 'Not assessed'}</p><p><strong>Agni:</strong> ${ayushAssessment.aharaShakti || ayushAssessment.agni || 'Not assessed'}</p></div>`
        }
      });
    }

    fhirEntries.push({
      fullUrl: `urn:uuid:Composition-${sessionId}`,
      resource: {
        resourceType: "Composition",
        id: `Composition-${sessionId}`,
        status: session.doctorReview?.action === "approved" ? "final" : "preliminary",
        type: {
          coding: [{ system: "http://snomed.info/sct", code: "371530004", display: "Clinical consultation report" }]
        },
        title: isAyurveda ? "MediKiosk AYUSH Clinical Intake Bundle" : "MediKiosk Modern Medicine OPD Intake Bundle",
        subject: { reference: patientResourceId },
        encounter: { reference: `Encounter/${encounterId}` },
        date: now,
        author: [{ display: session.doctorReview?.doctorName || "MediKiosk AI Intake Engine" }],
        section: sections
      }
    });

    return {
      resourceType: "Bundle",
      id: `bundle-${sessionId}`,
      type: "document",
      timestamp: now,
      meta: {
        profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/ClinicalArtifact"]
      },
      entry: fhirEntries
    };
  }

  /**
   * Backwards compatible helper for Patient + ClinicalSummary objects
   */
  public static createFhirR4Bundle(patient: Patient, summary: ClinicalSummary): Record<string, unknown> {
    const sessionMock: PatientSession = {
      sessionId: `sess-${patient.id}`,
      patient,
      preferredLanguage: "hi",
      voiceLanguage: "hi-IN",
      consultationType: summary.ayushSummary ? "ayurveda" : "modern",
      complaints: (summary.chiefComplaints || []).map((c, idx) => ({
        id: c.id || `c-${idx}`,
        anatomicalRegion: c.anatomicalRegion || "general",
        labelHi: c.labelHi || c.labelEn || "Complaint",
        labelEn: c.labelEn || c.labelHi || "Complaint",
        severity: c.severity || 5,
        snomedCt: c.snomedCt
      })),
      clinicalHistory: {
        chiefComplaint: { status: "KNOWN", value: (summary.chiefComplaints || []).map(c => c.labelEn).join(", ") },
        onset: { status: "KNOWN", value: summary.hpiNarrative },
        duration: { status: "NOT_ASKED" },
        location: { status: "NOT_ASKED" },
        severity: { status: "KNOWN", value: summary.chiefComplaints?.[0]?.severity || 5 },
        character: { status: "NOT_ASKED" },
        radiation: { status: "NOT_ASKED" },
        aggravatingFactors: { status: "NOT_ASKED" },
        relievingFactors: { status: "NOT_ASKED" },
        associatedSymptoms: { status: "NOT_ASKED" },
        pastMedicalHistory: { status: "NOT_ASKED" },
        pastSurgicalHistory: { status: "NOT_ASKED" },
        medications: { status: "KNOWN", value: (summary.extractedMedications || []).map(m => m.name) },
        allergies: { status: "NOT_ASKED" },
        familyHistory: { status: "NOT_ASKED" },
        personalHistory: {
          diet: { status: "NOT_ASKED" },
          smoking: { status: "NOT_ASKED" },
          alcohol: { status: "NOT_ASKED" },
          sleep: { status: "NOT_ASKED" },
          bowelBladder: { status: "NOT_ASKED" }
        },
        investigations: { status: "KNOWN", value: (summary.flaggedLabs || []).map(l => `${l.name}: ${l.value || ''}`) },
        otherRelevantInformation: { status: "NOT_ASKED" }
      },
      ayushAssessment: summary.ayushSummary ? {
        prakriti: summary.ayushSummary.prakriti,
        vikriti: summary.ayushSummary.vikriti,
        sara: summary.ayushSummary.sara,
        samhanana: "Madhyama",
        pramana: "Anuroopa",
        satmya: "Madhyama",
        sattva: "Madhyama",
        aharaShakti: summary.ayushSummary.aharaShakti || summary.ayushSummary.agni || "Madhyama",
        vyayamaShakti: "Madhyama",
        vaya: "Madhyama Vaya",
        ahara: "Regular",
        vihara: "Regular"
      } : undefined,
      documents: [],
      redFlags: summary.redFlags || [],
      consent: { granted: true, timestamp: Date.now() },
      metadata: { startedAt: Date.now(), kioskId: "kiosk-01" }
    };

    return this.createFhirR4BundleFromSession(sessionMock);
  }
}
