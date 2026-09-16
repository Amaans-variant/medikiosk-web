"use client";

import React, { useState } from "react";
import { 
  RotateCcw, 
  ChevronDown, 
  Check, 
  Globe 
} from "lucide-react";
import { useKioskStore } from "@/store/kioskStore";
import { cn } from "@/lib/utils";

interface LanguageOption {
  code: string;
  nativeName: string;
  enName: string;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "hi", nativeName: "हिन्दी", enName: "Hindi" },
  { code: "en", nativeName: "English", enName: "English" },
  { code: "mr", nativeName: "मराठी", enName: "Marathi" },
  { code: "gu", nativeName: "ગુજરાતી", enName: "Gujarati" },
  { code: "bn", nativeName: "বাংলা", enName: "Bengali" },
  { code: "ta", nativeName: "தமிழ்", enName: "Tamil" },
];

export default function CompactLanguageHeaderControl() {
  const { language, setLanguage, setDisplayLanguage, preferredLanguage } = useKioskStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = SUPPORTED_LANGUAGES.find(l => l.code === language) || {
    code: language,
    nativeName: language.toUpperCase(),
    enName: "Language"
  };

  const isTempEnglish = language === "en" && preferredLanguage && preferredLanguage !== "en";

  const handleSelect = (code: string) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left z-40">
      <div className="flex items-center gap-1 bg-surface-card border border-border rounded-xl p-1 shadow-xs">
        {/* Language Dropdown Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={`Selected language: ${currentOption.nativeName}. Click to change language.`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-text hover:bg-surface transition-colors"
        >
          <Globe className="w-4 h-4 text-teal" />
          <span>{currentOption.nativeName}</span>
          <ChevronDown className={cn("w-3.5 h-3.5 text-text-muted transition-transform duration-200", isOpen && "rotate-180")} />
        </button>

      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-surface-card border border-border shadow-lg z-40 py-2 animate-fadeIn">
            <div className="px-3 py-1.5 border-b border-border mb-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Primary Language / भाषा
              </span>
            </div>

            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={cn(
                  "w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-surface transition-colors",
                  language === lang.code ? "text-teal bg-teal-light/50 font-bold" : "text-text"
                )}
              >
                <span>{lang.nativeName} ({lang.enName})</span>
                {language === lang.code && <Check className="w-4 h-4 text-teal" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
