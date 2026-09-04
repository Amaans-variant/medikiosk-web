import { useKioskStore } from "../store/kioskStore";

function runStep4StateTests() {
  console.log("=== MediKiosk Step 4 Severity & Session Persistence Tests ===");
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

  // Reset state
  useKioskStore.getState().resetPatientSession();

  // Test 1: Select Abdomen
  useKioskStore.getState().toggleComplaint("stomach_abdomen", "Stomach & Digestion");
  let state = useKioskStore.getState();
  assert(state.currentPatient.complaintIds.includes("stomach_abdomen"), "Test 1: Stomach & Digestion selected in currentPatient");
  assert(state.activeSession.complaints.some(c => c.id === "stomach_abdomen"), "Test 2: Stomach & Digestion synchronized to activeSession complaints");

  // Test 2: Set Severity to 8
  useKioskStore.getState().setSeverity(8);
  state = useKioskStore.getState();
  assert(state.currentPatient.severity === 8, "Test 3: currentPatient.severity set to 8");
  assert(state.activeSession.clinicalHistory.severity.value === 8, "Test 4: activeSession.clinicalHistory.severity fact set to 8");

  // Test 3: Select Multiple Complaints (Abdomen + Chest)
  useKioskStore.getState().toggleComplaint("chest_heart_lungs", "Chest & Heart");
  state = useKioskStore.getState();
  assert(state.currentPatient.complaintIds.length === 2, "Test 5: Multiple complaints (2) retained in currentPatient");
  assert(state.currentPatient.complaintIds.includes("stomach_abdomen"), "Test 6: First complaint (stomach_abdomen) preserved when adding second");
  assert(state.currentPatient.complaintIds.includes("chest_heart_lungs"), "Test 7: Second complaint (chest_heart_lungs) added");
  assert(state.activeSession.complaints.length === 2, "Test 8: activeSession contains both complaints");

  // Test 4: Complete Intake & Verify Enqueued Record for Doctor Console
  const token = useKioskStore.getState().completeIntakeAndEnqueue();
  state = useKioskStore.getState();
  const enqueued = state.queue.find(p => p.token === token);
  assert(enqueued !== undefined, "Test 9: Patient enqueued in shared OPD queue");
  assert(enqueued?.complaint.severity === 8, "Test 10: Doctor queue record retains severity = 8");
  assert(state.activeSession.complaints.some(c => c.id === "stomach_abdomen"), "Test 11: Active session contains stomach_abdomen");
  assert(state.activeSession.complaints.some(c => c.id === "chest_heart_lungs"), "Test 12: Active session contains chest_heart_lungs");

  console.log(`\nStep 4 Test Summary: ${passed}/${total} passed.`);
}

runStep4StateTests();
