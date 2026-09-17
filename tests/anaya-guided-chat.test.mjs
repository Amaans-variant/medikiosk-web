import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { t } from "../lib/i18n.ts";

function read(rel) {
  return fs.readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
}

test("Anaya assistant renders categorized guided starter cards on empty chat state", () => {
  const page = read("app/patient/assistant/page.tsx");
  assert.match(page, /anaya-starter-container/);
  assert.match(page, /anaya-starter-grid/);
  assert.match(page, /anayaStarterSymptomsPrompt/);
  assert.match(page, /anayaStarterDoctorPrepPrompt/);
  assert.match(page, /anayaStarterDocumentsPrompt/);
  assert.match(page, /anayaStarterWhereItHurtsPrompt/);
  assert.match(page, /anayaStarterGeneralHealthPrompt/);
  assert.match(page, /anayaStarterSomethingElsePrompt/);
});

test("Anaya assistant supports contextual intake step prompts", () => {
  const page = read("app/patient/assistant/page.tsx");
  assert.match(page, /anaya-step-banner/);
  assert.match(page, /anayaStepPromptAnatomy/);
  assert.match(page, /anayaStepPromptInterview/);
  assert.match(page, /anayaStepPromptDocuments/);
  assert.match(page, /anayaStepPromptComplete/);
});

test("Anaya assistant renders contextual quick action chips for follow-up progression", () => {
  const page = read("app/patient/assistant/page.tsx");
  assert.match(page, /anaya-quick-chips/);
  assert.match(page, /anayaChipTellMore/);
  assert.match(page, /anayaChipWhenStarted/);
  assert.match(page, /anayaChipHowSevere/);
  assert.match(page, /anayaChipOpenAnatomy/);
  assert.match(page, /anayaChipMainMenu/);
});

test("Anaya assistant renders accessible Main Menu drawer with topic actions and workflow deep links", () => {
  const page = read("app/patient/assistant/page.tsx");
  assert.match(page, /anaya-drawer/);
  assert.match(page, /anaya-menu-trigger/);
  assert.match(page, /anayaMainMenu/);
  assert.match(page, /anayaMenuDescribeSymptoms/);
  assert.match(page, /anayaMenuDoctorPrep/);
  assert.match(page, /anayaMenuWhereItHurts/);
  assert.match(page, /anayaMenuDocumentHelp/);
  assert.match(page, /anayaMenuGeneralHealth/);
  assert.match(page, /anayaMenuVoiceHelp/);
  assert.match(page, /anayaMenuRestartChat/);
  assert.match(page, /router\.push\("\/patient\/anatomy"\)/);
  assert.match(page, /router\.push\("\/patient\/documents"\)/);
});

test("Anaya assistant provides isolated conversation restart with confirmation modal", () => {
  const page = read("app/patient/assistant/page.tsx");
  const route = read("app/api/patient/assistant/chat/route.ts");

  assert.match(page, /anaya-modal/);
  assert.match(page, /anayaRestartTitle/);
  assert.match(page, /anayaRestartDesc/);
  assert.match(page, /anayaRestartConfirm/);
  assert.match(page, /anayaRestartCancel/);
  assert.match(page, /handleRestartChat/);
  assert.match(page, /DELETE/);

  // Verify backend route deletes only from chat_messages for the session
  assert.match(route, /export async function DELETE/);
  assert.match(route, /DELETE FROM chat_messages/);
  assert.match(route, /WHERE session_id = \$1/);
  // Ensure it does not drop complaints or session
  assert.doesNotMatch(route, /DELETE FROM complaints/);
  assert.doesNotMatch(route, /DELETE FROM patient_sessions/);
  assert.doesNotMatch(route, /DELETE FROM documents/);
});

