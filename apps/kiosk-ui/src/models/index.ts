/**
 * MediKiosk Core Domain Models
 * SIH26047 - Patient Case-Taking Software
 * 
 * Standards Compliant: ABDM / FHIR R4 Ready, AYUSH Dashavidha Pariksha
 */

// ==========================================
// 1. Patient Model
// ==========================================
export interface PatientVitals {
  bp?: string;           // e.g. "120/80 mmHg"
  pulse?: number;        // e.g. 74 bpm
  temp?: number;         // e.g. 98.4 F
  spO2?: number;         // e.g. 99%
  respiratoryRate?: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F" | "O";
  abhaId?: string;       // e.g. "91-8842-1923-7712"
  mobile: string;        // e.g. "+91 98451 23412"
  address?: string;
  vitals?: PatientVitals;
  registeredAt: number;
}

// ==========================================
// 2. Intake Session Model
// ==========================================
export interface Session {
  id: string;
  patientId: string;
  kioskId: string;
  language: string;      // "hi" | "en" | "mr" | "gu" | "bn" | "ta"
  status: "active" | "completed" | "abandoned" | "transferred_to_triage";
  currentStep: number;   // 1: Login/ID, 2: Complaint, 3: Document, 4: Summary
  startedAt: number;
  completedAt?: number;
}

// ==========================================
// 3. Complaint Model (SOCRATES + Anatomical)
// ==========================================
export interface Complaint {
  id: string;
  anatomicalRegion: string; // e.g. "head_brain", "chest_heart_lungs", etc.
  labelHi: string;
  labelEn: string;
  snomedCt?: string;        // SNOMED-CT Concept ID
  severity: number;         // 0-10 on Wong-Baker FACES
  duration?: string;        // e.g. "2 Days", "3 Weeks"
  onset?: "sudden" | "gradual" | "recurrent";
  character?: string;       // e.g. "Throbbing", "Burning", "Sharp", "Dull ache"
  radiation?: string;       // e.g. "Radiating to left arm/jaw"
  associatedSymptoms?: string[];
  aggravatingFactors?: string[];
  relievingFactors?: string[];
}

// ==========================================
// 4. Question Model (Adaptive Engine)
// ==========================================
export interface QuestionOption {
  id: string;
  labelHi: string;
  labelEn: string;
  icon?: string;
  value: string | number | boolean;
  triggersRedFlag?: boolean;
}

export interface Question {
  id: string;
  category: "triage" | "hpi" | "ayush" | "ros" | "lifestyle";
  text: {
    hi: string;
    en: string;
    [lang: string]: string;
  };
  audioPromptText?: string;
  type: "single_choice" | "multi_choice" | "scale" | "voice" | "boolean";
  options?: QuestionOption[];
  isAdaptive?: boolean;
  triggerComplaintId?: string;
}

// ==========================================
// 5. Answer Model
// ==========================================
export interface Answer {
  questionId: string;
  sessionId: string;
  selectedOptionIds?: string[];
  freeText?: string;
  numericValue?: number;
  audioTranscript?: string;
  confidence?: number;
  answeredAt: number;
}

export type ConsultationType = "modern" | "ayurveda";

export interface AyushAssessment {
  prakriti: string;         // "Vata" | "Pitta" | "Kapha" | "Vata-Pitta" etc.
  vikriti: string;          // Current doshic morbidity (e.g. Vata-Pitta Vriddhi)
  sara: string;             // Dhatu Sarata (e.g. Rakta-Meda Sara, Madhyama)
  samhanana: string;        // Body compactness (e.g. Susamhata, Madhyama, Hina)
  pramana: string;          // Body stature/proportions (e.g. Anuroopa, Madhyama)
  satmya: string;           // Habituation & adaptability (e.g. Sarva-rasa, Madhyama)
  sattva: string;           // Mental endurance & resilience (e.g. Pravara, Madhyama, Avara)
  aharaShakti: string;      // Food intake & digestive capacity (e.g. Abhyavaharana & Jarana)
  vyayamaShakti: string;    // Physical endurance (e.g. Pravara, Madhyama, Avara)
  vaya: string;             // Age category (e.g. Madhyama, Bala, Vriddha)
  ahara: string;            // Dietary habits (e.g. Tikshna-Katu rasa, Ushna)
  vihara: string;           // Lifestyle & daily conduct (e.g. Ratri-jagarana, sedentary)
  agni?: string;            // "Samagni" | "Vishamagni" | "Tikshnagni" | "Mandagni"
  bala?: string;            // "Pravara" (High) | "Madhyama" (Medium) | "Avara" (Low)
  koshtha?: string;         // "Mridu" | "Madhyama" | "Krura" (Bowel habit)
}

