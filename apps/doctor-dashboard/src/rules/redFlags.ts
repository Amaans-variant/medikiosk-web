import { Complaint, RedFlag } from "../models";

export interface RedFlagRule {
  id: string;
  conditionName: string;
  severity: "emergency_code_red" | "urgent_amber" | "routine_green";
  rationale: string;
  check: (complaints: Complaint[], vitals?: { bp?: string; temp?: number }) => boolean;
}

export const RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: "rf-cardiac",
    conditionName: "Suspected Acute Coronary Syndrome",
    severity: "emergency_code_red",
    rationale: "Chest pain with high severity or dyspnea indicates potential cardiac ischemia.",
    check: (complaints) => {
      const chest = complaints.find(c => c.anatomicalRegion === "chest_heart_lungs");
      return !!(chest && chest.severity >= 7);
    }
  },
  {
    id: "rf-neuro",
    conditionName: "Acute Neurological Deficit (Stroke/CVA)",
    severity: "emergency_code_red",
    rationale: "Severe sudden headache with dizziness or numbness warrants immediate neuro triage.",
    check: (complaints) => {
      const head = complaints.find(c => c.anatomicalRegion === "head_brain");
      return !!(head && head.severity >= 9);
    }
  },
  {
    id: "rf-sepsis",
    conditionName: "Hyperpyrexia / Systemic Infection",
    severity: "urgent_amber",
    rationale: "High fever accompanied by severe systemic distress.",
    check: (complaints) => {
      const fever = complaints.find(c => c.anatomicalRegion === "fever_vitals");
      return !!(fever && fever.severity >= 8);
    }
  }
];

export function evaluateRedFlags(sessionId: string, complaints: Complaint[]): RedFlag[] {
  const flags: RedFlag[] = [];
  for (const rule of RED_FLAG_RULES) {
    if (rule.check(complaints)) {
      flags.push({
        id: `rf-${Date.now()}-${rule.id}`,
        sessionId,
        severity: rule.severity,
        condition: rule.conditionName,
        clinicalRationale: rule.rationale,
        triggeredAt: Date.now(),
        acknowledged: false
      });
    }
  }
  return flags;
}
