"use client";

import { useCallback } from "react";
import { useKioskStore } from "@/store/kioskStore";
import { translations, TranslationKey, DEFAULT_LANGUAGE, SupportedLanguage } from "./translations";

/**
 * useTranslation()
 * ------------------------------------------------------------------
 * Single source of truth for on-screen text. Reads `language` from
 * the (now persisted — see store/kioskStore.ts) kiosk store, so:
 *   - selecting a language on /language updates every component that
 *     calls t(), not just the TTS voice prompt.
 *   - the choice survives reloads/navigation instead of "reverting"
 *     to the default, because it's persisted to localStorage.
 *
 * Usage:
 *   const { t, lang } = useTranslation();
 *   <h1>{t('selectLanguageTitle')}</h1>
 */
export function useTranslation() {
  const language = useKioskStore((state) => state.language) as SupportedLanguage;

  const t = useCallback(
    (key: TranslationKey): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[language] ?? entry[DEFAULT_LANGUAGE] ?? entry.en;
    },
    [language]
  );

  return { t, lang: language, language };
}
