import test from "node:test";
import assert from "node:assert/strict";
import { assistantNames, languageNames, localizedAssistantName, t } from "../lib/i18n.ts";

const languages = ["en", "hi", "bn", "te", "ta", "mr"];

test("supported languages are configured with native names", () => {
  assert.deepEqual(Object.keys(languageNames).sort(), [...languages].sort());
  assert.equal(languageNames.en, "English");
  assert.equal(languageNames.hi, "हिन्दी");
  assert.equal(languageNames.bn, "বাংলা");
  assert.equal(languageNames.te, "తెలుగు");
  assert.equal(languageNames.ta, "தமிழ்");
  assert.equal(languageNames.mr, "मराठी");
});

test("assistant is branded Anaya in native scripts across all languages", () => {
  const expected = {
    en: "Anaya",
    hi: "अनाया",
    bn: "অনয়া",
    te: "అనయ",
    ta: "அனயா",
    mr: "अनाया",
  };

  for (const lang of languages) {
    assert.equal(assistantNames[lang], expected[lang]);
    assert.equal(localizedAssistantName(lang), expected[lang]);
  }
});

test("essential clinical intake keys exist and are non-empty for all 6 languages", () => {
  const requiredKeys = [
    // Brand & Safety
    "appName",
    "tagline",
    "patientVisit",
    "nonDiagnosticDisclaimer",
    "emergencyNotice",
    "docPrivacyNote",

    // Steps
    "stepLanguage",
    "stepConsent",
    "stepIdentity",
    "stepComplaint",
    "stepAnatomy",
    "stepSymptoms",
    "stepInterview",
    "stepDocuments",
    "stepComplete",

    // Navigation & Common
    "back",
    "next",
    "processing",
    "cancel",
    "continueWithoutAbha",

    // Anatomy & Severity
    "regionHead",
    "regionChest",
    "regionAbdomen",
    "regionBack",
    "regionArms",
    "regionLegs",
    "regionSkin",
    "regionOther",
    "frontView",
    "backView",
    "rateDiscomfort",
    "selectAffectedArea",
    "mild",
    "moderate",
    "severe",
    "verySevere",
    "noPain",

    // Voice-assisted Anatomy
    "speakAffectedArea",
    "voiceListeningArea",
    "voiceHeardPrefix",
    "voiceHeardQuestion",
    "voiceConfirmBtn",
    "voiceEditManuallyBtn",
    "voiceProposedTag",
    "voiceNoMatch",
    "voicePartialMatch",
    "voiceMicDenied",
    "voiceUnsupported",

    // Connection chips
    "connectionOnline",
    "connectionSyncing",
    "connectionOffline",
    "connectionAttention",

    // Assistant
    "assistantTitle",
    "assistantSubtitle",
    "assistantDisclaimer",
  ];

  for (const lang of languages) {
    for (const key of requiredKeys) {
      const val = t(lang, key);
      assert.ok(val, `Missing or empty translation for key "${key}" in language "${lang}"`);
      assert.ok(val.trim().length > 0, `Whitespace-only translation for key "${key}" in "${lang}"`);
    }
  }
});

test("non-English languages provide authentic translated copy, not English fallback", () => {
  const nonEnglish = ["hi", "bn", "te", "ta", "mr"];
  const sampleKeys = [
    "nonDiagnosticDisclaimer",
    "frontView",
    "backView",
    "noPain",
    "regionHead",
    "regionChest",
  ];

  for (const lang of nonEnglish) {
    for (const key of sampleKeys) {
      const enVal = t("en", key);
      const localizedVal = t(lang, key);
      assert.notEqual(
        localizedVal,
        enVal,
        `Key "${key}" in language "${lang}" returned English text instead of native script`
      );
    }
  }
});
