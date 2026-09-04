import { ControlledClinicalHistory } from "../history-engine/types";
import { Complaint, RedFlag } from "../../models";

export interface RedFlagRuleDefinition {
  id: string;
  name: string;
  enabled: boolean;
  severity: "emergency_code_red" | "urgent_amber";
  priorityReason: string; // Mandatory non-diagnostic clinical explanation
  triggerSymptoms: string[];
  patientAlertHi: string;
  patientAlertEn: string;
  evaluate: (history?: Partial<ControlledClinicalHistory>, complaints?: Complaint[]) => {
    isMatch: boolean;
    detectedSymptoms: string[];
  };
}

/**
 * Deterministic, Non-Diagnostic Red-Flag Rule Definitions
 * COMPLIANCE: Never diagnoses conditions (e.g. "Heart Attack" or "Stroke").
 * Strictly flags potential emergency symptoms requiring immediate human triage.
 */
export const DEFAULT_RED_FLAG_RULES: RedFlagRuleDefinition[] = [
  // 1. Chest pain + breathlessness
  {
    id: "rf_chest_dyspnea",
    name: "Chest Pain with Respiratory Compromise",
    enabled: true,
    severity: "emergency_code_red",
    priorityReason: "Potential emergency symptoms reported — urgent clinical assessment recommended.",
    triggerSymptoms: ["Chest pain", "Shortness of breath / Dyspnea"],
    patientAlertHi: "⚠️ कृपया तुरंत अस्पताल के कर्मचारियों से संपर्क करें। आपातकालीन ट्राइएज की ओर बढ़ें।",
    patientAlertEn: "⚠️ Please contact hospital staff immediately. Proceed to Emergency Triage.",
    evaluate: (history, complaints = []) => {
      const hasChest = complaints.some(c => c.anatomicalRegion === "chest_heart_lungs" || c.id === "chest_pain") ||
        (history?.chiefComplaint?.toLowerCase().includes("chest") ?? false);

      const hasDenial = history?.associatedSymptoms?.some(s => /no breathlessness|no dyspnea|denies breathlessness|none reported/i.test(s)) ?? false;

      const hasDyspnea = !hasDenial && (
        (history?.associatedSymptoms?.some(s => /shortness of breath|breathlessness|dyspnea|saans/i.test(s)) ?? false) ||
        (history?.character?.toLowerCase().includes("dyspnea") ?? false)
      );

      return {
        isMatch: hasChest && hasDyspnea,
        detectedSymptoms: ["Chest pain", "Breathlessness / Dyspnea"]
      };
    }
  },

  // 2. Chest pain + severe sweating (diaphoresis)
  {
    id: "rf_chest_sweating",
    name: "Chest Pain with Diaphoresis",
    enabled: true,
    severity: "emergency_code_red",
    priorityReason: "Potential emergency symptoms reported — urgent clinical assessment recommended.",
    triggerSymptoms: ["Chest pain", "Cold sweats / Diaphoresis"],
    patientAlertHi: "⚠️ कृपया तुरंत अस्पताल के कर्मचारियों से संपर्क करें। आपातकालीन ट्राइएज की ओर बढ़ें।",
    patientAlertEn: "⚠️ Please contact hospital staff immediately. Proceed to Emergency Triage.",
    evaluate: (history, complaints = []) => {
      const hasChest = complaints.some(c => c.anatomicalRegion === "chest_heart_lungs" || c.id === "chest_pain") ||
        (history?.chiefComplaint?.toLowerCase().includes("chest") ?? false);

      const hasSweat = history?.associatedSymptoms?.some(s => /cold sweat|sweats|diaphoresis|pasina/i.test(s)) ?? false;

      return {
        isMatch: hasChest && hasSweat,
        detectedSymptoms: ["Chest pain", "Severe cold sweats (Diaphoresis)"]
      };
    }
  },

  // 3. Chest pain + fainting (syncope)
  {
    id: "rf_chest_syncope",
    name: "Chest Pain with Syncope",
    enabled: true,
    severity: "emergency_code_red",
    priorityReason: "Potential emergency symptoms reported — urgent clinical assessment recommended.",
    triggerSymptoms: ["Chest pain", "Fainting / Syncope"],
    patientAlertHi: "⚠️ कृपया तुरंत अस्पताल के कर्मचारियों से संपर्क करें। आपातकालीन ट्राइएज की ओर बढ़ें।",
    patientAlertEn: "⚠️ Please contact hospital staff immediately. Proceed to Emergency Triage.",
    evaluate: (history, complaints = []) => {
      const hasChest = complaints.some(c => c.anatomicalRegion === "chest_heart_lungs" || c.id === "chest_pain") ||
        (history?.chiefComplaint?.toLowerCase().includes("chest") ?? false);

      const hasSyncope = (history?.associatedSymptoms?.some(s => /faint|syncope|behosh|collapse/i.test(s)) ?? false) ||
        (history?.character?.toLowerCase().includes("syncope") ?? false);

      return {
        isMatch: hasChest && hasSyncope,
        detectedSymptoms: ["Chest pain", "Fainting / Transient Loss of Consciousness"]
      };
    }
  },

  // 4. Sudden weakness + speech difficulty / Thunderclap headache
  {
    id: "rf_neuro_weakness_speech",
    name: "Sudden Focal Neurological Symptoms",
    enabled: true,
    severity: "emergency_code_red",
    priorityReason: "Potential emergency symptoms reported — urgent clinical assessment recommended.",
    triggerSymptoms: ["Sudden weakness", "Speech difficulty"],
    patientAlertHi: "⚠️ कृपया तुरंत अस्पताल के कर्मचारियों से संपर्क करें। आपातकालीन ट्राइएज की ओर बढ़ें।",
    patientAlertEn: "⚠️ Please contact hospital staff immediately. Proceed to Emergency Triage.",
    evaluate: (history, complaints = []) => {
      const hasNeuro = complaints.some(c => c.anatomicalRegion === "head_brain" || c.id === "headache") ||
        (history?.chiefComplaint?.toLowerCase().includes("head") ?? false);

      const hasWeaknessOrSpeech = history?.associatedSymptoms?.some(s => /speech|bolne|weakness|kamzori|facial|sunn/i.test(s)) ?? false;
      const isThunderclap = history?.onset?.toLowerCase().includes("thunderclap") ?? false;
      const isSevereHeadache = (history?.severity ?? 0) >= 9 || (history?.onset?.toLowerCase().includes("sudden") && (history?.severity ?? 0) >= 8);

      return {
        isMatch: (hasNeuro && (hasWeaknessOrSpeech || isSevereHeadache)) || isThunderclap,
        detectedSymptoms: isThunderclap || isSevereHeadache 
          ? ["Sudden thunderclap / Severe headache"]
          : ["Sudden focal weakness / Speech difficulty"]
      };
    }
  },

  // 5. Severe abdominal pain + fainting
  {
    id: "rf_abd_syncope",
    name: "Severe Abdominal Pain with Syncope",
    enabled: true,
    severity: "emergency_code_red",
    priorityReason: "Potential emergency symptoms reported — urgent clinical assessment recommended.",
    triggerSymptoms: ["Severe abdominal pain", "Fainting / Collapse"],
    patientAlertHi: "⚠️ कृपया तुरंत अस्पताल के कर्मचारियों से संपर्क करें। आपातकालीन ट्राइएज की ओर बढ़ें।",
    patientAlertEn: "⚠️ Please contact hospital staff immediately. Proceed to Emergency Triage.",
    evaluate: (history, complaints = []) => {
      const hasAbd = complaints.some(c => c.anatomicalRegion === "stomach_abdomen" || c.id === "abdominal_pain") ||
        (history?.chiefComplaint?.toLowerCase().includes("abdomen") ?? false) ||
        (history?.chiefComplaint?.toLowerCase().includes("stomach") ?? false);

      const isSevere = (history?.severity ?? 0) >= 7 || complaints.some(c => c.severity >= 7);
      const hasFaintingOrBleed = history?.associatedSymptoms?.some(s => /faint|syncope|behosh|bleed|blood/i.test(s)) ?? false;

      return {
        isMatch: hasAbd && isSevere && hasFaintingOrBleed,
        detectedSymptoms: ["Severe abdominal pain", "Fainting / Possible internal bleed"]
      };
    }
  },

  // 6. Severe breathing difficulty
  {
    id: "rf_severe_dyspnea",
    name: "Severe Acute Respiratory Distress",
    enabled: true,
    severity: "emergency_code_red",
    priorityReason: "Potential emergency symptoms reported — urgent clinical assessment recommended.",
    triggerSymptoms: ["Severe breathlessness", "Stridor / Gasping"],
    patientAlertHi: "⚠️ कृपया तुरंत अस्पताल के कर्मचारियों से संपर्क करें। आपातकालीन ट्राइएज की ओर बढ़ें।",
    patientAlertEn: "⚠️ Please contact hospital staff immediately. Proceed to Emergency Triage.",
    evaluate: (history) => {
      const hasSevereDyspnea = history?.associatedSymptoms?.some(s => /severe dyspnea|stridor|gasping/i.test(s)) ?? false;
      const hasHemoptysis = history?.character?.toLowerCase().includes("hemoptysis") || history?.character?.toLowerCase().includes("blood") || false;

      return {
        isMatch: hasSevereDyspnea || hasHemoptysis,
        detectedSymptoms: hasHemoptysis ? ["Hemoptysis (Coughing blood)"] : ["Severe respiratory distress / Stridor"]
      };
    }
  }
];

