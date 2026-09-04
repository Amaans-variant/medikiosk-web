import { useKioskStore } from "@/store/kioskStore";
import { ConversationalHistoryEngine } from "@/modules/history-engine/engine";
import { SpeechNormalizer } from "@/services/voice/speechNormalizer";

export interface QAFinding {
  user: string;
  scenario: string;
  severity: "P0" | "P1" | "P2" | "P3";
  issue: string;
  passed: boolean;
}

export function runComprehensiveQA(): QAFinding[] {
  const findings: QAFinding[] = [];

  // ==========================================
  // USER 1: Elderly Hindi-speaking patient (Touch + Voice, Easy View)
  // ==========================================
  try {
    useKioskStore.getState().resetPatientSession();
    useKioskStore.getState().setLanguage("hi");
    useKioskStore.getState().setVoiceLanguage("hi-IN");
    useKioskStore.getState().setPatientCategory("assisted_elderly");
    useKioskStore.getState().toggleEasyView();

    useKioskStore.getState().setPatientDemographics({ name: "Shyamlal Ji", age: 72, gender: "M" });
    useKioskStore.getState().setComplaint("stomach_abdomen", "पेट में दर्द व गैस");
    useKioskStore.getState().setSeverity(7);

    const state = useKioskStore.getState();
    if (state.language !== "hi" || !state.easyView || state.currentPatient.severity !== 7) {
      findings.push({ user: "User 1", scenario: "Elderly Hindi Patient", severity: "P1", issue: "Easy view font scaling or Hindi selection lost during intake", passed: false });
    } else {
      findings.push({ user: "User 1", scenario: "Elderly Hindi Patient", severity: "P1", issue: "None", passed: true });
    }
  } catch (err: unknown) {
    findings.push({ user: "User 1", scenario: "Elderly Hindi Patient", severity: "P0", issue: String(err), passed: false });
  }

  // ==========================================
  // USER 2: Middle-aged Hinglish-speaking patient (Natural Speech)
  // ==========================================
  try {
    useKioskStore.getState().resetPatientSession();
    useKioskStore.getState().setLanguage("hi");
    useKioskStore.getState().setVoiceLanguage("hinglish");
    
    const transcript = "Mere pet mein 3 din se bahut severe pain hai";
    const processed = SpeechNormalizer.normalize(transcript);

    if (processed.detectedComplaint !== "abdominal_pain" || processed.extractedEntities.duration !== "3 days") {
      findings.push({ user: "User 2", scenario: "Hinglish Speech Patient", severity: "P2", issue: "Hinglish normalization did not map 'pet mein pain' to 'abdominal_pain'", passed: false });
    } else {
      findings.push({ user: "User 2", scenario: "Hinglish Speech Patient", severity: "P2", issue: "None", passed: true });
    }
  } catch (err: unknown) {
    findings.push({ user: "User 2", scenario: "Hinglish Speech Patient", severity: "P0", issue: String(err), passed: false });
  }

  // ==========================================
  // USER 3: Young English-speaking patient (Touch Intake)
  // ==========================================
  try {
    useKioskStore.getState().resetPatientSession();
    useKioskStore.getState().setLanguage("en");
    useKioskStore.getState().setPatientDemographics({ name: "Aman Gupta", age: 24, gender: "M" });
    useKioskStore.getState().setComplaint("head_brain", "Severe Headache & Migraine");
    useKioskStore.getState().setSeverity(6);

    const state = useKioskStore.getState();
    if (state.currentPatient.complaintId !== "head_brain" || state.currentPatient.severity !== 6) {
      findings.push({ user: "User 3", scenario: "Young English Patient", severity: "P1", issue: "Touch complaint selection state mismatch", passed: false });
    } else {
      findings.push({ user: "User 3", scenario: "Young English Patient", severity: "P1", issue: "None", passed: true });
    }
  } catch (err: unknown) {
    findings.push({ user: "User 3", scenario: "Young English Patient", severity: "P0", issue: String(err), passed: false });
  }

  // ==========================================
  // USER 4: Low-literacy patient (Audio Prompts & Visual Icons)
  // ==========================================
  try {
    useKioskStore.getState().resetPatientSession();
    useKioskStore.getState().setLanguage("hi");
    
    const engine = new ConversationalHistoryEngine("stomach_abdomen");
    const nextQ = engine.getCurrentQuestion();

    if (!nextQ || !nextQ.promptHi || !nextQ.promptEn) {
      findings.push({ user: "User 4", scenario: "Low-Literacy Audio Guidance", severity: "P2", issue: "Missing audio prompt on adaptive clinical question", passed: false });
    } else {
      findings.push({ user: "User 4", scenario: "Low-Literacy Audio Guidance", severity: "P2", issue: "None", passed: true });
    }
  } catch (err: unknown) {
    findings.push({ user: "User 4", scenario: "Low-Literacy Audio Guidance", severity: "P0", issue: String(err), passed: false });
  }

  // ==========================================
  // USER 5: Patient with microphone permission denied (Fallback Mode)
  // ==========================================
  try {
    useKioskStore.getState().resetPatientSession();
    const fallback = SpeechNormalizer.normalize("not-allowed");

    if (fallback.confidence > 0.5 || fallback.detectedComplaint) {
      findings.push({ user: "User 5", scenario: "Mic Permission Denied", severity: "P0", issue: "Voice failure created fictional clinical value instead of graceful fallback", passed: false });
    } else {
      findings.push({ user: "User 5", scenario: "Mic Permission Denied", severity: "P0", issue: "None", passed: true });
    }
  } catch (err: unknown) {
    findings.push({ user: "User 5", scenario: "Mic Permission Denied", severity: "P0", issue: String(err), passed: false });
  }

  // ==========================================
  // USER 6: Patient with multiple complaints (Adaptive History)
  // ==========================================
  try {
    useKioskStore.getState().resetPatientSession();
    useKioskStore.getState().setComplaint("chest_heart_lungs", "Chest Pain");
    useKioskStore.getState().toggleComplaint("stomach_abdomen", "Stomach Pain");
    useKioskStore.getState().setSeverity(8);

    const state = useKioskStore.getState();
    if (state.currentPatient.complaintIds.length !== 2) {
      findings.push({ user: "User 6", scenario: "Multiple Complaints", severity: "P1", issue: "Multiple complaints overwritten or not accumulated in complaintIds", passed: false });
    } else {
      findings.push({ user: "User 6", scenario: "Multiple Complaints", severity: "P1", issue: "None", passed: true });
    }
  } catch (err: unknown) {
    findings.push({ user: "User 6", scenario: "Multiple Complaints", severity: "P0", issue: String(err), passed: false });
  }

  return findings;
}