test("All 6 languages provide full native translations for Anaya guided chat keys", () => {
  const keysToCheck = [
    "anayaHeaderEyebrow",
    "anayaHeaderSub",
    "anayaWelcomeTitle",
    "anayaWelcomeSubtitle",
    "anayaStarterSymptomsTitle",
    "anayaStarterSymptomsDesc",
    "anayaStarterSymptomsPrompt",
    "anayaStarterDoctorPrepTitle",
    "anayaStarterDoctorPrepDesc",
    "anayaStarterDoctorPrepPrompt",
    "anayaStarterDocumentsTitle",
    "anayaStarterDocumentsDesc",
    "anayaStarterDocumentsPrompt",
    "anayaStarterWhereItHurtsTitle",
    "anayaStarterWhereItHurtsDesc",
    "anayaStarterWhereItHurtsPrompt",
    "anayaStarterGeneralHealthTitle",
    "anayaStarterGeneralHealthDesc",
    "anayaStarterGeneralHealthPrompt",
    "anayaStarterSomethingElseTitle",
    "anayaStarterSomethingElseDesc",
    "anayaStarterSomethingElsePrompt",
    "anayaStepPromptAnatomy",
    "anayaStepPromptInterview",
    "anayaStepPromptDocuments",
    "anayaStepPromptComplete",
    "anayaChipTellMore",
    "anayaChipWhenStarted",
    "anayaChipHowSevere",
    "anayaChipOpenAnatomy",
    "anayaChipOpenInterview",
    "anayaChipOpenDocs",
    "anayaChipQuestionsDoctor",
    "anayaChipMainMenu",
    "anayaMainMenu",
    "anayaMenuDescribeSymptoms",
    "anayaMenuDoctorPrep",
    "anayaMenuWhereItHurts",
    "anayaMenuDocumentHelp",
    "anayaMenuGeneralHealth",
    "anayaMenuVoiceHelp",
    "anayaMenuRestartChat",
    "anayaCloseMenu",
    "anayaRestartTitle",
    "anayaRestartDesc",
    "anayaRestartConfirm",
    "anayaRestartCancel",
    "anayaRestartSuccess",
    "anayaNavAnatomy",
    "anayaNavInterview",
    "anayaNavDocuments",
    "newMessages",
  ];

  for (const lang of ["en", "hi", "bn", "te", "ta", "mr"]) {
    for (const key of keysToCheck) {
      const val = t(lang, key);
      assert.ok(val && typeof val === "string" && val.trim().length > 0, `Missing translation for ${key} in ${lang}`);
      if (lang !== "en") {
        const enVal = t("en", key);
        // Ensure non-English is translated rather than returning the English string
        assert.notEqual(val, enVal, `Key ${key} in ${lang} matches English fallback exactly`);
      }
    }
  }
});

test("Anaya UI implements auto-scrolling with smooth behavior and floating new messages indicator", () => {
  const page = read("app/patient/assistant/page.tsx");
  assert.match(page, /threadRef/);
  assert.match(page, /bottomRef/);
  assert.match(page, /isNearBottomRef/);
  assert.match(page, /scrollToBottom/);
  assert.match(page, /showScrollBottom/);
  assert.match(page, /anaya-scroll-bottom-pill/);
  assert.match(page, /newMessages/);
});

test("Anaya backend provides rich conversational replies for wellness, fitness, sleep, vitals, and safety", () => {
  const code = read("lib/assistant.ts");
  assert.match(code, /isFitnessQuery/);
  assert.match(code, /isSleepQuery/);
  assert.match(code, /isNutritionQuery/);
  assert.match(code, /isFeverOrVitalsQuery/);
  assert.match(code, /getDeterministicResponse/);
  assert.match(code, /callGemini/);
  assert.match(code, /150 minutes/);
  assert.match(code, /7–9 hours/);
});

test("Anaya UI preserves voice transcription, speech audio and draft encryption contract", () => {
  const page = read("app/patient/assistant/page.tsx");
  assert.match(page, /transcript/);
  assert.match(page, /\/api\/voice\/speak/);
  assert.match(page, /\/api\/voice\/transcribe/);
  assert.match(page, /medi-chat-draft/);
  assert.match(page, /draftMutationId/);
  assert.match(page, /clientMutationId/);
  assert.match(page, /ensureSynced/);
  assert.match(page, /clearDraft\("medi-chat-draft"\)/);
  assert.match(page, /Female voice health assistant/);
  assert.match(page, /👩‍⚕️/);
  assert.match(page, /general information only/);
});
