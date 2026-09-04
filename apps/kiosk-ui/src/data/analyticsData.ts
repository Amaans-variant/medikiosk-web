export interface AnalyticsKpi {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  change: string;
  isPositive: boolean;
  benchmark: string;
  description: string;
  isSimulation: boolean;
}

export interface WorkloadComparison {
  dimension: string;
  manualBefore: string;
  aiAfter: string;
  improvement: string;
  detail: string;
}

export interface DepartmentThroughput {
  dept: string;
  stream: "ayush" | "modern";
  patients: number;
  avgIntakeMin: number;
  avgDocReviewMin: number;
  redFlags: number;
  docCorrectionRate: number; // percentage
}

export interface LanguageUsageStat {
  language: string;
  percentage: number;
  count: number;
  voiceUsagePct: number;
}

export interface CommonComplaintStat {
  category: string;
  count: number;
  pct: number;
  avgSeverity: number;
  redFlagCount: number;
}

export interface TimeSavedModel {
  patientsProcessed: number;
  manualMinutesPerPatient: number; // e.g. 9.5 mins
  aiDocReviewMinutesPerPatient: number; // e.g. 2.2 mins
  totalHoursSaved: number;
  doctorCapacityGainPct: number;
  disclaimer: string;
}

// 1. Core Prototype KPIs (Explicitly marked as Prototype Demo Data)
export const PROTOTYPE_KPIS: Record<"today" | "week" | "month", AnalyticsKpi[]> = {
  today: [
    {
      id: "patients_processed",
      label: "Patients Processed",
      value: "148",
      unit: "patients",
      change: "+18%",
      isPositive: true,
      benchmark: "vs 125 daily avg",
      description: "Total patient clinical histories taken via Kiosks",
      isSimulation: true,
    },
    {
      id: "avg_intake_time",
      label: "Avg. Intake Time",
      value: "3.6",
      unit: "mins",
      change: "-62%",
      isPositive: true,
      benchmark: "vs 9.5m manual",
      description: "Average patient time at kiosk (voice + touch)",
      isSimulation: true,
    },
    {
      id: "doc_review_time",
      label: "Doctor Review Time",
      value: "1.9",
      unit: "mins",
      change: "-76%",
      isPositive: true,
      benchmark: "vs 8.0m manual",
      description: "Physician time spent reading & confirming pre-intake HPI",
      isSimulation: true,
    },
    {
      id: "history_completion_rate",
      label: "History Completed",
      value: "94.6",
      unit: "%",
      change: "+3.2%",
      isPositive: true,
      benchmark: "Target: >90%",
      description: "Intakes with all 15 clinical dimensions fulfilled",
      isSimulation: true,
    },
    {
      id: "docs_digitized",
      label: "Documents Digitized",
      value: "112",
      unit: "files",
      change: "+24%",
      isPositive: true,
      benchmark: "96.2% OCR confidence",
      description: "Prescriptions & diagnostic lab reports scanned",
      isSimulation: true,
    },
    {
      id: "red_flags_caught",
      label: "Red-Flag Alerts",
      value: "6",
      unit: "cases",
      change: "100%",
      isPositive: true,
      benchmark: "0 missed emergencies",
      description: "Critical emergency symptom combinations routed to Triage",
      isSimulation: true,
    },
    {
      id: "doc_correction_rate",
      label: "Doctor Amendment Rate",
      value: "12.8",
      unit: "%",
      change: "-2.1%",
      isPositive: true,
      benchmark: "87.2% accepted directly",
      description: "Sessions where doctor modified AI draft before signing",
      isSimulation: true,
    },
    {
      id: "incomplete_dropout_rate",
      label: "Incomplete / Dropout",
      value: "5.4",
      unit: "%",
      change: "-1.8%",
      isPositive: true,
      benchmark: "Assisted by OPD nurse",
      description: "Kiosk sessions requiring manual front-desk takeover",
      isSimulation: true,
    },
  ],
  week: [
    {
      id: "patients_processed",
      label: "Patients Processed",
      value: "1,024",
      unit: "patients",
      change: "+22%",
      isPositive: true,
      benchmark: "vs 840 weekly baseline",
      description: "Total patient clinical histories taken via Kiosks",
      isSimulation: true,
    },
    {
      id: "avg_intake_time",
      label: "Avg. Intake Time",
      value: "3.7",
      unit: "mins",
      change: "-61%",
      isPositive: true,
      benchmark: "vs 9.5m manual",
      description: "Average patient time at kiosk (voice + touch)",
      isSimulation: true,
    },
    {
      id: "doc_review_time",
      label: "Doctor Review Time",
      value: "2.1",
      unit: "mins",
      change: "-74%",
      isPositive: true,
      benchmark: "vs 8.0m manual",
      description: "Physician time spent reading & confirming pre-intake HPI",
      isSimulation: true,
    },
    {
      id: "history_completion_rate",
      label: "History Completed",
      value: "93.8",
      unit: "%",
      change: "+4.1%",
      isPositive: true,
      benchmark: "Target: >90%",
      description: "Intakes with all 15 clinical dimensions fulfilled",
      isSimulation: true,
    },
    {
      id: "docs_digitized",
      label: "Documents Digitized",
      value: "748",
      unit: "files",
      change: "+31%",
      isPositive: true,
      benchmark: "95.8% OCR confidence",
      description: "Prescriptions & diagnostic lab reports scanned",
      isSimulation: true,
    },
    {
      id: "red_flags_caught",
      label: "Red-Flag Alerts",
      value: "34",
      unit: "cases",
      change: "100%",
      isPositive: true,
      benchmark: "0 missed emergencies",
      description: "Critical emergency symptom combinations routed to Triage",
      isSimulation: true,
    },
    {
      id: "doc_correction_rate",
      label: "Doctor Amendment Rate",
      value: "14.2",
      unit: "%",
      change: "-3.0%",
      isPositive: true,
      benchmark: "85.8% accepted directly",
      description: "Sessions where doctor modified AI draft before signing",
      isSimulation: true,
    },
    {
      id: "incomplete_dropout_rate",
      label: "Incomplete / Dropout",
      value: "6.2",
      unit: "%",
      change: "-2.4%",
      isPositive: true,
      benchmark: "Assisted by OPD nurse",
      description: "Kiosk sessions requiring manual front-desk takeover",
      isSimulation: true,
    },
  ],
  month: [
    {
      id: "patients_processed",
      label: "Patients Processed",
      value: "4,480",
      unit: "patients",
      change: "+28%",
      isPositive: true,
      benchmark: "vs 3,500 monthly baseline",
      description: "Total patient clinical histories taken via Kiosks",
      isSimulation: true,
    },
    {
      id: "avg_intake_time",
      label: "Avg. Intake Time",
      value: "3.8",
      unit: "mins",
      change: "-60%",
      isPositive: true,
      benchmark: "vs 9.5m manual",
      description: "Average patient time at kiosk (voice + touch)",
      isSimulation: true,
    },
    {
      id: "doc_review_time",
      label: "Doctor Review Time",
      value: "2.0",
      unit: "mins",
      change: "-75%",
      isPositive: true,
      benchmark: "vs 8.0m manual",
      description: "Physician time spent reading & confirming pre-intake HPI",
      isSimulation: true,
    },
    {
      id: "history_completion_rate",
      label: "History Completed",
      value: "94.2",
      unit: "%",
      change: "+5.0%",
      isPositive: true,
      benchmark: "Target: >90%",
      description: "Intakes with all 15 clinical dimensions fulfilled",
      isSimulation: true,
    },
    {
      id: "docs_digitized",
      label: "Documents Digitized",
      value: "3,120",
      unit: "files",
      change: "+38%",
      isPositive: true,
      benchmark: "95.5% OCR confidence",
      description: "Prescriptions & diagnostic lab reports scanned",
      isSimulation: true,
    },
    {
      id: "red_flags_caught",
      label: "Red-Flag Alerts",
      value: "142",
      unit: "cases",
      change: "100%",
      isPositive: true,
      benchmark: "0 missed emergencies",
      description: "Critical emergency symptom combinations routed to Triage",
      isSimulation: true,
    },
    {
      id: "doc_correction_rate",
      label: "Doctor Amendment Rate",
      value: "13.6",
      unit: "%",
      change: "-4.5%",
      isPositive: true,
      benchmark: "86.4% accepted directly",
      description: "Sessions where doctor modified AI draft before signing",
      isSimulation: true,
    },
    {
      id: "incomplete_dropout_rate",
      label: "Incomplete / Dropout",
      value: "5.8",
      unit: "%",
      change: "-3.1%",
      isPositive: true,
      benchmark: "Assisted by OPD nurse",
      description: "Kiosk sessions requiring manual front-desk takeover",
      isSimulation: true,
    },
  ],
};

