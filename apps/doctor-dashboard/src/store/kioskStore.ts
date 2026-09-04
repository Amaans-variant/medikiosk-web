import { create } from "zustand";
import { 
  Complaint, 
  RedFlag, 
  ClinicalSummary, 
  Patient, 
  PatientVitals, 
  MedicalTimelineEvent,
  AyushAssessment,
  ConsultationType,
  PatientSession,
  createEmptyPatientSession
} from "@/models";
import { routePatientToOPD } from "@/rules/triageRules";
import { determineAyushProfile } from "@/rules/ayushRules";
import { RedFlagDetectionModule } from "@/modules/red-flags";
import { ClinicalSummaryGenerationModule } from "@/modules/summary-generation";
import { IntegrationModule } from "@/modules/integration";
import { PersistenceService } from "@/services/persistence/persistenceService";
import { ControlledClinicalHistory } from "@/modules/history-engine/types";

export interface Medication {
  id?: string;
  name: string;
  dose: string;
  frequency: string;
  note: string;
  confidence?: number;
  source?: 'ocr' | 'reported';
}

export interface LabValue {
  id?: string;
  test: string;
  value: string;
  range: string;
  flag: 'high' | 'low' | 'normal';
  confidence?: number;
}

export interface AuditLogEntry {
  timestamp: number;
  author: string;
  field: string;
  previousValue: string;
  newValue: string;
}

export interface PatientRecord {
  id: string;
  token: number;
  room: string;
  department: string;
  name: string;
  age: number;
  gender: string;
  abhaId: string;
  mobile: string;
  waitSince: number;
  consultationType: ConsultationType;
  vitals?: PatientVitals;
  complaint: {
    symptomLabel: string;
    anatomicalRegion?: string;
    duration?: string;
    severity?: number;
    onset?: string;
    character?: string;
    radiation?: string;
    associated?: string[];
    aggravatingFactors?: string[];
    relievingFactors?: string[];
  };
  ayushAssessment?: AyushAssessment;
  documents?: {
    scanned: boolean;
    medications: Medication[];
    labValues: LabValue[];
  };
  hpiOverride?: string;
  pastHistory?: {
    medical: string[];
    surgical: string[];
  };
  allergies?: string[];
  familyHistory?: string[];
  personalHistory?: {
    diet: string;
    smoking: string;
    alcohol: string;
    sleep: string;
    bowelBladder: string;
  };
  medicalTimeline?: MedicalTimelineEvent[];
  redFlags?: RedFlag[];
  clinicalSummary?: ClinicalSummary;
  reviewStatus: 'ai_draft' | 'doctor_verified' | 'doctor_rejected' | 'reinterview_requested';
  verifiedBy?: string;
  verifiedAt?: number;
  rejectionReason?: string;
  reinterviewNotes?: string;
  auditLogs?: AuditLogEntry[];
  status: 'waiting' | 'in-consult' | 'completed' | 'rejected' | 'reinterview' | 'pushed';
}

interface KioskState {
  activeView: 'kiosk' | 'physician' | 'analytics';
  language: string;
  preferredLanguage: string;
  voiceLanguage: string;

  // Accessibility & Demographic Modes
  easyView: boolean;
  highContrast: boolean;
  patientCategory: 'self' | 'assisted_minor' | 'assisted_elderly';

  // Canonical patient intake session
  activeSession: PatientSession;
  
  // Current in-progress intake session
  currentPatient: {
    name: string;
    age: number;
    gender: string;
    abhaId: string;
    mobile: string;
    consultationType: ConsultationType;
    complaintId: string;
    complaintLabel: string;
    complaintIds: string[];
    complaintLabels: string[];
    severity: number;
    duration: string;
    prakriti: string;
    ayushAssessment: Partial<AyushAssessment>;
    scannedDocs: {
      medications: Medication[];
      labValues: LabValue[];
    };
    complaintHistory?: {
      onset?: string;
      character?: string;
      radiation?: string;
      associatedSymptoms?: string[];
      aggravatingFactors?: string[];
      relievingFactors?: string[];
      summaryDraft?: string;
    };
  };

  // Shared OPD Queue
  queue: PatientRecord[];
  selectedPatientId: string | null;

  // Actions
  setView: (view: 'kiosk' | 'physician' | 'analytics') => void;
  setLanguage: (lang: string) => void;
  setVoiceLanguage: (voiceLang: string) => void;
  toggleEasyView: () => void;
  toggleHighContrast: () => void;
  setPatientCategory: (cat: 'self' | 'assisted_minor' | 'assisted_elderly') => void;
  setConsultationType: (type: ConsultationType) => void;
  setPatientDemographics: (demographics: Partial<KioskState['currentPatient']>) => void;
  setComplaint: (id: string, label: string) => void;
  toggleComplaint: (id: string, label: string) => void;
  setSeverity: (severity: number) => void;
  setAyushData: (prakriti: string) => void;
  setAyushAssessmentField: (field: keyof AyushAssessment, value: string) => void;
  setScannedDocuments: (meds: Medication[], labs: LabValue[]) => void;
  setComplaintHistoryDetails: (history: Partial<ControlledClinicalHistory>, summaryDraft?: string) => void;
  resetPatientSession: () => void;
  completeIntakeAndEnqueue: () => number;
  selectPatient: (id: string) => void;
  amendRecord: (id: string, hpi: string) => void;
  updatePatientRecord: (id: string, updates: Partial<PatientRecord>) => void;
  confirmPatient: (id: string, doctorName?: string) => void;
  rejectPatient: (id: string, reason: string) => void;
  requestReinterview: (id: string, notes: string) => void;
  pushToEmr: (id: string) => void;
  loadDemoScenario: (scenario: 1 | 2 | 3) => void;
  resetDemoEnvironment: () => void;
}