export class ConfigurableRedFlagEngine {
  private rules: RedFlagRuleDefinition[];

  constructor(customRules?: RedFlagRuleDefinition[]) {
    this.rules = customRules || DEFAULT_RED_FLAG_RULES;
  }

  public getRules(): RedFlagRuleDefinition[] {
    return this.rules;
  }

  public setRuleStatus(ruleId: string, enabled: boolean): void {
    const r = this.rules.find(rule => rule.id === ruleId);
    if (r) r.enabled = enabled;
  }

  public evaluate(
    sessionId: string,
    history?: Partial<ControlledClinicalHistory>,
    complaints: Complaint[] = []
  ): {
    hasEmergency: boolean;
    redFlags: RedFlag[];
    triggeredRules: RedFlagRuleDefinition[];
    detectedSymptoms: string[];
    patientAlert: { hi: string; en: string };
    doctorAlert: {
      badge: string;
      reason: string;
      symptoms: string[];
    };
  } {
    const redFlags: RedFlag[] = [];
    const triggeredRules: RedFlagRuleDefinition[] = [];
    const detectedSymptomsSet = new Set<string>();

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      const evalResult = rule.evaluate(history, complaints);
      if (evalResult.isMatch) {
        triggeredRules.push(rule);
        evalResult.detectedSymptoms.forEach(s => detectedSymptomsSet.add(s));

        redFlags.push({
          id: `rf-${Date.now()}-${rule.id}`,
          sessionId,
          severity: rule.severity,
          condition: rule.name,
          clinicalRationale: rule.priorityReason,
          triggeredAt: Date.now(),
          acknowledged: false
        });
      }
    }

    const hasEmergency = redFlags.some(f => f.severity === "emergency_code_red");
    const detectedSymptoms = Array.from(detectedSymptomsSet);

    return {
      hasEmergency,
      redFlags,
      triggeredRules,
      detectedSymptoms,
      patientAlert: {
        hi: "⚠️ कृपया तुरंत अस्पताल के कर्मचारियों से संपर्क करें। आपातकालीन ट्राइएज की ओर बढ़ें।",
        en: "⚠️ Please contact hospital staff immediately. Proceed to Emergency Triage."
      },
      doctorAlert: {
        badge: "🚨 PRIORITY PATIENT",
        reason: "Potential emergency symptoms reported — urgent clinical assessment recommended.",
        symptoms: detectedSymptoms
      }
    };
  }
}
