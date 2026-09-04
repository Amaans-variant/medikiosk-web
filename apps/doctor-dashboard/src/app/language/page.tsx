"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { cn } from "@/lib/utils";
import { Volume2, Activity, ArrowRight, Check } from "lucide-react";

export interface LanguageOption {
  code: string;
  name: string;
  enName: string;
  prompt: string;
}

export interface VoiceLanguageOption {
  code: string;
  name: string;
  speechCode: string;
  isSupported: boolean;
  desc: string;
}

const UI_LANGUAGES: LanguageOption[] = [
  { code: "hi", name: "हिन्दी", enName: "Hindi", prompt: "नमस्ते, कृपया अपनी भाषा चुनें।" },
  { code: "en", name: "English", enName: "English", prompt: "Welcome, please choose your language to begin." },
  { code: "mr", name: "मराठी", enName: "Marathi", prompt: "नमस्कार, कृपया आपली भाषा निवडा." },
  { code: "gu", name: "ગુજરાતી", enName: "Gujarati", prompt: "નમસ્તે, કૃપા કરીને તમારી ભાષા પસંદ કરો." },
  { code: "bn", name: "বাংলা", enName: "Bengali", prompt: "নমস্কার, অনুগ্রহ করে আপনার ভাষা নির্বাচন করুন।" },
  { code: "ta", name: "தமிழ்", enName: "Tamil", prompt: "வணக்கம், தயவுசெய்து உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்." },
];

const VOICE_LANGUAGES: VoiceLanguageOption[] = [
  { code: "hinglish", name: "Hinglish Voice (Hindi + English)", speechCode: "hi-IN", isSupported: true, desc: "Aap bol kar Hindi ya English mix kar ke bata sakte hain" },
  { code: "hi-IN", name: "Hindi Voice (शुद्ध हिन्दी आवाज)", speechCode: "hi-IN", isSupported: true, desc: "बोल कर हिन्दी में लक्षण बताएं" },
  { code: "en-IN", name: "English Voice (Indian English)", speechCode: "en-IN", isSupported: true, desc: "Speak symptoms in English" },
  { code: "mr-IN", name: "Marathi Voice (मराठी आवाज)", speechCode: "mr-IN", isSupported: true, desc: "मराठीमध्ये लक्षणे सांगा" },
  { code: "gu-IN", name: "Gujarati Voice (ગુજરાતી અવાજ)", speechCode: "gu-IN", isSupported: true, desc: "ગુજરાતીમાં લક્ષણો જણાવો" },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { setLanguage, setVoiceLanguage, preferredLanguage, voiceLanguage } = useKioskStore();
  const [selectedUi, setSelectedUi] = useState<string>(preferredLanguage || "hi");
  const [selectedVoice, setSelectedVoice] = useState<string>(voiceLanguage || "hinglish");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const handleUiSelect = (code: string) => {
    setSelectedUi(code);
    setLanguage(code);
    const prompt = UI_LANGUAGES.find(l => l.code === code)?.prompt || "";
    playSpeech(prompt, code === "en" ? "en-IN" : "hi-IN");
  };

  const handleVoiceSelect = (vCode: string) => {
    setSelectedVoice(vCode);
    setVoiceLanguage(vCode);
  };

  const playSpeech = (text: string, langCode: string = "hi-IN") => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleBegin = () => {
    setLanguage(selectedUi);
    setVoiceLanguage(selectedVoice);
    router.push("/consultation-type");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center pb-32">
      {/* Branding Header */}
      <header className="w-full max-w-[1024px] px-4 sm:px-8 pt-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-xs mb-3">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-primary font-bold text-2xl sm:text-3xl tracking-tight">MediKiosk</h1>
          <span className="text-xs bg-teal-light text-teal font-semibold px-2 py-0.5 rounded-full border border-teal/20">
            AIIA OPD Intake
          </span>
        </div>
        <p className="text-text-muted text-xs sm:text-sm mt-0.5">
          All India Institute of Ayurveda · Ministry of Ayush, Govt. of India
        </p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[720px] mt-6 flex flex-col items-center px-4 space-y-6">
        
        {/* Universal Audio Prompt with real TTS */}
        <div className="text-center flex flex-col items-center gap-2">
          <button 
            onClick={() => playSpeech("Namaste. Kripya apni pasand ki bhasha aur bolne ki bhasha chunein.", "hi-IN")}
            aria-label="Play audio prompt"
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-colors",
              isSpeaking 
                ? "bg-teal text-white ring-4 ring-teal/20" 
                : "bg-teal-light text-teal border border-teal hover:bg-[#E8F8F0]"
            )}
          >
            <Volume2 className="w-8 h-8" />
          </button>
          <h2 className="text-text font-bold text-2xl sm:text-3xl mt-1">अपनी भाषा चुनें / Select Language</h2>
          <p className="text-text-muted text-xs sm:text-sm">Large touch buttons designed for all patients & elderly accessibility</p>
        </div>

        {/* 1. UI Display Language Selection */}
        <div className="w-full space-y-3">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider font-mono">
            1. Display Language (स्क्रीन की भाषा)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 w-full">
            {UI_LANGUAGES.map((lang) => {
              const isSelected = selectedUi === lang.code;
              
              return (
                <button
                  key={lang.code}
                  onClick={() => handleUiSelect(lang.code)}
                  className={cn(
                    "flex flex-col items-center justify-center p-5 min-h-[110px] rounded-2xl border-2 transition-all relative bg-surface-card shadow-xs hover:border-primary/50 text-center",
                    isSelected 
                      ? "border-primary bg-primary-light/60 ring-2 ring-primary/30" 
                      : "border-border"
                  )}
                >
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                  <div className="text-text font-bold text-2xl sm:text-3xl mb-0.5">{lang.name}</div>
                  <div className="text-text-muted text-xs font-semibold">{lang.enName}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Voice Input Language Selection (Persisted Separately) */}
        <div className="w-full space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-teal uppercase tracking-wider font-mono">
              2. Voice Speech Input (बोलने की आवाज)
            </h3>
            <span className="text-[10px] bg-teal-light text-teal font-bold px-2 py-0.5 rounded">
              Persisted Separately
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {VOICE_LANGUAGES.map((vLang) => {
              const isSelected = selectedVoice === vLang.code;

              return (
                <button
                  key={vLang.code}
                  onClick={() => handleVoiceSelect(vLang.code)}
                  className={cn(
                    "p-4 rounded-2xl border-2 text-left transition-all relative bg-surface-card flex flex-col justify-between min-h-[90px]",
                    isSelected 
                      ? "border-teal bg-teal-light/50 ring-2 ring-teal/30" 
                      : "border-border hover:border-teal/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text text-sm sm:text-base">{vLang.name}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-1 leading-normal">{vLang.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Button */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-sm p-4 sm:p-5 flex justify-center border-t border-border z-40">
        <button 
          disabled={!selectedUi}
          onClick={handleBegin}
          className="max-w-[720px] w-full bg-primary text-white font-bold text-lg sm:text-xl py-4 rounded-2xl shadow-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>शुरू करें (Begin Clinical Intake)</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
