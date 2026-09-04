import { DocumentOcrService } from "../services/ocr/documentOcrService";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runStep7Tests() {
  // Test 1: Critical safety rule — No document in normal mode returns empty result without fabrication
  const noDocResult = DocumentOcrService.processDocument({
    hasPhysicalDocument: false,
    demoMode: false
  });
  assert(noDocResult.totalPages === 0, "No document should have 0 totalPages");
  assert(noDocResult.accumulatedMedications.length === 0, "No document should have 0 medications");
  assert(noDocResult.accumulatedLabValues.length === 0, "No document should have 0 lab values");
  assert(noDocResult.isSimulatedDemo === false, "Normal mode no document is not simulated demo");

  // Test 2: Demo mode returns explicit SIMULATED DEMO OCR tag
  const demoResult = DocumentOcrService.processDocument({
    hasPhysicalDocument: true,
    demoMode: true,
    pagesToScan: 1,
    scenario: 1
  });
  assert(demoResult.isSimulatedDemo === true, "Demo mode must be marked as isSimulatedDemo");
  assert(demoResult.statusMessage.includes("[SIMULATED DEMO OCR]"), "Status message must include [SIMULATED DEMO OCR]");
  assert(demoResult.accumulatedMedications.length > 0, "Demo mode extracts sample medications");

  // Test 3: Multi-page accumulation (Page 1 + Page 2)
  const multiPageResult = DocumentOcrService.processDocument({
    hasPhysicalDocument: true,
    demoMode: true,
    pagesToScan: 2,
    scenario: 1
  });
  assert(multiPageResult.totalPages === 2, "Multi-page result should have 2 totalPages");
  assert(multiPageResult.pages.length === 2, "Pages array must contain 2 items");
  assert(multiPageResult.accumulatedMedications.length === 3, "Multi-page should accumulate 3 total medications (2 from p1, 1 from p2)");

  // Test 4: Lab value flag verification (both normal and abnormal values exist)
  const labFlags = demoResult.accumulatedLabValues.map(l => l.abnormalFlag);
  assert(labFlags.includes("high"), "Lab values must include 'high' flag");
  assert(labFlags.includes("normal"), "Lab values must include 'normal' flag");

  // Test 5: OCR failure / uncertainty detection
  const uncertainResult = DocumentOcrService.processDocument({
    hasPhysicalDocument: true,
    demoMode: false,
    pagesToScan: 2
  });
  assert(uncertainResult.hasUncertainFields === true, "Uncertain OCR must flag hasUncertainFields");
  assert(uncertainResult.statusMessage.includes("Some text could not be read reliably"), "Status message must report uncertain text");

  console.log("✅ Step 7 Document Digitization & OCR Hardening tests passed successfully!");
}
