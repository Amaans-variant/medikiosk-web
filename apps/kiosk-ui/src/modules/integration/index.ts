import { FhirIntegrationService, FhirValidationResult } from "../../services/integration/fhirService";
import { PatientSession, Patient, ClinicalSummary } from "../../models";

export class IntegrationModule {
  public static validateSessionForFhir(session: PatientSession | { patient: Patient; summary?: ClinicalSummary }): FhirValidationResult {
    return FhirIntegrationService.validateSessionForFhir(session);
  }

  public static generateAbdmBundleFromSession(session: PatientSession) {
    return FhirIntegrationService.createFhirR4BundleFromSession(session);
  }

  public static generateAbdmBundle(patient: Patient, summary: ClinicalSummary) {
    return FhirIntegrationService.createFhirR4Bundle(patient, summary);
  }
}
