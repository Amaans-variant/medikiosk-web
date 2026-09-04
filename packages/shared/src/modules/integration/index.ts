import { FhirIntegrationService } from "../../services/integration/fhirService";
import { Patient, ClinicalSummary } from "../../models";

export class IntegrationModule {
  public static generateAbdmBundle(patient: Patient, summary: ClinicalSummary) {
    return FhirIntegrationService.createFhirR4Bundle(patient, summary);
  }
}
