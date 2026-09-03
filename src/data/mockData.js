import { HeartPulse, Thermometer, Activity, Wind } from 'lucide-react'

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
]

export const SYMPTOMS = [
  {
    id: 'chest-pain',
    label: 'Chest Pain',
    icon: HeartPulse,
    department: 'Cardiology',
    room: 'Room 4',
    priority: 'high',
  },
  {
    id: 'fever',
    label: 'High Fever / Chills',
    icon: Thermometer,
    department: 'General Medicine',
    room: 'Room 2',
    priority: 'medium',
  },
  {
    id: 'abdominal',
    label: 'Abdominal Discomfort',
    icon: Activity,
    department: 'General Medicine',
    room: 'Room 2',
    priority: 'medium',
  },
  {
    id: 'cough',
    label: 'Severe Cough',
    icon: Wind,
    department: 'Pulmonology',
    room: 'Room 6',
    priority: 'low',
  },
]

export const DURATION_OPTIONS = ['Hours', 'Days', 'Weeks']

export const SEVERITY_ANCHORS = {
  1: 'Barely noticeable',
  3: 'Mild, comes and goes',
  5: 'Moderate, hard to ignore',
  7: 'Severe, limits activity',
  10: 'Worst imaginable',
}

export const ASSOCIATED_SYMPTOMS = {
  'chest-pain': ['Shortness of breath', 'Sweating', 'Pain radiating to arm', 'Dizziness', 'Nausea'],
  fever: ['Body ache', 'Chills with rigor', 'Headache', 'Loss of appetite', 'Rash'],
  abdominal: ['Vomiting', 'Diarrhea', 'Bloating', 'Loss of appetite', 'Blood in stool'],
  cough: ['Blood in sputum', 'Wheezing', 'Chest tightness', 'Night sweats', 'Weight loss'],
}

// Simulated OCR / NER extraction from a scanned prescription + lab report
export const MOCK_OCR_RESULT = {
  medications: [
    { name: 'Metformin', dose: '500mg', frequency: 'BD', note: 'with meals' },
    { name: 'Amlodipine', dose: '5mg', frequency: 'OD', note: 'morning' },
    { name: 'Atorvastatin', dose: '10mg', frequency: 'HS', note: 'bedtime' },
  ],
  labValues: [
    { test: 'HbA1c', value: '8.4%', range: '4.0 – 5.6%', flag: 'high' },
    { test: 'Fasting Glucose', value: '162 mg/dL', range: '70 – 100 mg/dL', flag: 'high' },
    { test: 'LDL Cholesterol', value: '138 mg/dL', range: '< 100 mg/dL', flag: 'high' },
    { test: 'Hemoglobin', value: '13.1 g/dL', range: '13.0 – 17.0 g/dL', flag: 'normal' },
    { test: 'TSH', value: '2.1 mIU/L', range: '0.4 – 4.0 mIU/L', flag: 'normal' },
  ],
  sourceDoc: 'Handwritten prescription, Apollo Diagnostics · 3 pages',
}

const MOCK_NAMES = [
  { name: 'Ravi Kumar', age: 54, gender: 'M' },
  { name: 'Sunita Devi', age: 38, gender: 'F' },
  { name: 'Arjun Nair', age: 29, gender: 'M' },
  { name: 'Priya Sharma', age: 61, gender: 'F' },
  { name: 'Mohammed Irfan', age: 45, gender: 'M' },
  { name: 'Lakshmi Iyer', age: 33, gender: 'F' },
]

export function randomMockPatient() {
  const pick = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)]
  const abhaSuffix = String(Math.floor(1000 + Math.random() * 9000))
  return {
    ...pick,
    abhaId: `91-XXXX-XXXX-${abhaSuffix}`,
    mobile: `+91 XXXXX X${String(Math.floor(1000 + Math.random() * 9000)).slice(-3)}`,
  }
}

// Seed queue so the Physician Console isn't empty on first load
export const INITIAL_QUEUE = [
  {
    id: 'seed-1',
    token: 41,
    room: 'Room 2',
    name: 'Deepak Verma',
    age: 47,
    gender: 'M',
    abhaId: '91-XXXX-XXXX-7712',
    waitSince: Date.now() - 14 * 60 * 1000,
    complaint: {
      symptomLabel: 'High Fever / Chills',
      duration: 'Days',
      severity: 6,
      associated: ['Body ache', 'Chills with rigor'],
    },
    documents: {
      scanned: true,
      medications: [{ name: 'Paracetamol', dose: '650mg', frequency: 'SOS', note: 'for fever' }],
      labValues: [{ test: 'WBC Count', value: '13,200 /µL', range: '4,000 – 11,000 /µL', flag: 'high' }],
    },
    status: 'waiting',
  },
]
