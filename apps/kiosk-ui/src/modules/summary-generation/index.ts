import { ClinicalAiService, SummarizeClinicalIntakeParams } from "../../services/ai/geminiService";
import { ClinicalSummary } from "../../models";

export class ClinicalSummaryGenerationModule {
  public static buildDraftSummary(params: SummarizeClinicalIntakeParams): ClinicalSummary {
    return ClinicalAiService.generateDraftSummary(params);
  }
}
