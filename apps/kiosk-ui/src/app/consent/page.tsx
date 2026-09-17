"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { 
  ShieldCheck, 
  Lock, 
  Stethoscope, 
  RefreshCw, 
  Volume2, 
  ArrowRight, 
  Check, 
  AlertTriangle, 
  Fingerprint, 
  X, 
  Printer, 
  HelpCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConsentScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { 
    setConsentStatus, 
    preferredLanguage, 
    resetPatientSession 
  } = useKioskStore();

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showDeclineModal, setShowDeclineModal] = useState<boolean>(false);
  const [walkInTokenIssued, setWalkInTokenIssued] = useState<number | null>(null);

  // Granular scope permissions
  const [scope, setScope] = useState({
    intakeHistory: true,
    documentOcr: true,
    physicianSharing: true,
    abdmRecordLinkage: true,
  });

  const toggleScope = (key: keyof typeof scope) => {
    setScope((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const playSpeech = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = preferredLanguage === "en" ? "en-IN" : "hi-IN";
      utterance.lang = langCode;
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAgreeAndContinue = () => {
    setConsentStatus("ACCEPTED", scope);
    router.push("/login");
  };

  const handleDeclineClick = () => {
    setShowDeclineModal(true);
  };

  const handleConfirmDeclineWalkIn = () => {
    setConsentStatus("DECLINED", {
      intakeHistory: false,
      documentOcr: false,
      physicianSharing: false,
      abdmRecordLinkage: false,
    });
    // Generate a physical counter walk-in token
    const walkInToken = Math.floor(100 + Math.random() * 899);
    setWalkInTokenIssued(walkInToken);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center pb-32">
      {/* 5-Step Clinical Progress Bar */}
      <div className="w-full max-w-[1024px] px-4 sm:px-8 pt-6">
        <div className="h-2 w-full bg-border rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal to-teal-bright w-[40%] transition-all duration-500 ease-out" />
        </div>
        <div className="mt-2 text-text-muted text-xs sm:text-sm font-medium flex justify-between items-center">
          <span className="font-semibold text-teal">{t("consentStep")}</span>
          <span className="text-xs font-mono bg-teal-light text-teal px-2 py-0.5 rounded border border-teal/20">
            DPDP Act 2023 · ABDM Ready
          </span>
        </div>
      </div>

      {/* Header Navigation */}
      <header className="w-full max-w-[1024px] px-4 sm:px-8 flex justify-between items-center mt-4 sm:mt-6">
        <button 
          onClick={() => router.push("/consultation-type")}
          className="text-primary font-semibold text-base sm:text-lg flex items-center gap-1.5 animate-press hover:underline"
        >
          <span className="text-xl">←</span> {t("back")}
        </button>
        <button 
          onClick={handleDeclineClick}
          className="text-text-muted hover:text-alert font-semibold text-xs sm:text-sm flex items-center gap-1.5 bg-surface-card px-3.5 py-1.5 rounded-xl border border-border hover:border-alert/40 transition-colors"
        >
          {t("declineConsent")}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[840px] mt-4 sm:mt-6 flex flex-col items-center px-4 space-y-6">
        
        {/* Title & Speech Assist */}
        <div className="text-center flex flex-col items-center gap-3">
          <button 
            onClick={() => playSpeech(t("consentAudioPrompt"))}
            aria-label="Play audio explanation"
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center animate-press shadow-md transition-all",
              isSpeaking 
                ? "bg-teal text-white ring-4 ring-teal/30 scale-105" 
                : "bg-teal-light text-teal border-2 border-teal hover:bg-[#E8F8F0]"
            )}
          >
            <Volume2 className="w-7 h-7" />
          </button>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-teal font-mono block mb-1">
              PATIENT RIGHTS & DATA GOVERNANCE
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-text max-w-xl">
              {t("consentTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1.5 max-w-lg mx-auto leading-relaxed">
              {t("consentSubtitle")}
            </p>
          </div>
        </div>

        {/* 4 Core Privacy Assurances Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {/* Pillar 1 */}
          <div className="bg-surface-card border border-border rounded-2xl p-5 shadow-xs flex items-start gap-3.5 hover:border-teal/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-light text-teal flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text">{t("consentPillar1Title")}</h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{t("consentPillar1Desc")}</p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-surface-card border border-border rounded-2xl p-5 shadow-xs flex items-start gap-3.5 hover:border-teal/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text">{t("consentPillar2Title")}</h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{t("consentPillar2Desc")}</p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-surface-card border border-border rounded-2xl p-5 shadow-xs flex items-start gap-3.5 hover:border-teal/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text">{t("consentPillar3Title")}</h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{t("consentPillar3Desc")}</p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="bg-surface-card border border-border rounded-2xl p-5 shadow-xs flex items-start gap-3.5 hover:border-teal/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text">{t("consentPillar4Title")}</h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{t("consentPillar4Desc")}</p>
            </div>
          </div>
        </div>

        {/* Granular Scope Authorizations */}
        <div className="w-full bg-surface-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-teal" />
              <h2 className="text-sm font-bold text-text">{t("consentScopeTitle")}</h2>
            </div>
            <span className="text-[11px] text-text-muted">ABDM M2 Consent Artifact</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Scope 1: Intake History */}
            <div 
              onClick={() => toggleScope("intakeHistory")}
              className={cn(
                "p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 select-none",
                scope.intakeHistory ? "border-teal bg-teal-light/40" : "border-border hover:border-border-hover"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors",
                scope.intakeHistory ? "bg-teal text-white" : "border border-border bg-surface"
              )}>
                {scope.intakeHistory && <Check className="w-3.5 h-3.5" />}
              </div>
              <div className="text-xs">
                <p className="font-bold text-text">{t("consentScopeHistory")}</p>
              </div>
            </div>

            {/* Scope 2: Document OCR */}
            <div 
              onClick={() => toggleScope("documentOcr")}
              className={cn(
                "p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 select-none",
                scope.documentOcr ? "border-teal bg-teal-light/40" : "border-border hover:border-border-hover"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors",
                scope.documentOcr ? "bg-teal text-white" : "border border-border bg-surface"
              )}>
                {scope.documentOcr && <Check className="w-3.5 h-3.5" />}
              </div>
              <div className="text-xs">
                <p className="font-bold text-text">{t("consentScopeOcr")}</p>
              </div>
            </div>

            {/* Scope 3: Physician Sharing */}
            <div 
              onClick={() => toggleScope("physicianSharing")}
              className={cn(
                "p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 select-none",
                scope.physicianSharing ? "border-teal bg-teal-light/40" : "border-border hover:border-border-hover"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors",
                scope.physicianSharing ? "bg-teal text-white" : "border border-border bg-surface"
              )}>
                {scope.physicianSharing && <Check className="w-3.5 h-3.5" />}
              </div>
              <div className="text-xs">
                <p className="font-bold text-text">{t("consentScopeDoctor")}</p>
              </div>
            </div>

            {/* Scope 4: ABDM Linkage */}
            <div 
              onClick={() => toggleScope("abdmRecordLinkage")}
              className={cn(
                "p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 select-none",
                scope.abdmRecordLinkage ? "border-teal bg-teal-light/40" : "border-border hover:border-border-hover"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors",
                scope.abdmRecordLinkage ? "bg-teal text-white" : "border border-border bg-surface"
              )}>
                {scope.abdmRecordLinkage && <Check className="w-3.5 h-3.5" />}
              </div>
              <div className="text-xs">
                <p className="font-bold text-text">{t("consentScopeAbdm")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Non-Diagnostic Notice */}
        <div className="w-full bg-surface-card/60 border border-border rounded-xl p-3 text-center text-xs text-text-muted flex items-center justify-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary shrink-0" />
          <span>{t("consentNonDiagnosticNotice")}</span>
        </div>
      </main>

      {/* Sticky Bottom Action Dock */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-sm p-4 sm:p-5 flex justify-center border-t border-border z-40">
        <div className="max-w-[840px] w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAgreeAndContinue}
            className="flex-1 bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 animate-press"
          >
            <span>{t("agreeAndContinue")}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleDeclineClick}
            className="sm:w-48 border-2 border-border text-text-muted font-bold text-base py-4 rounded-2xl hover:border-alert/50 hover:text-alert transition-colors"
          >
            {t("declineConsent")}
          </button>
        </div>
      </div>

      {/* Decline / Walk-in Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            {walkInTokenIssued ? (
              // Walk-in Token Output Screen
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 rounded-2xl bg-teal-light text-teal flex items-center justify-center mx-auto">
                  <Printer className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text">Walk-in Physical Token Issued</h3>
                  <p className="text-xs text-text-muted mt-1">
                    Please proceed to the physical OPD registration counter.
                  </p>
                </div>
                <div className="bg-surface border-2 border-dashed border-teal/40 rounded-2xl p-6">
                  <span className="text-xs uppercase tracking-widest text-text-muted font-mono block">Physical Token No.</span>
                  <div className="text-5xl font-black text-primary font-mono my-2">
                    W-{walkInTokenIssued}
                  </div>
                  <p className="text-xs text-teal font-semibold">Triage Counter 1 · Manual Case Registration</p>
                </div>
                <button
                  onClick={() => {
                    resetPatientSession();
                    setShowDeclineModal(false);
                    router.push("/language");
                  }}
                  className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-colors"
                >
                  Return to Home Screen
                </button>
              </div>
            ) : (
              // Decline Confirmation Modal
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text">{t("declineModalTitle")}</h3>
                      <p className="text-xs text-text-muted">AIIA Patient Privacy Choice</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDeclineModal(false)}
                    className="text-text-muted hover:text-text p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 leading-relaxed space-y-2">
                  <p className="font-semibold">
                    {t("declineModalDesc")}
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Declining digital consent will not affect your right to medical examination. An OPD physician will record your case notes on physical paper forms.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleConfirmDeclineWalkIn}
                    className="flex-1 bg-amber-600 text-white font-bold text-sm py-3 rounded-xl hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{t("declineModalWalkInBtn")}</span>
                  </button>
                  <button
                    onClick={() => setShowDeclineModal(false)}
                    className="flex-1 border border-border text-text font-bold text-sm py-3 rounded-xl hover:bg-surface transition-colors"
                  >
                    {t("declineModalReconsiderBtn")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