export type ClinicalFactStatus = "KNOWN" | "DENIED" | "NOT_ASKED" | "UNKNOWN" | "DECLINED";

export interface ClinicalFact<T> {
  status: ClinicalFactStatus;
  value?: T;
  source?: "voice" | "touch" | "text" | "document" | "doctor";
  confidence?: number;
  capturedAt?: number;
}

export interface CanonicalClinicalHistory {
  chiefComplaint: ClinicalFact<string>;
  onset: ClinicalFact<string>;
  duration: ClinicalFact<string>;
  location: ClinicalFact<string>;
  severity: ClinicalFact<number>;
  character: ClinicalFact<string>;
  radiation: ClinicalFact<string>;
  aggravatingFactors: ClinicalFact<string[]>;
  relievingFactors: ClinicalFact<string[]>;
  associatedSymptoms: ClinicalFact<string[]>;
  pastMedicalHistory: ClinicalFact<string[]>;
  pastSurgicalHistory: ClinicalFact<string[]>;
  medications: ClinicalFact<string[]>;
  allergies: ClinicalFact<string[]>;
  familyHistory: ClinicalFact<string[]>;
  personalHistory: {
    diet: ClinicalFact<string>;
    smoking: ClinicalFact<string>;
    alcohol: ClinicalFact<string>;
    sleep: ClinicalFact<string>;
    bowelBladder: ClinicalFact<string>;
  };
  investigations: ClinicalFact<string[]>;
  otherRelevantInformation: ClinicalFact<string>;
}

export interface PatientSessionMetadata {
  startedAt: number;
  completedAt?: number;
  kioskId: string;
  userAgent?: string;
}

export interface PatientSession {
  sessionId: string;
  patient: Patient;
  preferredLanguage: string; // "hi" | "en" | "mr" | "gu" | "bn" | "ta"
  voiceLanguage: string;     // "hi-IN" | "en-IN" | "hinglish" | "mr-IN" | "gu-IN" | "bn-IN" | "ta-IN"
  consultationType: ConsultationType;
  complaints: Complaint[];
  clinicalHistory: CanonicalClinicalHistory;
  ayushAssessment?: AyushAssessment;
  documents: MedicalDocument[];
  redFlags: RedFlag[];
  clinicalSummary?: ClinicalSummary;
  doctorReview?: DoctorReview;
  consent: {
    granted: boolean;
    timestamp: number;
  };
  metadata: PatientSessionMetadata;
}

export function createDefaultCanonicalHistory(): CanonicalClinicalHistory {
  const notAsked = <T>(): ClinicalFact<T> => ({ status: "NOT_ASKED" });
  return {
    chiefComplaint: notAsked<string>(),
    onset: notAsked<string>(),
    duration: notAsked<string>(),
    location: notAsked<string>(),
    severity: notAsked<number>(),
    character: notAsked<string>(),
    radiation: notAsked<string>(),
    aggravatingFactors: notAsked<string[]>(),
    relievingFactors: notAsked<string[]>(),
    associatedSymptoms: notAsked<string[]>(),
    pastMedicalHistory: notAsked<string[]>(),
    pastSurgicalHistory: notAsked<string[]>(),
    medications: notAsked<string[]>(),
    allergies: notAsked<string[]>(),
    familyHistory: notAsked<string[]>(),
    personalHistory: {
      diet: notAsked<string>(),
      smoking: notAsked<string>(),
      alcohol: notAsked<string>(),
      sleep: notAsked<string>(),
      bowelBladder: notAsked<string>(),
    },
    investigations: notAsked<string[]>(),
    otherRelevantInformation: notAsked<string>(),
  };
}

export function createEmptyPatientSession(patientId?: string): PatientSession {
  const now = Date.now();
  const id = patientId || `pat-${now}`;
  return {
    sessionId: `sess-${now}`,
    patient: {
      id,
      name: "New Patient",
      age: 30,
      gender: "M",
      mobile: "+91 90000 00000",
      registeredAt: now,
    },
    preferredLanguage: "hi",
    voiceLanguage: "hi-IN",
    consultationType: "modern",
    complaints: [],
    clinicalHistory: createDefaultCanonicalHistory(),
    documents: [],
    redFlags: [],
    consent: {
      granted: true,
      timestamp: now,
    },
    metadata: {
      startedAt: now,
      kioskId: "kiosk-station-01",
    },
  };
}

