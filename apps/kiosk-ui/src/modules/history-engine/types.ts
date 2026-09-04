/**
 * Controlled Clinical History Schema & Types
 * SIH26047 - Ministry of Ayush / AIIA Clinical Intake
 */

export interface ControlledClinicalHistory {
  chiefComplaint: string;
  duration?: string;
  onset?: string;
  location?: string;
  severity?: number;
  character?: string;
  radiation?: string;
  aggravatingFactors?: string[];
  relievingFactors?: string[];
  associatedSymptoms?: string[];
  pastMedicalHistory?: string[];
  pastSurgicalHistory?: string[];
  medications?: string[];
  allergies?: string[];
  familyHistory?: string[];
  personalHistory?: string[];
  investigations?: string[];
  otherRelevantInformation?: string;
}

export interface QuestionChoice {
  id: string;
  labelHi: string;
  labelEn: string;
  icon?: string;
  extractedValue: Partial<ControlledClinicalHistory>;
  isRedFlagTrigger?: boolean;
  redFlagReason?: string;
}

export interface ClinicalInquiryQuestion {
  id: string;
  field: keyof ControlledClinicalHistory;
  promptHi: string;
  promptEn: string;
  audioPromptText: string;
  choices: QuestionChoice[];
  allowCustomText?: boolean;
  clarificationPromptHi?: string;
  clarificationPromptEn?: string;
}

export interface ComplaintPathway {
  complaintKey: string;
  titleHi: string;
  titleEn: string;
  canonicalName: string;
  mandatoryFields: (keyof ControlledClinicalHistory)[];
  optionalFields: (keyof ControlledClinicalHistory)[];
  questions: Record<string, ClinicalInquiryQuestion>;
  firstQuestionId: string;
  getNextQuestionId: (history: ControlledClinicalHistory, currentQuestionId: string) => string | null;
  checkRedFlags: (history: ControlledClinicalHistory) => Array<{ condition: string; rationale: string; severity: "emergency_code_red" | "urgent_amber" }>;
}

export interface HistoryEngineState {
  complaintKey: string;
  history: ControlledClinicalHistory;
  currentQuestion: ClinicalInquiryQuestion | null;
  isComplete: boolean;
  conversationLog: Array<{ sender: "kiosk" | "patient"; textHi: string; textEn: string; timestamp: number }>;
  detectedRedFlags: Array<{ condition: string; rationale: string; severity: "emergency_code_red" | "urgent_amber" }>;
  summaryDraft: string | null;
}
