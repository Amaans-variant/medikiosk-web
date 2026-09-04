import { VoiceService } from "../services/voice/voiceService";
import { SpeechNormalizer } from "../services/voice/speechNormalizer";

function runTests() {
  console.log("=== MediKiosk Voice Pipeline Safety Unit Tests ===");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  // 1. Normal mode with no window/browser speech recognition does not hallucinate
  let normalErrorTriggered = false;
  let normalErrorMsg = "";
  VoiceService.startListening({
    onResult: () => {
      // Should not be called
    },
    onError: (err, msg) => {
      normalErrorTriggered = true;
      normalErrorMsg = msg || "";
    }
  }, "hi-IN", "Fake Phrase", false);

  assert(normalErrorTriggered, "Test 1: Normal mode emits onError when speech recognition unavailable without fallback speech");
  assert(normalErrorMsg.includes("We could not hear you clearly"), "Test 2: Normal mode error message contains user-friendly text");

  // 2. SpeechNormalizer retains rawText and normalizedText
  const norm1 = SpeechNormalizer.normalize("Mujhe 3 din se chest mein pain ho raha hai");
  assert(norm1.rawText === "Mujhe 3 din se chest mein pain ho raha hai", "Test 3: SpeechNormalizer retains exact raw text");
  assert(norm1.detectedComplaint === "chest_pain", "Test 4: Correctly detects chest_pain complaint");
  assert(norm1.extractedEntities.duration === "3 days", "Test 5: Correctly extracts 3 days duration");
  assert(norm1.extractedEntities.location === "Retrosternal / Subcardiac chest", "Test 6: Correctly maps chest location");

  // 3. SpeechNormalizer does not hallucinate severity when not stated
  const norm2 = SpeechNormalizer.normalize("Pet mein dard hai");
  assert(norm2.extractedEntities.severity === undefined, "Test 7: Does not fabricate severity when unmentioned");

  // 4. SpeechNormalizer extracts explicit severity when stated
  const norm3 = SpeechNormalizer.normalize("Pet mein dard rate 8/10 hai");
  assert(norm3.extractedEntities.severity === 8, "Test 8: Extracts explicit numeric severity 8/10");

  // 5. SpeechNormalizer flags low confidence for unrecognized short phrase
  const norm4 = SpeechNormalizer.normalize("kuch accha nahi lag raha");
  assert(norm4.confidence < 0.78, "Test 9: Flags low confidence (< 0.78) for ambiguous phrase");
  assert(norm4.needsConfirmation === true, "Test 10: Flags needsConfirmation = true for low confidence phrase");

  console.log(`\nTest Summary: ${passed}/${total} passed.`);
}

runTests();