// 2. BEFORE vs AFTER Workload Comparison Matrix
export const WORKLOAD_COMPARISONS: WorkloadComparison[] = [
  {
    dimension: "Physician Consultation History Taking",
    manualBefore: "7 – 10 minutes typing and asking repetitive questions",
    aiAfter: "1.5 – 2.5 minutes validating pre-structured HPI draft",
    improvement: "~75% time reduction per consult",
    detail: "Doctor starts consult with chief complaint, duration, onset, and Wong-Baker severity already documented.",
  },
  {
    dimension: "Ayurvedic Dashavidha Pariksha Intake",
    manualBefore: "12 – 15 minutes manual questionnaire across 12 dimensions",
    aiAfter: "Self-service voice/touch kiosk intake + instant Vaidya review",
    improvement: "~80% reduction in clinician data entry",
    detail: "Patients categorize Prakriti, Ahara Shakti, Agni, and Vihara independently before stepping into the chamber.",
  },
  {
    dimension: "Prescription & Lab Document OCR",
    manualBefore: "Manual inspection of paper slips; frequent missed contraindications",
    aiAfter: "2.2-second optical scan with automated NER drug and lab range extraction",
    improvement: "Instant digitization & reference flags",
    detail: "Automated extraction of brand names, frequencies, and abnormal lab biomarkers with OCR confidence scores.",
  },
  {
    dimension: "Emergency Red-Flag Symptom Detection",
    manualBefore: "Identified only after patient reaches doctor's desk in standard queue",
    aiAfter: "Instant rule-engine alert at Kiosk routing patient to Room 1 Crash Bay",
    improvement: "Zero delay in high-risk triage",
    detail: "Deterministic rules catch combinations (e.g. Chest pain + Breathlessness) before token wait begins.",
  },
  {
    dimension: "Multilingual Patient Accessibility",
    manualBefore: "Language barriers cause miscommunication; reliant on attendants",
    aiAfter: "Voice-driven Hindi, Hinglish, and English guided conversational intake",
    improvement: "Inclusive intake for all literacy levels",
    detail: "Speech synthesis reads questions aloud and transcribes patient responses with clarification prompts.",
  },
  {
    dimension: "Electronic Health Record (EHR / ABDM) Integration",
    manualBefore: "Unstructured handwritten doctor notes requiring late-night entry",
    aiAfter: "1-Click HL7 FHIR R4 Bundle generation and direct push to ABDM EMR",
    improvement: "100% structured FHIR compliance",
    detail: "Standardized SNOMED CT and LOINC clinical codes attached automatically upon doctor sign-off.",
  },
];