export interface ClinicalHistory {
  id: string;
  patientId: string;
  sessionId: string;
  chiefComplaints: Complaint[];
  hpi: string;              // AI-generated draft narrative
  pastMedicalHistory?: string[];
  medicationHistory?: string[];
  allergyHistory?: string[];
  familyHistory?: string[];
  ros?: Record<string, boolean>; // Review of systems
  ayushAssessment?: AyushAssessment;
  
  // Mandatory AI Governance Fields
  isAiDraft: boolean;       // ALWAYS true until physician review
  draftDisclaimer: string;  // "AI-Assisted Draft — Physician Verification Required"
  generatedAt: number;
}

// ==========================================
// 7. Medical Document Model
// ==========================================
export interface MedicalDocument {
  id: string;
  patientId: string;
  sessionId: string;
  documentType: "prescription" | "lab_report" | "discharge_summary" | "imaging" | "other";
  fileName?: string;
  fileUrl?: string;
  previewUrl?: string;
  uploadedAt: number;
  status: "pending" | "processing" | "completed" | "failed";
  ocrEngine?: string;
  confidenceScore?: number;
}

// ==========================================
// 8. Extracted Medical Entity Model (NER)
// ==========================================
export interface ExtractedMedicalEntity {
  id: string;
  documentId?: string;
  category: "medication" | "lab_biomarker" | "diagnosis" | "vital" | "procedure";
  name: string;
  dosage?: string;          // e.g. "500mg", "3g"
  frequency?: string;       // e.g. "OD", "BD", "TDS", "HS"
  route?: string;           // e.g. "Oral", "Topical"
  note?: string;            // e.g. "with warm water", "empty stomach"
  value?: string;           // e.g. "168/98 mmHg", "8.4%"
  referenceRange?: string;  // e.g. "70 – 100 mg/dL"
  abnormalFlag?: "normal" | "high" | "low" | "critical";
  confidence: number;       // 0.0 to 1.0
  isVerifiedByDoctor: boolean;
}

// ==========================================
// 9. Red Flag Model
// ==========================================
export interface RedFlag {
  id: string;
  sessionId: string;
  severity: "emergency_code_red" | "urgent_amber" | "routine_green";
  condition: string;
  clinicalRationale: string;
  triggeredAt: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

// ==========================================
// 10. Clinical Summary Model
// ==========================================
export interface ClinicalSummary {
  id: string;
  patientId: string;
  sessionId: string;
  tokenNumber: number;
  assignedRoom: string;
  assignedDepartment: string;
  estimatedWaitMinutes: number;
  
  // Clinical Components
  hpiNarrative: string;
  chiefComplaints: Complaint[];
  extractedMedications: ExtractedMedicalEntity[];
  flaggedLabs: ExtractedMedicalEntity[];
  ayushSummary?: AyushAssessment;
  redFlags: RedFlag[];
  
  // Mandatory AI Governance Fields
  isAiDraft: boolean;       // ALWAYS true until physician review
  aiDisclaimer: string;     // "AI-Assisted Draft — Not a clinical diagnosis. Physician review and sign-off required."
  status: "ai_draft" | "physician_reviewed" | "physician_amended" | "physician_rejected";
  
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
}

// ==========================================
// 11. Doctor Review Model
// ==========================================
export interface DoctorReview {
  id: string;
  summaryId: string;
  doctorId: string;
  doctorName: string;
  action: "approved" | "amended" | "rejected";
  originalHpi: string;
  amendedHpi?: string;
  clinicalNotes?: string;
  reviewedAt: number;
  pushedToAbdm: boolean;
  abdmTransactionId?: string;
}

// ==========================================
// 12. Consent Model (DISHA & ABDM Compliance)
// ==========================================
export interface ConsentScope {
  intakeHistory: boolean;
  documentOcr: boolean;
  physicianSharing: boolean;
  abdmRecordLinkage: boolean;
}

export interface Consent {
  id: string;
  patientId: string;
  sessionId: string;
  scope: ConsentScope;
  language: string;
  audioConsentVerified: boolean;
  grantedAt: number;
  kioskId: string;
}

// ==========================================
// 13. Medical Timeline Event Model
// ==========================================
export interface MedicalTimelineEvent {
  id: string;
  date: string;
  type: "visit" | "lab" | "admission" | "prescription";
  title: string;
  facility: string;
  details: string;
  doctor?: string;
  status?: string;
}