const SEED_QUEUE: PatientRecord[] = [
  {
    id: 'p-102',
    token: 42,
    room: 'Room 1 (Red Flag Emergency)',
    department: 'Cardiology Triage',
    name: 'Sunita Devi',
    age: 62,
    gender: 'F',
    abhaId: '91-4521-9981-4019',
    mobile: '+91 94120 44812',
    waitSince: Date.now() - 6 * 60 * 1000,
    consultationType: 'modern',
    vitals: {
      bp: '168/98 mmHg',
      pulse: 104,
      temp: 98.6,
      spO2: 93,
      respiratoryRate: 24
    },
    complaint: {
      symptomLabel: 'Chest tightness & Breathlessness',
      anatomicalRegion: 'chest_heart_lungs',
      duration: '2 Hours',
      severity: 8,
      onset: 'Sudden onset while climbing stairs',
      character: 'Crushing retrosternal tightness with heavy squeezing pressure',
      radiation: 'Radiating to left inner arm, shoulder blade, and lower jaw',
      associated: ['Severe cold sweats (Diaphoresis)', 'Dizziness', 'Mild nausea'],
      aggravatingFactors: ['Exertion', 'Deep inspiration'],
      relievingFactors: ['Rest (Minimal relief)']
    },
    documents: {
      scanned: true,
      medications: [
        { id: 'm1', name: 'Amlodipine', dose: '5mg', frequency: 'OD', note: 'morning, post-meal', confidence: 0.96, source: 'ocr' },
        { id: 'm2', name: 'Metformin HCl', dose: '500mg', frequency: 'BD', note: 'with meals', confidence: 0.94, source: 'ocr' },
        { id: 'm3', name: 'Atorvastatin', dose: '20mg', frequency: 'HS', note: 'at bedtime', confidence: 0.93, source: 'ocr' }
      ],
      labValues: [
        { id: 'l1', test: 'Blood Pressure', value: '168/98 mmHg', range: '120/80 mmHg', flag: 'high', confidence: 0.98 },
        { id: 'l2', test: 'Blood Glucose (R)', value: '194 mg/dL', range: '70 – 140 mg/dL', flag: 'high', confidence: 0.96 },
        { id: 'l3', test: 'Serum Creatinine', value: '1.1 mg/dL', range: '0.6 – 1.2 mg/dL', flag: 'normal', confidence: 0.94 }
      ]
    },
    pastHistory: {
      medical: ['Hypertension (6 years, on Tab Amlodipine)', 'Type 2 Diabetes Mellitus (8 years)', 'Dyslipidemia'],
      surgical: ['Tubal Ligation (1998)']
    },
    allergies: [
      'Penicillin (Cutaneous rash, facial angioedema risk)'
    ],
    familyHistory: [
      'Mother: Coronary Artery Disease with Acute MI at age 58',
      'Father: Ischemic Stroke at age 66'
    ],
    personalHistory: {
      diet: 'Vegetarian (High sodium diet)',
      smoking: 'Never smoker',
      alcohol: 'Non-drinker',
      sleep: 'Disturbed for past 2 nights due to orthopnea',
      bowelBladder: 'Regular bowel movements; no hematuria or dysuria'
    },
    medicalTimeline: [
      {
        id: 't-1',
        date: '2026-06-14',
        type: 'visit',
        title: 'Cardiology Follow-up OPD',
        facility: 'AIIMS Delhi - Outpatient Dept',
        details: 'Hypertension evaluation. BP recorded 142/88. Advised continuing Amlodipine 5mg OD.',
        doctor: 'Dr. V. Raman, MD'
      },
      {
        id: 't-2',
        date: '2025-11-20',
        type: 'lab',
        title: 'Comprehensive Metabolic Panel & Lipid Profile',
        facility: 'Dr. Lal PathLabs',
        details: 'HbA1c: 7.8% (Elevated), Fasting Glucose: 148 mg/dL, Total Cholesterol: 212 mg/dL, LDL: 136 mg/dL.',
        status: 'Abnormal'
      },
      {
        id: 't-3',
        date: '2024-03-10',
        type: 'admission',
        title: 'Emergency Inpatient Admission (Hypertensive Urgency)',
        facility: 'Safdarjung Hospital, New Delhi',
        details: 'Admitted for 72h with symptomatic BP 190/110 mmHg. IV Labetalol administered, stabilized and discharged.',
        doctor: 'Dr. S. K. Mehra'
      }
    ],
    redFlags: [
      {
        id: 'rf-102',
        sessionId: 'sess-102',
        severity: 'emergency_code_red',
        condition: 'Chest pain + breathlessness + severe sweating',
        clinicalRationale: 'Potential emergency symptoms reported — urgent clinical assessment recommended.',
        triggeredAt: Date.now() - 6 * 60 * 1000,
        acknowledged: false
      }
    ],
    reviewStatus: 'ai_draft',
    status: 'waiting'
  },
  {
    id: 'p-101',
    token: 41,
    room: 'Room 2 (Ayush OPD)',
    department: 'Kayachikitsa (Internal Medicine)',
    name: 'Ravi Kumar',
    age: 54,
    gender: 'M',
    abhaId: '91-8842-1923-7712',
    mobile: '+91 98451 23412',
    waitSince: Date.now() - 14 * 60 * 1000,
    consultationType: 'ayurveda',
    vitals: {
      bp: '128/82 mmHg',
      pulse: 76,
      temp: 98.4,
      spO2: 99,
      respiratoryRate: 16
    },
    complaint: {
      symptomLabel: 'Stomach Pain & Acid Reflux',
      anatomicalRegion: 'stomach_abdomen',
      duration: '3 Days',
      severity: 6,
      onset: 'Gradual onset, worsening after dinner',
      character: 'Burning epigastric pain with acid regurgitation and sour belching',
      radiation: 'Retrosternal radiation up to the throat',
      associated: ['Bloating', 'Loss of appetite', 'Morning nausea'],
      aggravatingFactors: ['Spicy food', 'Fried snacks', 'Late night meals'],
      relievingFactors: ['Cold milk', 'Antacid liquid']
    },
    ayushAssessment: {
      prakriti: 'Pitta-Vata',
      vikriti: 'Pitta-Vata Vriddhi (Amlapitta & Ushnata)',
      sara: 'Meda-Mamsa Sara (Moderate tissue reserves)',
      samhanana: 'Madhyama (Moderate physical compactness)',
      pramana: 'Anuroopa (Proportionate body stature)',
      satmya: 'Madhyama Satmya (Average tolerance)',
      sattva: 'Madhyama Sattva (Moderate psychological endurance)',
      aharaShakti: 'Tikshnagni (Strong food intake, rapid burning)',
      vyayamaShakti: 'Madhyama (Medium stamina)',
      vaya: 'Madhyama Vaya (54 years, adult stage)',
      ahara: 'Tikshna-Katu rasa pradhana (Spicy/oily foods, tea)',
      vihara: 'Ratri-jagarana (Late sleeping at 12:30 AM, sedentary work)',
      agni: 'Tikshnagni (Hyperactive / Acidic)',
      bala: 'Madhyama (Medium)',
      koshtha: 'Krura (Tendency to constipation)'
    },
    documents: {
      scanned: true,
      medications: [
        { id: 'm1', name: 'Sutshekhar Ras', dose: '125mg', frequency: 'BD', note: 'with honey', confidence: 0.95, source: 'ocr' },
        { id: 'm2', name: 'Avipattikar Churna', dose: '3g', frequency: 'HS', note: 'warm water', confidence: 0.96, source: 'ocr' },
        { id: 'm3', name: 'Pantoprazole', dose: '40mg', frequency: 'OD', note: 'empty stomach', confidence: 0.98, source: 'ocr' }
      ],
      labValues: [
        { id: 'l1', test: 'Serum Bilirubin', value: '1.4 mg/dL', range: '0.2 – 1.2 mg/dL', flag: 'high', confidence: 0.94 },
        { id: 'l2', test: 'SGPT/ALT', value: '48 U/L', range: '7 – 56 U/L', flag: 'normal', confidence: 0.96 }
      ]
    },
    pastHistory: {
      medical: ['Gastroesophageal Reflux Disease (GERD) - 3 years', 'Mild Fatty Liver Grade I'],
      surgical: ['Appendectomy (2012)']
    },
    allergies: [
      'No Known Drug Allergies (NKDA)'
    ],
    familyHistory: [
      'Father: Chronic Peptic Ulcer Disease',
      'Brother: Essential Hypertension'
    ],
    personalHistory: {
      diet: 'Non-Vegetarian (Spicy curries, irregular eating timings)',
      smoking: 'Ex-smoker (Quit in 2020 after 8 pack-years)',
      alcohol: 'Occasional social drinking (1-2 units/month)',
      sleep: '6 hours/night; frequent awakenings from reflux',
      bowelBladder: 'Koshtha: Krura; bowel movement every alternate day'
    },
    medicalTimeline: [
      {
        id: 't-1',
        date: '2026-01-18',
        type: 'visit',
        title: 'Kayachikitsa OPD Consultation',
        facility: 'All India Institute of Ayurveda (AIIA), New Delhi',
        details: 'Evaluated for Amlapitta (Hyperacidity). Prescribed Avipattikar Churna and Pitta-shamak diet chart.',
        doctor: 'Dr. P. Joshi, BAMS, MD (Ay)'
      },
      {
        id: 't-2',
        date: '2025-10-05',
        type: 'lab',
        title: 'Ultrasound Whole Abdomen',
        facility: 'Mahajan Imaging Center',
        details: 'USG findings: Diffuse Grade I hepatic steatosis (Fatty Liver). Gallbladder, pancreas, spleen normal. No gallstones.',
        status: 'Normal'
      },
      {
        id: 't-3',
        date: '2024-08-14',
        type: 'lab',
        title: 'Liver Function Test (LFT)',
        facility: 'Metropolis Healthcare',
        details: 'Serum Bilirubin: 1.3 mg/dL, SGOT: 38 U/L, SGPT: 44 U/L, Alkaline Phosphatase: 92 U/L.',
        status: 'Normal'
      }
    ],
    redFlags: [],
    reviewStatus: 'ai_draft',
    status: 'waiting'
  },
  {
    id: 'p-103',
    token: 39,
    room: 'Room 5 (Shalakya OPD)',
    department: 'Shalakya Tantra (ENT & Head)',
    name: 'Meera Patel',
    age: 29,
    gender: 'F',
    abhaId: '91-3144-8821-6502',
    mobile: '+91 97182 89012',
    waitSince: Date.now() - 48 * 60 * 1000,
    consultationType: 'ayurveda',
    vitals: {
      bp: '116/74 mmHg',
      pulse: 72,
      temp: 98.2,
      spO2: 99,
      respiratoryRate: 14
    },
    complaint: {
      symptomLabel: 'Unilateral Throbbing Headache',
      anatomicalRegion: 'head_brain',
      duration: '1 Day',
      severity: 5,
      onset: 'Gradual, started right fronto-temporal',
      character: 'Pulsating, throbbing hemicranial ache (Ardhavabhedaka)',
      associated: ['Photophobia', 'Phonophobia'],
      aggravatingFactors: ['Bright sunlight', 'Computer screens'],
      relievingFactors: ['Dark quiet room', 'Cold compress']
    },
    ayushAssessment: {
      prakriti: 'Pitta-Kapha',
      vikriti: 'Pitta-Vata Ardhavabhedaka',
      sara: 'Twak-Rakta Sara (Fair complexion, sensitive)',
      samhanana: 'Madhyama',
      pramana: 'Anuroopa',
      satmya: 'Sarva-rasa Satmya',
      sattva: 'Pravara Sattva',
      aharaShakti: 'Samagni (Balanced appetite)',
      vyayamaShakti: 'Madhyama',
      vaya: 'Madhyama Vaya (29y)',
      ahara: 'Lacto-Vegetarian, timely meals',
      vihara: 'Screen exposure > 9h, occasional Ratri-jagarana',
      agni: 'Samagni',
      bala: 'Madhyama',
      koshtha: 'Mridu'
    },
    documents: {
      scanned: true,
      medications: [
        { id: 'm1', name: 'Shirashoolavajra Ras', dose: '250mg', frequency: 'BD', note: 'with cow ghee', confidence: 0.96, source: 'ocr' },
        { id: 'm2', name: 'Naproxen', dose: '250mg', frequency: 'SOS', note: 'after food', confidence: 0.98, source: 'ocr' }
      ],
      labValues: []
    },
    pastHistory: {
      medical: ['Migraine without aura (4 years)'],
      surgical: ['None']
    },
    allergies: [
      'Sulfa drugs (Skin erythema & pruritus)'
    ],
    familyHistory: [
      'Mother: Migraine with aura'
    ],
    personalHistory: {
      diet: 'Lacto-Vegetarian',
      smoking: 'Never',
      alcohol: 'Never',
      sleep: 'Irregular (6 hours), daily screen exposure > 9h',
      bowelBladder: 'Normal'
    },
    medicalTimeline: [
      {
        id: 't-1',
        date: '2026-09-04',
        type: 'visit',
        title: 'Consultation Completed & Verified',
        facility: 'AIIA Shalakya OPD',
        details: 'Clinical intake verified by Dr. Anand Sharma. Commenced Nasya therapy (Anu Taila) and Pathyadi Kwath.',
        doctor: 'Dr. Anand Sharma, MD (Reg #DMC-49210)'
      },
      {
        id: 't-2',
        date: '2025-07-22',
        type: 'lab',
        title: 'Magnetic Resonance Imaging (MRI) Brain',
        facility: 'Fortis Healthcare',
        details: 'Brain MRI without contrast: Normal study. No intracranial mass, bleed, or vascular malformation.',
        status: 'Normal'
      }
    ],
    redFlags: [],
    reviewStatus: 'doctor_verified',
    verifiedBy: 'Dr. Anand Sharma, MD (Reg #DMC-49210)',
    verifiedAt: Date.now() - 40 * 60 * 1000,
    status: 'completed'
  },
  {
    id: 'p-104',
    token: 43,
    room: 'Room 3 (Shalya Tantra)',
    department: 'Shalya Tantra (Orthopedics / Spine)',
    name: 'Vikram Singh',
    age: 48,
    gender: 'M',
    abhaId: '91-6288-4491-1002',
    mobile: '+91 99201 88321',
    waitSince: Date.now() - 3 * 60 * 1000,
    consultationType: 'ayurveda',
    vitals: {
      bp: '134/86 mmHg',
      pulse: 80,
      temp: 98.5,
      spO2: 98,
      respiratoryRate: 18
    },
    complaint: {
      symptomLabel: 'Chronic Lower Back Pain with Lumbar Stiffness',
      anatomicalRegion: 'back_spine',
      duration: '3 Weeks',
      severity: 6,
      onset: 'Insidious, aggravated by prolonged sitting',
      character: 'Dull aching stiffness with morning tightness (Katigraha)',
      radiation: 'Radiation to right posterior thigh up to knee',
      associated: ['Difficulty standing upright after prolonged sitting'],
      aggravatingFactors: ['Forward bending', 'Lifting weights'],
      relievingFactors: ['Lying supine with knee flexion', 'Hot fomentation']
    },
    ayushAssessment: {
      prakriti: 'Vata',
      vikriti: 'Vata Vriddhi / Katigraha',
      sara: 'Mamsa-Asthi Sara (Moderate bone strength)',
      samhanana: 'Madhyama',
      pramana: 'Anuroopa',
      satmya: 'Madhyama',
      sattva: 'Madhyama',
      aharaShakti: 'Vishamagni',
      vyayamaShakti: 'Avara (Pain restricts movement)',
      vaya: 'Madhyama Vaya (48y)',
      ahara: 'Mixed, dry snacks',
      vihara: 'Prolonged sitting work, vehicle vibration',
      agni: 'Vishamagni',
      bala: 'Madhyama',
      koshtha: 'Madhyama'
    },
    documents: {
      scanned: true,
      medications: [
        { id: 'm1', name: 'Yograj Guggulu', dose: '500mg', frequency: 'BD', note: 'after food with warm water', confidence: 0.94, source: 'ocr' },
        { id: 'm2', name: 'Paracetamol', dose: '650mg', frequency: 'SOS', note: 'for severe ache', confidence: 0.97, source: 'ocr' }
      ],
      labValues: []
    },
    pastHistory: {
      medical: ['Lumbar disc desiccation L4-L5', 'Chronic mechanical back pain'],
      surgical: ['None']
    },
    allergies: [
      'No Known Drug Allergies (NKDA)'
    ],
    familyHistory: [
      'Father: Severe Lumbar Spondylosis'
    ],
    personalHistory: {
      diet: 'Mixed diet',
      smoking: 'Active smoker (4-5 bidis/day)',
      alcohol: 'Occasional',
      sleep: 'Interrupted by back pain when turning in bed',
      bowelBladder: 'Normal'
    },
    medicalTimeline: [
      {
        id: 't-1',
        date: '2026-02-12',
        type: 'visit',
        title: 'Panchakarma OPD Consultation',
        facility: 'AIIA Panchakarma Dept',
        details: 'Completed 7-day Kati Basti with Sahacharadi Taila. Moderate relief in stiffness reported.',
        doctor: 'Dr. M. K. Rao'
      },
      {
        id: 't-2',
        date: '2025-09-15',
        type: 'lab',
        title: 'Digital X-Ray Lumbosacral Spine (AP & Lateral)',
        facility: 'City Diagnostic Centre',
        details: 'Mild reduction of L4-L5 intervertebral disc space. Small marginal osteophytes noted.',
        status: 'Abnormal'
      }
    ],
    redFlags: [],
    reviewStatus: 'ai_draft',
    status: 'waiting'
  }
];