// 3. Departmental Breakdown
export const DEPARTMENT_STATS: DepartmentThroughput[] = [
  {
    dept: "Kayachikitsa (Internal Medicine)",
    stream: "ayush",
    patients: 412,
    avgIntakeMin: 4.1,
    avgDocReviewMin: 2.1,
    redFlags: 8,
    docCorrectionRate: 14.1,
  },
  {
    dept: "General Medicine OPD",
    stream: "modern",
    patients: 388,
    avgIntakeMin: 3.4,
    avgDocReviewMin: 1.8,
    redFlags: 14,
    docCorrectionRate: 11.8,
  },
  {
    dept: "Shalakya Tantra (ENT / Eye / Head)",
    stream: "ayush",
    patients: 226,
    avgIntakeMin: 3.5,
    avgDocReviewMin: 1.9,
    redFlags: 4,
    docCorrectionRate: 12.4,
  },
  {
    dept: "Cardiology & Chest Triage",
    stream: "modern",
    patients: 184,
    avgIntakeMin: 3.2,
    avgDocReviewMin: 1.7,
    redFlags: 18,
    docCorrectionRate: 16.2,
  },
  {
    dept: "Shalya Tantra (Orthopedics & Spine)",
    stream: "ayush",
    patients: 214,
    avgIntakeMin: 3.9,
    avgDocReviewMin: 2.2,
    redFlags: 3,
    docCorrectionRate: 13.0,
  },
];

// 4. Language Preference Breakdown
export const LANGUAGE_STATS: LanguageUsageStat[] = [
  { language: "Hindi (हिंदी)", percentage: 58, count: 2598, voiceUsagePct: 76 },
  { language: "Hinglish (मिक्स बोली)", percentage: 24, count: 1075, voiceUsagePct: 82 },
  { language: "English", percentage: 12, count: 538, voiceUsagePct: 41 },
  { language: "Regional (Bengali / Marathi / Telugu)", percentage: 6, count: 269, voiceUsagePct: 88 },
];

// 5. Common Clinical Complaints Distribution
export const COMMON_COMPLAINTS: CommonComplaintStat[] = [
  { category: "Stomach Pain / Acid Reflux / GERD", count: 1254, pct: 28, avgSeverity: 6.2, redFlagCount: 12 },
  { category: "Joint Pain / Lumbar Stiffness", count: 985, pct: 22, avgSeverity: 6.8, redFlagCount: 4 },
  { category: "Fever / Headache / General Weakness", count: 896, pct: 20, avgSeverity: 5.4, redFlagCount: 6 },
  { category: "Cough / Breathing Discomfort", count: 806, pct: 18, avgSeverity: 7.1, redFlagCount: 24 },
  { category: "Chest Tightness / Palpitations", count: 539, pct: 12, avgSeverity: 7.9, redFlagCount: 38 },
];

// 6. Time Saved Mathematical Estimation Model
export function calculateTimeSaved(
  patientsCount: number,
  manualMinutes = 9.5,
  aiDocMinutes = 2.0
): TimeSavedModel {
  const manualTotalMin = patientsCount * manualMinutes;
  const aiTotalMin = patientsCount * aiDocMinutes;
  const savedMinutes = manualTotalMin - aiTotalMin;
  const totalHoursSaved = Math.round((savedMinutes / 60) * 10) / 10;
  const capacityGainPct = Math.round(((manualMinutes - aiDocMinutes) / manualMinutes) * 100);

  return {
    patientsProcessed: patientsCount,
    manualMinutesPerPatient: manualMinutes,
    aiDocReviewMinutesPerPatient: aiDocMinutes,
    totalHoursSaved,
    doctorCapacityGainPct: capacityGainPct,
    disclaimer:
      "Prototype Simulation Estimate: Calculated assuming average manual clinical case-taking duration of 9.5 minutes vs. MediKiosk doctor review duration of 2.0 minutes. Actual operational time savings depend on OPD volume and specialty.",
  };
}
