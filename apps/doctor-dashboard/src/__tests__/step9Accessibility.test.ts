import { useKioskStore } from "../store/kioskStore";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runStep9Tests() {
  const store = useKioskStore.getState();

  // Test 1: Accessibility Easy View toggle
  assert(store.easyView === false, "Initial easyView should be false");
  store.toggleEasyView();
  assert(useKioskStore.getState().easyView === true, "toggleEasyView turns easyView to true");

  // Test 2: High Contrast toggle
  assert(store.highContrast === false, "Initial highContrast should be false");
  store.toggleHighContrast();
  assert(useKioskStore.getState().highContrast === true, "toggleHighContrast turns highContrast to true");

  // Test 3: Minor / Guardian category selection
  assert(store.patientCategory === "self", "Initial patientCategory should be 'self'");
  store.setPatientCategory("assisted_minor");
  assert(useKioskStore.getState().patientCategory === "assisted_minor", "setPatientCategory sets 'assisted_minor'");

  console.log("✅ Step 9 Accessibility & Demographic Inclusivity tests passed successfully!");
}
