import { SpeechNormalizer } from "../services/voice/speechNormalizer";
import { useKioskStore } from "../store/kioskStore";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runStep8Tests() {
  // Test 1: Store persists preferredLanguage and voiceLanguage separately
  const store = useKioskStore.getState();
  store.setLanguage("hi");
  store.setVoiceLanguage("hinglish");

  const state1 = useKioskStore.getState();
  assert(state1.preferredLanguage === "hi", "preferredLanguage should be 'hi'");
  assert(state1.voiceLanguage === "hinglish", "voiceLanguage should be 'hinglish'");
  assert(state1.activeSession.preferredLanguage === "hi", "activeSession preferredLanguage should be 'hi'");
  assert(state1.activeSession.voiceLanguage === "hinglish", "activeSession voiceLanguage should be 'hinglish'");

  // Test 2: Language switch midway preserves existing active session state
  store.setSeverity(8);
  store.setComplaint("chest_heart_lungs", "Chest Pain");
  store.setLanguage("en");

  const state2 = useKioskStore.getState();
  assert(state2.preferredLanguage === "en", "Switching language updates preferredLanguage to 'en'");
  assert(state2.currentPatient.severity === 8, "Language switch must not clear severity");
  assert(state2.currentPatient.complaintId === "chest_heart_lungs", "Language switch must not clear complaint");

  // Test 3: Speech Normalizer preserves raw vernacular transcript alongside normalized entities
  const rawHinglishUtterance = "mere pet mein 3 din se pain hai";
  const normalized = SpeechNormalizer.normalize(rawHinglishUtterance);

  assert(normalized.rawText === rawHinglishUtterance, "Original patient wording must be preserved in rawText");
  assert(normalized.detectedComplaint === "abdominal_pain", "Normalizer identifies abdominal_pain complaint");
  assert(normalized.extractedEntities.duration === "3 days", "Normalizer extracts 3 days duration");

  console.log("✅ Step 8 Multilingual & Voice Intake Hardening tests passed successfully!");
}
