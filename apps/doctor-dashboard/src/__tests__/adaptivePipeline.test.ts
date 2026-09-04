import { ConversationalHistoryEngine } from "../modules/history-engine/engine";
import { resolvePathway } from "../modules/history-engine/pathways";

function runStep3Tests() {
  console.log("=== MediKiosk Step 3 Adaptive History Pipeline Unit Tests ===");
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

  // Scenario A: Abdominal Pain Adaptive Pipeline
  const engineA = new ConversationalHistoryEngine("abdominal_pain");
  const qA1 = engineA.getCurrentQuestion();
  assert(qA1?.field === "location", "Scenario A: First question elicits location for abdominal pain");

  engineA.answerChoice("loc_upper"); // Upper abdomen
  const qA2 = engineA.getCurrentQuestion();
  assert(qA2?.field === "duration", "Scenario A: Second question adaptively asks duration after location is set");
  
  engineA.answerNaturalText("3 din se dard hai"); // 3 days
  const historyA = engineA.getHistory();
  assert(historyA.location === "Upper abdomen (Epigastrium)", "Scenario A: History stores location in canonical record");
  assert(historyA.duration === "3 days", "Scenario A: History stores duration from natural language utterance");

  // Scenario B: Headache Adaptive Pipeline with skipping pre-filled fields
  const engineB = new ConversationalHistoryEngine("headache", {
    duration: "2 days" // Pre-filled duration
  });
  const qB1 = engineB.getCurrentQuestion();
  assert(qB1?.field === "onset", "Scenario B: Starts at onset question for headache");
  engineB.answerChoice("ha_gradual");
  const qB2 = engineB.getCurrentQuestion();
  assert(qB2?.field === "character", "Scenario B: Moves to character question");
  engineB.answerChoice("char_throbbing_one_side");
  const historyB = engineB.getHistory();
  assert(historyB.character === "Pulsating / Throbbing", "Scenario B: Captures throbbing character");
  assert(historyB.location === "Unilateral (one side)", "Scenario B: Captures unilateral location extracted from choice");

  // Scenario C: Chest Pain Emergency Red-Flag Triage
  const engineC = new ConversationalHistoryEngine("chest_pain");
  engineC.answerChoice("dur_sudden_mins");
  engineC.answerChoice("char_heavy_squeeze");
  const resC = engineC.answerChoice("rad_arm_jaw"); // Red flag choice
  assert(resC.redFlags.length > 0, "Scenario C: Radiation to left arm triggers Red-Flag Triage alert");
  assert(resC.redFlags[0].condition.includes("Acute Coronary Syndrome"), "Scenario C: Red-flag identifies ACS condition");

  // Scenario D: Multiple complaints pathway resolution
  const pathD1 = resolvePathway("chest_heart_lungs");
  const pathD2 = resolvePathway("stomach_abdomen");
  assert(pathD1.canonicalName === "Chest Pain", "Scenario D: Resolves chest_heart_lungs to Chest Pain pathway");
  assert(pathD2.canonicalName === "Abdominal Pain", "Scenario D: Resolves stomach_abdomen to Abdominal Pain pathway");

  // Final Summary Non-Fabrication Verification
  const summaryA = engineA.generateStructuredSummary();
  assert(summaryA.includes("[CHIEF COMPLAINT]: Abdominal Pain"), "Summary: Structured draft includes exact chief complaint");
  assert(summaryA.includes("[LOCATION]: Upper abdomen (Epigastrium)"), "Summary: Includes exact location answered");
  assert(summaryA.includes("[DURATION]: 3 days"), "Summary: Includes exact duration answered");

  console.log(`\nStep 3 Test Summary: ${passed}/${total} passed.`);
}

runStep3Tests();
