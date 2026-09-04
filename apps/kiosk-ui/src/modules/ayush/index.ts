import { determineAyushProfile } from "../../rules/ayushRules";
import { AyushAssessment } from "../../models";

export class AyushHistoryModule {
  public static evaluatePrakriti(selectedType: string): AyushAssessment {
    return determineAyushProfile(selectedType);
  }
}