export const useKioskStore = create<KioskState>((set, get) => ({
  activeView: 'kiosk',
  language: 'hi',
  preferredLanguage: 'hi',
  voiceLanguage: 'hinglish',
  easyView: false,
  highContrast: false,
  patientCategory: 'self',
  activeSession: createEmptyPatientSession('p-101'),

  currentPatient: {
    name: 'Arjun Nair',
    age: 38,
    gender: 'M',
    abhaId: '91-7721-3914-1029',
    mobile: '+91 98112 39011',
    consultationType: 'ayurveda',
    complaintId: 'stomach_abdomen',
    complaintLabel: 'Stomach Pain & Acid Reflux / पेट दर्द व एसिडिटी',
    complaintIds: ['stomach_abdomen'],
    complaintLabels: ['Stomach Pain & Acid Reflux / पेट दर्द व एसिडिटी'],
    severity: 6,
    duration: '3 Days',
    prakriti: 'Pitta-Vata',
    ayushAssessment: {
      prakriti: 'Pitta-Vata',
      vikriti: 'Pitta Vriddhi (Amlapitta)',
      sara: 'Madhyama Sara',
      samhanana: 'Madhyama',
      pramana: 'Anuroopa',
      satmya: 'Madhyama Satmya',
      sattva: 'Madhyama Sattva',
      aharaShakti: 'Tikshnagni (Strong hunger, acidity)',
      vyayamaShakti: 'Madhyama',
      vaya: 'Madhyama Vaya',
      ahara: 'Tikshna-Katu (Spicy, fried foods)',
      vihara: 'Ratri-jagarana (Late sleeping)'
    },
    scannedDocs: {
      medications: [
        { name: 'Avipattikar Churna', dose: '3g', frequency: 'HS', note: 'warm water', confidence: 0.96, source: 'ocr' },
        { name: 'Sutshekhar Ras', dose: '125mg', frequency: 'BD', note: 'with honey', confidence: 0.94, source: 'ocr' },
      ],
      labValues: [
        { test: 'Serum Bilirubin', value: '1.2 mg/dL', range: '0.2 – 1.2 mg/dL', flag: 'normal', confidence: 0.95 },
        { test: 'SGPT/ALT', value: '38 U/L', range: '7 – 56 U/L', flag: 'normal', confidence: 0.96 },
      ],
    },
  },

  queue: SEED_QUEUE,
  selectedPatientId: 'p-101',

  setView: (view) => set({ activeView: view }),
  setLanguage: (lang) =>
    set((state) => ({
      language: lang,
      preferredLanguage: lang,
      activeSession: {
        ...state.activeSession,
        preferredLanguage: lang
      }
    })),
  setVoiceLanguage: (voiceLang) =>
    set((state) => ({
      voiceLanguage: voiceLang,
      activeSession: {
        ...state.activeSession,
        voiceLanguage: voiceLang
      }
    })),
  toggleEasyView: () => set((state) => ({ easyView: !state.easyView })),
  toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
  setPatientCategory: (cat) => set({ patientCategory: cat }),
  
  setConsultationType: (type) =>
    set((state) => ({
      currentPatient: {
        ...state.currentPatient,
        consultationType: type
      }
    })),

  setPatientDemographics: (demographics) =>
    set((state) => ({
      currentPatient: {
        ...state.currentPatient,
        ...demographics
      }
    })),

  setSeverity: (severity: number) =>
    set((state) => {
      const activeHist = { ...state.activeSession.clinicalHistory };
      activeHist.severity = {
        status: "KNOWN",
        value: severity,
        source: "touch",
        capturedAt: Date.now()
      };
      return {
        activeSession: {
          ...state.activeSession,
          clinicalHistory: activeHist
        },
        currentPatient: {
          ...state.currentPatient,
          severity
        }
      };
    }),

  setComplaint: (id, label) =>
    set((state) => ({
      currentPatient: {
        ...state.currentPatient,
        complaintId: id,
        complaintLabel: label,
        complaintIds: [id],
        complaintLabels: [label],
      },
    })),

  toggleComplaint: (id, label) =>
    set((state) => {
      const exists = state.currentPatient.complaintIds.includes(id);
      let newIds: string[];
      let newLabels: string[];

      if (exists) {
        if (state.currentPatient.complaintIds.length > 1) {
          newIds = state.currentPatient.complaintIds.filter((item) => item !== id);
          newLabels = state.currentPatient.complaintLabels.filter((item) => item !== label);
        } else {
          newIds = state.currentPatient.complaintIds;
          newLabels = state.currentPatient.complaintLabels;
        }
      } else {
        newIds = [...state.currentPatient.complaintIds, id];
        newLabels = [...state.currentPatient.complaintLabels, label];
      }

      // Update complaints array in activeSession
      const updatedComplaints = newIds.map((cId, idx) => ({
        id: cId,
        anatomicalRegion: cId,
        labelHi: newLabels[idx] || cId,
        labelEn: cId,
        severity: state.currentPatient.severity,
        duration: state.currentPatient.duration
      }));

      return {
        activeSession: {
          ...state.activeSession,
          complaints: updatedComplaints
        },
        currentPatient: {
          ...state.currentPatient,
          complaintId: newIds[0] || id,
          complaintLabel: newLabels.join(', '),
          complaintIds: newIds,
          complaintLabels: newLabels,
        },
      };
    }),

  setAyushData: (prakriti) =>
    set((state) => ({
      currentPatient: { 
        ...state.currentPatient, 
        prakriti,
        ayushAssessment: {
          ...state.currentPatient.ayushAssessment,
          prakriti
        }
      },
    })),

  setAyushAssessmentField: (field, value) =>
    set((state) => ({
      currentPatient: {
        ...state.currentPatient,
        ayushAssessment: {
          ...state.currentPatient.ayushAssessment,
          [field]: value
        }
      }
    })),

  setScannedDocuments: (meds, labs) =>
    set((state) => ({
      currentPatient: {
        ...state.currentPatient,
        scannedDocs: { medications: meds, labValues: labs },
      },
    })),

  setComplaintHistoryDetails: (history, summaryDraft) =>
    set((state) => {
      const activeHist = { ...state.activeSession.clinicalHistory };

      const setFact = <T>(key: string, val?: T) => {
        if (val !== undefined && val !== null && val !== "" && (!Array.isArray(val) || val.length > 0)) {
          (activeHist as Record<string, unknown>)[key] = {
            status: "KNOWN",
            value: val,
            source: "voice",
            capturedAt: Date.now()
          };
        }
      };

      setFact("duration", history.duration);
      setFact("onset", history.onset);
      setFact("location", history.location);
      setFact("severity", history.severity);
      setFact("character", history.character);
      setFact("radiation", history.radiation);
      setFact("associatedSymptoms", history.associatedSymptoms);
      setFact("aggravatingFactors", history.aggravatingFactors);
      setFact("relievingFactors", history.relievingFactors);
      setFact("pastMedicalHistory", history.pastMedicalHistory);

      return {
        activeSession: {
          ...state.activeSession,
          clinicalHistory: activeHist
        },
        currentPatient: {
          ...state.currentPatient,
          duration: history.duration || state.currentPatient.duration,
          severity: history.severity ?? state.currentPatient.severity,
          complaintHistory: {
            ...state.currentPatient.complaintHistory,
            onset: history.onset || state.currentPatient.complaintHistory?.onset,
            character: history.character || state.currentPatient.complaintHistory?.character,
            radiation: history.radiation || state.currentPatient.complaintHistory?.radiation,
            associatedSymptoms: history.associatedSymptoms?.length
              ? history.associatedSymptoms
              : state.currentPatient.complaintHistory?.associatedSymptoms,
            aggravatingFactors: history.aggravatingFactors?.length
              ? history.aggravatingFactors
              : state.currentPatient.complaintHistory?.aggravatingFactors,
            relievingFactors: history.relievingFactors?.length
              ? history.relievingFactors
              : state.currentPatient.complaintHistory?.relievingFactors,
            summaryDraft: summaryDraft || state.currentPatient.complaintHistory?.summaryDraft,
          }
        }
      };
    }),

  resetPatientSession: () => {
    PersistenceService.clearActiveSessionLocal();
    const newSession = createEmptyPatientSession();
    set({
      activeSession: newSession,
      currentPatient: {
        name: "",
        age: 30,
        gender: "M",
        abhaId: "",
        mobile: "",
        consultationType: "modern",
        complaintId: "",
        complaintLabel: "",
        complaintIds: [],
        complaintLabels: [],
        severity: 5,
        duration: "Recent",
        prakriti: "Vata-Pitta",
        ayushAssessment: {},
        scannedDocs: {
          medications: [],
          labValues: []
        },
        complaintHistory: {
          onset: "",
          character: "",
          radiation: "",
          associatedSymptoms: [],
          aggravatingFactors: [],
          relievingFactors: [],
          summaryDraft: ""
        }
      }
    });
  },

  completeIntakeAndEnqueue: () => {
    const state = get();
    const nextToken = (state.queue[state.queue.length - 1]?.token || 43) + 1;
    
    // 1. Map Complaints to Domain Models
    const complaintsList: Complaint[] = state.currentPatient.complaintIds.map((id, idx) => ({
      id,
      anatomicalRegion: id,
      labelHi: state.currentPatient.complaintLabels[idx] || id,
      labelEn: id,
      severity: state.currentPatient.severity,
      duration: state.currentPatient.duration,
      onset: (state.currentPatient.complaintHistory?.onset?.toLowerCase().includes("sudden") ? "sudden" : state.currentPatient.complaintHistory?.onset ? "gradual" : undefined) as "sudden" | "gradual" | "recurrent" | undefined,
      character: state.currentPatient.complaintHistory?.character,
      radiation: state.currentPatient.complaintHistory?.radiation,
      associatedSymptoms: state.currentPatient.complaintHistory?.associatedSymptoms,
      aggravatingFactors: state.currentPatient.complaintHistory?.aggravatingFactors,
      relievingFactors: state.currentPatient.complaintHistory?.relievingFactors
    }));

    // 2. Rule Engine Evaluation (Triage + Red Flags + AYUSH)
    const triage = routePatientToOPD(complaintsList);
    const { redFlags, isEmergency } = RedFlagDetectionModule.analyze(
      "sess-" + Date.now(),
      complaintsList,
      state.currentPatient.complaintHistory
    );
    const isAyurveda = state.currentPatient.consultationType === "ayurveda";
    const ayushProfile = isAyurveda 
      ? determineAyushProfile(state.currentPatient.prakriti, state.currentPatient.ayushAssessment)
      : undefined;

    // 3. Clinical Summary Draft (Strict AI Governance: isAiDraft is true)
    const draftSummary = ClinicalSummaryGenerationModule.buildDraftSummary({
      patient: {
        id: "p-" + Date.now(),
        name: state.currentPatient.name,
        age: state.currentPatient.age,
        gender: state.currentPatient.gender,
        abhaId: state.currentPatient.abhaId
      },
      sessionId: "sess-" + Date.now(),
      tokenNumber: nextToken,
      complaints: complaintsList,
      ayushAssessment: ayushProfile,
      medications: state.currentPatient.scannedDocs.medications.map((m, idx) => ({
        id: "med-" + idx,
        category: "medication",
        name: m.name,
        dosage: m.dose,
        frequency: m.frequency,
        note: m.note,
        confidence: m.confidence || 0.94,
        isVerifiedByDoctor: false
      })),
      labs: state.currentPatient.scannedDocs.labValues.map((l, idx) => ({
        id: "lab-" + idx,
        category: "lab_biomarker",
        name: l.test,
        value: l.value,
        referenceRange: l.range,
        abnormalFlag: l.flag,
        confidence: l.confidence || 0.96,
        isVerifiedByDoctor: false
      })),
      redFlags,
      assignedRoom: isEmergency ? "Room 1 (Red Flag Emergency)" : isAyurveda ? "Room 2 (Ayush OPD)" : triage.room,
      assignedDepartment: isEmergency ? "Emergency Triage" : isAyurveda ? "Kayachikitsa (Internal Medicine)" : triage.department,
      estimatedWaitMinutes: isEmergency ? 2 : triage.estimatedWaitMinutes
    });

    const newRecord: PatientRecord = {
      id: draftSummary.patientId,
      token: nextToken,
      room: draftSummary.assignedRoom,
      department: draftSummary.assignedDepartment,
      name: state.currentPatient.name,
      age: state.currentPatient.age,
      gender: state.currentPatient.gender,
      abhaId: state.currentPatient.abhaId,
      mobile: state.currentPatient.mobile,
      waitSince: Date.now(),
      consultationType: state.currentPatient.consultationType,
      vitals: {
        bp: isEmergency ? '154/96 mmHg' : '124/80 mmHg',
        pulse: isEmergency ? 98 : 78,
        temp: 98.6,
        spO2: isEmergency ? 95 : 99,
        respiratoryRate: isEmergency ? 22 : 16
      },
      complaint: {
        symptomLabel: state.currentPatient.complaintLabel,
        anatomicalRegion: state.currentPatient.complaintId,
        duration: state.currentPatient.duration,
        severity: state.currentPatient.severity,
        associated: state.currentPatient.complaintHistory?.associatedSymptoms?.length
          ? state.currentPatient.complaintHistory.associatedSymptoms
          : ["Fatigue", "Mild headache"],
        onset: state.currentPatient.complaintHistory?.onset || "Recent onset",
        character: state.currentPatient.complaintHistory?.character || "Persistent discomfort",
        radiation: state.currentPatient.complaintHistory?.radiation || "Localized",
        aggravatingFactors: state.currentPatient.complaintHistory?.aggravatingFactors?.length
          ? state.currentPatient.complaintHistory.aggravatingFactors
          : ["Exertion"],
        relievingFactors: state.currentPatient.complaintHistory?.relievingFactors?.length
          ? state.currentPatient.complaintHistory.relievingFactors
          : ["Rest"]
      },
      ayushAssessment: ayushProfile,
      documents: {
        scanned: true,
        medications: state.currentPatient.scannedDocs.medications,
        labValues: state.currentPatient.scannedDocs.labValues,
      },
      pastHistory: {
        medical: ['No prior chronic medical conditions reported'],
        surgical: ['No prior surgical history']
      },
      allergies: [
        'No Known Drug Allergies (NKDA)'
      ],
      familyHistory: [
        'Non-contributory family medical history'
      ],
      personalHistory: {
        diet: isAyurveda && ayushProfile?.ahara ? ayushProfile.ahara : 'Balanced mixed diet',
        smoking: 'Non-smoker',
        alcohol: 'Non-drinker',
        sleep: isAyurveda && ayushProfile?.vihara ? ayushProfile.vihara : '7-8 hours restful sleep',
        bowelBladder: isAyurveda && ayushProfile?.koshtha ? `Koshtha: ${ayushProfile.koshtha}` : 'Normal regular habits'
      },
      medicalTimeline: [
        {
          id: "t-" + Date.now(),
          date: new Date().toISOString().split('T')[0],
          type: 'visit',
          title: isAyurveda ? 'Ayurvedic Case Intake Completed' : 'Modern Medicine Clinical Intake Completed',
          facility: 'AIIA MediKiosk Self-Service Station',
          details: `Autonomous intake completed for ${state.currentPatient.complaintLabel}. AI-drafted record generated for Vaidya / Physician review.`,
          status: 'Triage Ready'
        }
      ],
      redFlags,
      clinicalSummary: draftSummary,
      reviewStatus: "ai_draft",
      status: "waiting",
    };

    const newQueue = [newRecord, ...state.queue];
    set({
      queue: newQueue,
      selectedPatientId: newRecord.id,
    });

    PersistenceService.saveQueueLocal(newQueue);
    return nextToken;
  },

  selectPatient: (id) => set({ selectedPatientId: id }),

  amendRecord: (id, hpi) =>
    set((state) => {
      const updatedQueue = state.queue.map((p) => {
        if (p.id !== id) return p;
        const newLog: AuditLogEntry = {
          timestamp: Date.now(),
          author: "Dr. Anand Sharma, MD",
          field: "History of Present Illness (HPI)",
          previousValue: p.hpiOverride || "AI Generated Draft",
          newValue: hpi
        };
        return {
          ...p,
          hpiOverride: hpi,
          auditLogs: [...(p.auditLogs || []), newLog]
        };
      });
      PersistenceService.saveQueueLocal(updatedQueue);
      return { queue: updatedQueue };
    }),

  updatePatientRecord: (id, updates) =>
    set((state) => {
      const updatedQueue = state.queue.map((p) => {
        if (p.id !== id) return p;
        const logs: AuditLogEntry[] = [...(p.auditLogs || [])];
        const author = "Dr. Anand Sharma, MD";
        if (updates.hpiOverride !== undefined && updates.hpiOverride !== p.hpiOverride) {
          logs.push({
            timestamp: Date.now(),
            author,
            field: "History of Present Illness (HPI)",
            previousValue: p.hpiOverride || "AI Generated Draft",
            newValue: updates.hpiOverride
          });
        }
        if (updates.complaint?.symptomLabel && updates.complaint.symptomLabel !== p.complaint.symptomLabel) {
          logs.push({
            timestamp: Date.now(),
            author,
            field: "Chief Complaint",
            previousValue: p.complaint.symptomLabel,
            newValue: updates.complaint.symptomLabel
          });
        }
        if (updates.complaint?.severity !== undefined && updates.complaint.severity !== p.complaint.severity) {
          logs.push({
            timestamp: Date.now(),
            author,
            field: "Symptom Severity",
            previousValue: `${p.complaint.severity || 5}/10`,
            newValue: `${updates.complaint.severity}/10`
          });
        }
        return {
          ...p,
          ...updates,
          auditLogs: logs
        };
      });
      PersistenceService.saveQueueLocal(updatedQueue);
      return { queue: updatedQueue };
    }),

  confirmPatient: (id, doctorName = "Dr. Anand Sharma, MD (Reg #DMC-49210)") =>
    set((state) => {
      const updatedQueue = state.queue.map((p) => {
        if (p.id !== id) return p;
        const newLog: AuditLogEntry = {
          timestamp: Date.now(),
          author: doctorName,
          field: "Clinical Verification",
          previousValue: p.reviewStatus,
          newValue: "doctor_verified"
        };
        return {
          ...p,
          reviewStatus: "doctor_verified" as const,
          verifiedBy: doctorName,
          verifiedAt: Date.now(),
          status: "completed" as const,
          auditLogs: [...(p.auditLogs || []), newLog],
          clinicalSummary: p.clinicalSummary
            ? {
                ...p.clinicalSummary,
                isAiDraft: false,
                status: "physician_reviewed" as const,
                reviewedAt: Date.now(),
                reviewedBy: doctorName,
              }
            : undefined,
        };
      });
      PersistenceService.saveQueueLocal(updatedQueue);
      return { queue: updatedQueue };
    }),

  rejectPatient: (id, reason) =>
    set((state) => {
      const updatedQueue = state.queue.map((p) => {
        if (p.id !== id) return p;
        const newLog: AuditLogEntry = {
          timestamp: Date.now(),
          author: "Dr. Anand Sharma, MD",
          field: "Review Status",
          previousValue: p.reviewStatus,
          newValue: `doctor_rejected: ${reason}`
        };
        return {
          ...p,
          reviewStatus: "doctor_rejected" as const,
          rejectionReason: reason,
          status: "rejected" as const,
          auditLogs: [...(p.auditLogs || []), newLog],
          clinicalSummary: p.clinicalSummary
            ? {
                ...p.clinicalSummary,
                status: "physician_rejected" as const,
                reviewedAt: Date.now(),
              }
            : undefined,
        };
      });
      PersistenceService.saveQueueLocal(updatedQueue);
      return { queue: updatedQueue };
    }),

  requestReinterview: (id, notes) =>
    set((state) => {
      const updatedQueue = state.queue.map((p) => {
        if (p.id !== id) return p;
        const newLog: AuditLogEntry = {
          timestamp: Date.now(),
          author: "Dr. Anand Sharma, MD",
          field: "Review Status",
          previousValue: p.reviewStatus,
          newValue: `reinterview_requested: ${notes}`
        };
        return {
          ...p,
          reviewStatus: "reinterview_requested" as const,
          reinterviewNotes: notes,
          status: "reinterview" as const,
          auditLogs: [...(p.auditLogs || []), newLog]
        };
      });
      PersistenceService.saveQueueLocal(updatedQueue);
      return { queue: updatedQueue };
    }),

  pushToEmr: (id) => {
    const state = get();
    const record = state.queue.find(p => p.id === id);
    if (record) {
      const patientModel: Patient = {
        id: record.id,
        name: record.name,
        age: record.age,
        gender: (record.gender === "F" ? "F" : "M"),
        abhaId: record.abhaId,
        mobile: record.mobile,
        registeredAt: record.waitSince
      };
      
      const validation = IntegrationModule.validateSessionForFhir({ patient: patientModel });
      if (!validation.isValid) {
        console.error("[ABDM Integration Error] FHIR Validation Failed:", validation.errors);
        return;
      }

      const summaryModel = record.clinicalSummary || ClinicalSummaryGenerationModule.buildDraftSummary({
        patient: patientModel,
        sessionId: "sess-" + record.id,
        tokenNumber: record.token,
        complaints: [{
          id: "c1",
          anatomicalRegion: record.complaint.anatomicalRegion || "general",
          labelHi: record.complaint.symptomLabel,
          labelEn: record.complaint.symptomLabel,
          severity: record.complaint.severity || 5
        }],
        medications: (record.documents?.medications || []).map((m, idx) => ({
          id: "m-" + idx,
          category: "medication",
          name: m.name,
          dosage: m.dose,
          frequency: m.frequency,
          note: m.note,
          confidence: m.confidence || 0.95,
          isVerifiedByDoctor: record.reviewStatus === "doctor_verified"
        })),
        labs: (record.documents?.labValues || []).map((l, idx) => ({
          id: "l-" + idx,
          category: "lab_biomarker",
          name: l.test,
          value: l.value,
          referenceRange: l.range,
          abnormalFlag: l.flag,
          confidence: l.confidence || 0.96,
          isVerifiedByDoctor: record.reviewStatus === "doctor_verified"
        })),
        redFlags: record.redFlags || [],
        assignedRoom: record.room,
        assignedDepartment: record.department,
        estimatedWaitMinutes: 8
      });

      const fhirBundle = IntegrationModule.generateAbdmBundle(patientModel, summaryModel);
      console.log("[ABDM / FHIR DEMO SANDBOX] Bundle generated successfully. External submission simulated:", fhirBundle);
    }

    set((state) => {
      const updatedQueue = state.queue.map((p) =>
        p.id === id ? { ...p, status: "pushed" as const, reviewStatus: "doctor_verified" as const } : p
      );
      PersistenceService.saveQueueLocal(updatedQueue);
      return { queue: updatedQueue };
    });
  },

  loadDemoScenario: (scenario) => {
    PersistenceService.clearActiveSessionLocal();
    if (scenario === 1) {
      // DEMO 1 — Normal Patient: Ramesh Kumar (Hindi Abdominal Pain, Voice, Prescription OCR, Doctor Verification)
      set({
        language: "hi",
        preferredLanguage: "hi",
        voiceLanguage: "hi-IN",
        activeView: "kiosk",
        currentPatient: {
          name: "Ramesh Kumar (Fictional Demo)",
          age: 45,
          gender: "M",
          abhaId: "91-8821-4401-9921",
          mobile: "+91 98101 22910",
          consultationType: "modern",
          complaintId: "stomach_abdomen",
          complaintLabel: "Stomach Pain & Acid Reflux / पेट में दर्द व एसिडिटी",
          complaintIds: ["stomach_abdomen"],
          complaintLabels: ["Stomach Pain & Acid Reflux / पेट में दर्द व एसिडिटी"],
          severity: 6,
          duration: "3 Days",
          prakriti: "Pitta-Vata",
          ayushAssessment: {},
          scannedDocs: {
            medications: [
              { name: "Metformin HCl", dose: "500mg", frequency: "BD", note: "with meals", confidence: 0.96, source: "ocr" },
              { name: "Pantoprazole", dose: "40mg", frequency: "OD", note: "empty stomach in morning", confidence: 0.98, source: "ocr" },
              { name: "Gelusil Antacid", dose: "10ml", frequency: "TDS", note: "after meals", confidence: 0.94, source: "ocr" }
            ],
            labValues: [
              { test: "Fasting Blood Glucose", value: "142 mg/dL", range: "70 – 100 mg/dL", flag: "high", confidence: 0.96 },
              { test: "Serum Creatinine", value: "0.9 mg/dL", range: "0.6 – 1.2 mg/dL", flag: "normal", confidence: 0.95 }
            ]
          },
          complaintHistory: {
            onset: "Gradual onset, worsening after spicy meals",
            character: "Burning epigastric pain with sour regurgitation",
            radiation: "Localized upper abdomen, retrosternal burning",
            associatedSymptoms: ["Bloating", "Loss of appetite", "Morning nausea"],
            aggravatingFactors: ["Spicy food", "Late night meals", "Tea"],
            relievingFactors: ["Cold milk", "Antacid syrup"],
            summaryDraft: "45y M presenting with 3-day history of burning epigastric pain and GERD symptoms. Scanned prescription shows Metformin & Pantoprazole. Fasting glucose elevated at 142 mg/dL."
          }
        },
        selectedPatientId: "p-101"
      });
    } else if (scenario === 2) {
      // DEMO 2 — Emergency Priority: Sunita Devi (Chest Pain + Breathlessness + Diaphoresis, Red-Flag Rule)
      set({
        language: "en",
        preferredLanguage: "en",
        voiceLanguage: "en-IN",
        activeView: "physician",
        currentPatient: {
          name: "Sunita Devi (Fictional Demo)",
          age: 62,
          gender: "F",
          abhaId: "91-4521-9981-4019",
          mobile: "+91 94120 44812",
          consultationType: "modern",
          complaintId: "chest_heart_lungs",
          complaintLabel: "Chest Pain & Severe Breathlessness",
          complaintIds: ["chest_heart_lungs"],
          complaintLabels: ["Chest Pain & Severe Breathlessness"],
          severity: 8,
          duration: "2 Hours",
          prakriti: "Pitta-Vata",
          ayushAssessment: {},
          scannedDocs: {
            medications: [
              { name: "Amlodipine", dose: "5mg", frequency: "OD", note: "morning", confidence: 0.96, source: "ocr" },
              { name: "Atorvastatin", dose: "20mg", frequency: "HS", note: "bedtime", confidence: 0.94, source: "ocr" }
            ],
            labValues: [
              { test: "Blood Pressure", value: "168/98 mmHg", range: "120/80 mmHg", flag: "high", confidence: 0.98 }
            ]
          },
          complaintHistory: {
            onset: "Sudden onset while walking upstairs",
            character: "Crushing retrosternal tightness with heavy pressure",
            radiation: "Radiating to left shoulder, inner arm, and jaw",
            associatedSymptoms: ["Severe cold sweating (Diaphoresis)", "Breathlessness", "Dizziness"],
            aggravatingFactors: ["Exertion", "Deep inspiration"],
            relievingFactors: ["Rest (minimal relief)"],
            summaryDraft: "62y F presenting with acute sudden crushing chest tightness (2 hours), severe diaphoresis, and shortness of breath. Red flag emergency rule triggered."
          }
        },
        selectedPatientId: "p-102"
      });
    } else if (scenario === 3) {
      // DEMO 3 — AYUSH Mode: Arjun Nair (Ayurveda Selected, 12-factor Dashavidha Pariksha, Vaidya Console)
      set({
        language: "hi",
        preferredLanguage: "hi",
        voiceLanguage: "hi-IN",
        activeView: "kiosk",
        currentPatient: {
          name: "Arjun Nair (Fictional Demo)",
          age: 38,
          gender: "M",
          abhaId: "91-7721-3914-1029",
          mobile: "+91 98112 39011",
          consultationType: "ayurveda",
          complaintId: "stomach_abdomen",
          complaintLabel: "Amlapitta & Udarashoola / अम्लपित्त व पेट में जलन",
          complaintIds: ["stomach_abdomen"],
          complaintLabels: ["Amlapitta & Udarashoola / अम्लपित्त व पेट में जलन"],
          severity: 5,
          duration: "4 Days",
          prakriti: "Pitta-Vata",
          ayushAssessment: {
            prakriti: "Pitta-Vata",
            vikriti: "Pitta-Vata Vriddhi (Amlapitta & Ushnata)",
            sara: "Madhyama Sara (Moderate tissue quality)",
            samhanana: "Madhyama (Compact body frame)",
            pramana: "Anuroopa (Proportionate stature)",
            satmya: "Madhyama Satmya (Moderate tolerance)",
            sattva: "Madhyama Sattva (Moderate psychological endurance)",
            aharaShakti: "Tikshnagni (Strong food intake, rapid burning)",
            vyayamaShakti: "Madhyama (Medium physical endurance)",
            vaya: "Madhyama Vaya (38 years, adult stage)",
            ahara: "Tikshna-Katu rasa pradhana (Spicy/oily foods, tea)",
            vihara: "Ratri-jagarana (Late sleeping at 1:00 AM)"
          },
          scannedDocs: {
            medications: [
              { name: "Avipattikar Churna", dose: "3g", frequency: "HS", note: "with warm water", confidence: 0.96, source: "ocr" },
              { name: "Sutshekhar Ras", dose: "125mg", frequency: "BD", note: "with honey", confidence: 0.94, source: "ocr" },
              { name: "Kamdudha Ras", dose: "250mg", frequency: "BD", note: "before meals", confidence: 0.95, source: "ocr" }
            ],
            labValues: [
              { test: "Serum Bilirubin", value: "1.1 mg/dL", range: "0.2 – 1.2 mg/dL", flag: "normal", confidence: 0.95 },
              { test: "SGPT/ALT", value: "34 U/L", range: "7 – 56 U/L", flag: "normal", confidence: 0.96 }
            ]
          },
          complaintHistory: {
            onset: "Gradual onset after irregular meal timings",
            character: "Epigastric burning sensation (Vidaha) & sour belching",
            radiation: "Hridaya-pradesha (retrosternal region)",
            associatedSymptoms: ["Aruchi (Anorexia)", "Tripti (Early satiety)"],
            aggravatingFactors: ["Katu-Amla Ahara (Spicy/sour food)", "Late night sleep"],
            relievingFactors: ["Shita-dugdha (Cold milk)"],
            summaryDraft: "38y M presenting for Ayurvedic OPD consultation. Dashavidha Pariksha completed: Pitta-Vata Prakriti with Pitta Vriddhi (Amlapitta). Scanned herbal prescription included."
          }
        },
        selectedPatientId: "p-101"
      });
    }
  },

  resetDemoEnvironment: () => {
    localStorage.removeItem("medikiosk_active_queue_v1");
    PersistenceService.clearActiveSessionLocal();
    const newSession = createEmptyPatientSession();
    set({
      activeView: "kiosk",
      language: "hi",
      preferredLanguage: "hi",
      voiceLanguage: "hi-IN",
      queue: SEED_QUEUE,
      selectedPatientId: "p-101",
      activeSession: newSession,
      currentPatient: {
        name: "",
        age: 30,
        gender: "M",
        abhaId: "",
        mobile: "",
        consultationType: "modern",
        complaintId: "",
        complaintLabel: "",
        complaintIds: [],
        complaintLabels: [],
        severity: 5,
        duration: "Recent",
        prakriti: "Vata-Pitta",
        ayushAssessment: {},
        scannedDocs: {
          medications: [],
          labValues: []
        },
        complaintHistory: {
          onset: "",
          character: "",
          radiation: "",
          associatedSymptoms: [],
          aggravatingFactors: [],
          relievingFactors: [],
          summaryDraft: ""
        }
      }
    });
  }
}));
