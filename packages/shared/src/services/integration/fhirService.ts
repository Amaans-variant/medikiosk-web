import { ClinicalSummary, Patient } from "../../models";

export class FhirIntegrationService {
  /**
   * Generates a standard HL7 FHIR R4 Bundle for ABDM Health Repository Export
   */
  public static createFhirR4Bundle(patient: Patient, summary: ClinicalSummary): Record<string, unknown> {
    return {
      resourceType: "Bundle",
      id: `bundle-${summary.id}`,
      type: "document",
      timestamp: new Date().toISOString(),
      meta: {
        profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/ClinicalArtifact"]
      },
      entry: [
        {
          fullUrl: `urn:uuid:patient-${patient.id}`,
          resource: {
            resourceType: "Patient",
            id: patient.id,
            identifier: [
              {
                system: "https://healthid.ndhm.gov.in",
                value: patient.abhaId || "ABHA-NOT-LINKED"
              }
            ],
            name: [{ text: patient.name }],
            telecom: [{ system: "phone", value: patient.mobile }],
            gender: patient.gender === "M" ? "male" : patient.gender === "F" ? "female" : "other"
          }
        },
        {
          fullUrl: `urn:uuid:composition-${summary.id}`,
          resource: {
            resourceType: "Composition",
            id: summary.id,
            status: summary.status === "physician_reviewed" ? "final" : "preliminary",
            type: {
              coding: [{ system: "http://snomed.info/sct", code: "371530004", display: "Clinical consultation report" }]
            },
            title: "MediKiosk Pre-Consultation Intake Summary",
            note: [{ text: summary.aiDisclaimer }],
            section: [
              {
                title: "Chief Complaints & History of Present Illness",
                text: { status: "generated", div: `<p>${summary.hpiNarrative}</p>` }
              },
              {
                title: "Ayurvedic Dashavidha Assessment",
                text: { status: "generated", div: `<p>Prakriti: ${summary.ayushSummary?.prakriti || "N/A"}</p>` }
              }
            ]
          }
        }
      ]
    };
  }
}
