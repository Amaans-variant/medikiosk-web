"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { ConsultationType } from "@/models";
import { Stethoscope, Leaf, Volume2, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConsultationTypeScreen() {
  const router = useRouter();
  const { currentPatient, setConsultationType, language } = useKioskStore();
  const [selectedType, setSelectedType] = useState<ConsultationType>(
    currentPatient.consultationType || "ayurveda"
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const handleSelect = (type: ConsultationType) => {
    setSelectedType(type);
    setConsultationType(type);
    playSpeech(
      type === "ayurveda"
        ? "Aapne Ayurveda paramarsh chuna hai. Dashavidha Pariksha aage prarambh hogi."
        : "You have selected Modern Medicine consultation. Proceeding to clinical intake."
    );
  };

  const playSpeech = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleContinue = () => {
    setConsultationType(selectedType);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center pb-28">
      {/* Top Header Navigation */}
      <header className="w-full max-w-[1024px] px-8 pt-8 flex justify-between items-center">
        <button 
          onClick={() => router.push("/language")}
          className="text-primary font-semibold text-base flex items-center gap-1.5 animate-press"
        >
          <span className="text-xl">←</span> भाषा बदलें (Language)
        </button>
        <span className="text-xs font-bold bg-teal-light text-teal px-3 py-1.5 rounded-full border border-teal/30">
          AIIA MediKiosk Kiosk Block
        </span>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[840px] mt-6 flex flex-col items-center px-4 space-y-6">
        {/* Audio Prompt & Title */}
        <div className="text-center flex flex-col items-center gap-3">
          <button 
            onClick={() => playSpeech("Kripya paramarsh ka prakar chunein. Modern Medicine ya Ayurveda. Please select your consultation type.")}
            aria-label="Play audio prompt"
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center animate-press shadow-md transition-all",
              isSpeaking ? "bg-teal text-white ring-4 ring-teal/30 scale-105" : "bg-teal-light text-teal border-2 border-teal hover:bg-[#E8F8F0]"
            )}
          >
            <Volume2 className="w-7 h-7" />
          </button>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono block mb-1">
              CONSULTATION TYPE / परामर्श प्रणाली
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-text">
              {language === "hi" ? "परामर्श का प्रकार चुनें" : "Select Consultation Stream"}
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-md mx-auto">
              Choose between Modern Allopathic clinical triage or dedicated Ayurvedic Dashavidha Pariksha.
            </p>
          </div>
        </div>

        {/* 2 Big Consultation Stream Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          {/* 1. Modern Medicine Card */}
          <div
            onClick={() => handleSelect("modern")}
            className={cn(
              "cursor-pointer rounded-3xl p-6 sm:p-7 border-2 transition-all flex flex-col justify-between relative bg-surface-card shadow-xs hover:border-primary/50",
              selectedType === "modern"
                ? "border-primary bg-primary-light/40 ring-2 ring-primary/20"
                : "border-border"
            )}
          >
            {selectedType === "modern" && (
              <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Stethoscope className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-mono">
                  Allopathy / आधुनिक चिकित्सा
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-text mt-2">Modern Medicine</h2>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  General OPD, Internal Medicine, Cardiology, and Emergency Triage.
                </p>
              </div>

              <div className="space-y-2 text-xs text-text bg-surface p-3.5 rounded-2xl border border-border font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Symptom-based anatomical triage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Vital signs & Emergency red-flag rules</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>OCR digitization of prescriptions & labs</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect("modern");
              }}
              className={cn(
                "w-full mt-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors",
                selectedType === "modern"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface border border-border text-text hover:bg-surface-card"
              )}
            >
              <span>{selectedType === "modern" ? "✓ Selected (चयनित)" : "Select Modern Medicine"}</span>
            </button>
          </div>

          {/* 2. Ayurveda (AYUSH) Card */}
          <div
            onClick={() => handleSelect("ayurveda")}
            className={cn(
              "cursor-pointer rounded-3xl p-6 sm:p-7 border-2 transition-all flex flex-col justify-between relative bg-surface-card shadow-xs hover:border-teal/50",
              selectedType === "ayurveda"
                ? "border-teal bg-teal-light/40 ring-2 ring-teal/20"
                : "border-border"
            )}
          >
            {selectedType === "ayurveda" && (
              <div className="absolute top-4 right-4 bg-teal text-white p-1 rounded-full shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-light text-teal flex items-center justify-center border border-teal/30">
                <Leaf className="w-7 h-7 text-teal" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-light text-teal px-2.5 py-0.5 rounded-full font-mono">
                  AYUSH · AIIA Standard / आयुर्वेद
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-text mt-2">Ayurveda Consultation</h2>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Dedicated Dashavidha & Ashtavidha Pariksha for personalized Ayush OPD care.
                </p>
              </div>

              <div className="space-y-2 text-xs text-text bg-surface p-3.5 rounded-2xl border border-border font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                  <span>Prakriti, Vikriti & Agni Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                  <span>Sara, Samhanana, Pramana & Satmya</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                  <span>Ahara Shakti, Vyayama Shakti & Ahara-Vihara</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect("ayurveda");
              }}
              className={cn(
                "w-full mt-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors",
                selectedType === "ayurveda"
                  ? "bg-teal text-white shadow-xs"
                  : "bg-surface border border-border text-text hover:bg-surface-card"
              )}
            >
              <span>{selectedType === "ayurveda" ? "✓ Selected (चयनित)" : "Select Ayurveda"}</span>
            </button>
          </div>
        </div>

        {/* Clinical Safety Notice */}
        <div className="w-full bg-surface-card border border-border rounded-2xl p-4 text-xs text-text-muted flex items-start gap-3">
          <span className="text-base text-primary">ℹ️</span>
          <p className="leading-relaxed">
            <strong className="text-text">Clinical Protocol:</strong> MediKiosk collects structured medical history autonomously for clinician evaluation. Final clinical diagnosis and treatment decisions remain exclusively with the consulting physician / Vaidya.
          </p>
        </div>
      </main>

      {/* Sticky Bottom Action Button */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-sm p-4 sm:p-5 flex justify-center border-t border-border z-40">
        <button
          onClick={handleContinue}
          className="max-w-[840px] w-full bg-primary text-white font-bold text-base sm:text-xl py-4 rounded-2xl shadow-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
        >
          <span>आगे बढ़ें (Continue to Patient Check-In)</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
