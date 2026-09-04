"use client";

import React, { useState } from "react";
import { useKioskStore } from "@/store/kioskStore";
import { AyushAssessment } from "@/models";
import { DASHAVIDHA_QUESTIONS } from "@/rules/ayushRules";
import { VoiceService } from "@/services/voice/voiceService";
import { 
  Leaf, 
  Flame, 
  Volume2, 
  Mic, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  ChevronRight, 
  ChevronLeft,
  Check,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onComplete?: () => void;
}

export default function AyurvedaConsultationFlow({ onComplete }: Props) {
  const { currentPatient, setAyushAssessmentField, setAyushData, language } = useKioskStore();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  
  // Voice Recognition States
  const [isListening, setIsListening] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");
  const [voiceConfirmationPending, setVoiceConfirmationPending] = useState(false);
  const [pendingVoiceField, setPendingVoiceField] = useState<keyof AyushAssessment | null>(null);
  const [pendingVoiceValue, setPendingVoiceValue] = useState<string>("");

  // Adaptive Follow-up State
  const [showAdaptiveQuestion, setShowAdaptiveQuestion] = useState(false);
  const [adaptiveAnswer, setAdaptiveAnswer] = useState<string>("");

  // 4 Stepper Sections grouping the 12 SIH Dashavidha fields
  const SECTIONS = [
    {
      id: "dosha_constitution",
      titleHi: "1. प्रकृति एवं विकृति (Prakriti & Vikriti)",
      titleEn: "Doshic Constitution & Morbidity",
      icon: Flame,
      fieldIds: ["prakriti", "vikriti"]
    },
    {
      id: "physical_frame",
      titleHi: "2. सार, संहनन एवं प्रमाण (Sara, Samhanana, Pramana)",
      titleEn: "Tissue Quality, Compactness & Anthropometry",
      icon: Leaf,
      fieldIds: ["sara", "samhanana", "pramana"]
    },
    {
      id: "mental_adaptability",
      titleHi: "3. सात्म्य, सत्त्व एवं वय (Satmya, Sattva, Vaya)",
      titleEn: "Adaptability, Mental Endurance & Age Stage",
      icon: Sparkles,
      fieldIds: ["satmya", "sattva", "vaya"]
    },
    {
      id: "habits_lifestyle",
      titleHi: "4. आहार-व्यायाम शक्ति व विहार (Ahara, Vyayama, Vihara)",
      titleEn: "Digestive Power, Exercise Capacity & Lifestyle",
      icon: Leaf,
      fieldIds: ["aharaShakti", "vyayamaShakti", "ahara", "vihara"]
    }
  ];

  const currentSection = SECTIONS[currentSectionIndex];
  const currentQuestions = DASHAVIDHA_QUESTIONS.filter((q) =>
    currentSection.fieldIds.includes(q.id)
  );

  const handleSelectOption = (fieldId: string, optionId: string) => {
    setAyushAssessmentField(fieldId as keyof AyushAssessment, optionId);
    if (fieldId === "prakriti") {
      setAyushData(optionId);
    }
    
    // Trigger adaptive follow-up if Pitta or Vata is selected
    if (fieldId === "prakriti" && (optionId.includes("Pitta") || optionId.includes("Vata"))) {
      setShowAdaptiveQuestion(true);
    }
  };

  // Voice Interaction handler
  const handleStartVoice = (fieldId: string) => {
    if (isListening) {
      VoiceService.stopListening();
      setIsListening(false);
      setActiveVoiceField(null);
      return;
    }

    setActiveVoiceField(fieldId);
    setIsListening(true);
    setVoiceTranscript("");
    setVoiceConfirmationPending(false);

    VoiceService.speak("Kripya bolkar batayein. Hum sun rahe hain.", "hi-IN", () => {
      VoiceService.startListening(
        {
          onStart: () => setIsListening(true),
          onInterim: (text) => setVoiceTranscript(text),
          onResult: (result) => {
            setIsListening(false);
            setVoiceTranscript(result.normalizedText || result.rawText);
            
            // Map natural speech to field
            let mappedValue = result.rawText;
            const textLower = result.rawText.toLowerCase();

            if (fieldId === "prakriti") {
              if (textLower.includes("pitta") || textLower.includes("jalan") || textLower.includes("teekha")) {
                mappedValue = "Pitta";
              } else if (textLower.includes("vata") || textLower.includes("dard") || textLower.includes("sukha")) {
                mappedValue = "Vata";
              } else if (textLower.includes("kapha") || textLower.includes("bhari") || textLower.includes("balgam")) {
                mappedValue = "Kapha";
              } else {
                mappedValue = "Vata-Pitta";
              }
            } else if (fieldId === "aharaShakti") {
              if (textLower.includes("teevra") || textLower.includes("bahut bhookh") || textLower.includes("jalan")) {
                mappedValue = "Pravara Ahara Shakti";
              } else if (textLower.includes("kam") || textLower.includes("apach") || textLower.includes("bhookh nahi")) {
                mappedValue = "Mandagni";
              } else {
                mappedValue = "Madhyama Ahara Shakti";
              }
            } else if (fieldId === "vihara") {
              if (textLower.includes("der raat") || textLower.includes("neend nahi") || textLower.includes("mobile")) {
                mappedValue = "Ratri-Jagarana";
              } else if (textLower.includes("din me") || textLower.includes("dopahar")) {
                mappedValue = "Divasvapna";
              } else {
                mappedValue = "Samyak-Vihara";
              }
            }

            setPendingVoiceField(fieldId as keyof AyushAssessment);
            setPendingVoiceValue(mappedValue);
            setVoiceConfirmationPending(true);
          },
          onError: () => {
            setIsListening(false);
            setActiveVoiceField(null);
          },
          onEnd: () => {
            setIsListening(false);
          }
        },
        language === "en" ? "en-IN" : "hi-IN",
        "Pitta Prakriti hai, teekha khane se acidity hoti hai"
      );
    });
  };

  const confirmVoiceInput = () => {
    if (pendingVoiceField && pendingVoiceValue) {
      setAyushAssessmentField(pendingVoiceField, pendingVoiceValue);
      if (pendingVoiceField === "prakriti") {
        setAyushData(pendingVoiceValue);
      }
    }
    setVoiceConfirmationPending(false);
    setVoiceTranscript("");
    setActiveVoiceField(null);
  };

  const cancelVoiceInput = () => {
    setVoiceConfirmationPending(false);
    setVoiceTranscript("");
    setActiveVoiceField(null);
  };

  const playSpeech = (text: string) => {
    VoiceService.speak(text, language === "en" ? "en-IN" : "hi-IN");
  };

  return (
    <div className="w-full space-y-6">
      {/* Dedicated Ayurveda Banner */}
      <div className="bg-teal-light/60 border-2 border-teal/40 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal text-white flex items-center justify-center shrink-0 shadow-sm">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-text text-base sm:text-lg">
                  आयुर्वेद परामर्श प्रणाली (AYUSH Case-Taking Mode)
                </h3>
                <span className="text-[10px] font-black bg-teal text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  AIIA Standard
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                दशविध परीक्षा (Dashavidha Pariksha) · 12 Core SIH Clinical Assessment Dimensions
              </p>
            </div>
          </div>

          <button
            onClick={() => playSpeech("Namaste. Dashavidha Pariksha mein aapka swagat hai. Kripya apne sharir aur aahar-vihar ke baare mein batayein.")}
            className="flex items-center gap-1.5 text-xs font-bold bg-white text-teal border border-teal/30 px-3.5 py-2 rounded-xl shadow-xs hover:bg-teal-light self-start sm:self-auto"
          >
            <Volume2 className="w-4 h-4" />
            <span>सुनें (Audio Guide)</span>
          </button>
        </div>

        {/* Mandatory Clinical Safety / Non-Diagnostic Protocol Notice */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Vaidya Evaluation Protocol:</strong> This platform gathers structured observational history for qualified Ayurvedic Vaidya / Clinician review. Artificial Intelligence does not diagnose Dosha imbalances or prescribe Chikitsa autonomously.
          </p>
        </div>
      </div>

      {/* Stepper Tabs (4 Major Clinical Domains) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SECTIONS.map((sec, idx) => {
          const isActive = idx === currentSectionIndex;
          const isDone = idx < currentSectionIndex;

          return (
            <button
              key={sec.id}
              onClick={() => setCurrentSectionIndex(idx)}
              className={cn(
                "p-3 rounded-2xl border text-left transition-all animate-press flex items-center gap-2.5",
                isActive
                  ? "bg-teal text-white border-teal shadow-sm font-bold"
                  : isDone
                  ? "bg-teal-light/50 border-teal/30 text-teal font-semibold"
                  : "bg-surface-card border-border text-text-muted hover:border-teal/30"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                isActive ? "bg-white text-teal" : isDone ? "bg-teal text-white" : "bg-gray-200 text-text-muted"
              )}>
                {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <div className="min-w-0">
                <span className="text-xs truncate block">{sec.titleHi.split('(')[0]}</span>
                <span className="text-[10px] opacity-80 truncate block">{sec.titleEn}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Voice Transcript Confirmation Banner */}
      {voiceConfirmationPending && (
        <div className="bg-teal-light border-2 border-teal rounded-2xl p-4 shadow-md space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-teal animate-pulse" />
            <span className="text-xs font-bold text-teal uppercase tracking-wider">
              Spoken Response Recognized (वाणी पहचान)
            </span>
          </div>
          <p className="text-sm font-semibold text-text bg-white p-3 rounded-xl border border-teal/30">
            &ldquo;{voiceTranscript}&rdquo;
          </p>
          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            <span className="text-text-muted">
              Auto-mapped to: <strong className="text-primary">{pendingVoiceValue}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={cancelVoiceInput}
                className="px-3 py-1.5 bg-surface text-text-muted hover:text-text border border-border rounded-lg font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Dobara bolein (Retry)
              </button>
              <button
                onClick={confirmVoiceInput}
                className="px-4 py-1.5 bg-teal text-white rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" /> Haan, aage badhein (Confirm)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions in Active Section */}
      <div className="space-y-6">
        {currentQuestions.map((q) => {
          const currentValue = currentPatient.ayushAssessment?.[q.id as keyof AyushAssessment] || "";

          return (
            <div 
              key={q.id}
              className="bg-surface-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal bg-teal-light px-2.5 py-0.5 rounded-full">
                      {q.sanskrit}
                    </span>
                    <span className="text-xs text-text-muted">· SIH Assessment Field</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-text mt-1">{q.titleHi}</h4>
                  <p className="text-xs text-text-muted">{q.titleEn}</p>
                </div>

                {/* Voice Input Button on Each Question */}
                <button
                  onClick={() => handleStartVoice(q.id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs self-start sm:self-auto",
                    isListening && activeVoiceField === q.id
                      ? "bg-alert text-white animate-pulse"
                      : "bg-surface hover:bg-teal-light text-teal border border-teal/30"
                  )}
                >
                  <Mic className="w-4 h-4" />
                  <span>
                    {isListening && activeVoiceField === q.id
                      ? "Sun rahe hain..."
                      : "🎙️ Bolkar Batayein (Voice)"}
                  </span>
                </button>
              </div>

              {/* Touch Option Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {q.options.map((opt) => {
                  const isSelected = currentValue.includes(opt.id);

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={cn(
                        "p-4 rounded-2xl border-2 text-left transition-all animate-press flex flex-col justify-between relative",
                        isSelected
                          ? "border-teal bg-teal-light/40 shadow-sm ring-2 ring-teal/20"
                          : "border-border bg-surface hover:border-teal/30"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-teal">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-text text-sm">{opt.labelHi}</div>
                        <div className="text-xs text-primary font-medium mt-0.5">{opt.labelEn}</div>
                        <p className="text-[11px] text-text-muted mt-2 leading-relaxed">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Adaptive AI Follow-up Question (Contextual inquiry) */}
        {showAdaptiveQuestion && currentSectionIndex === 0 && (
          <div className="bg-teal-light/40 border-2 border-teal/40 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal">
                Adaptive Follow-up Inquiry (अनुकूली नैदानिक प्रश्न)
              </span>
            </div>
            <h4 className="font-bold text-text text-sm sm:text-base">
              क्या भोजन करने के उपरांत पेट में भारीपन या खट्टी डकारें/जलन महसूस होती है?
            </h4>
            <p className="text-xs text-text-muted">
              Do you experience epigastric burning or heaviness after meals?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[
                { id: "post_prandial_burning", labelHi: "हाँ, भोजन के तुरंत बाद (Post-prandial)", labelEn: "Immediately after meals" },
                { id: "empty_stomach_burning", labelHi: "खाली पेट अधिक जलन (Empty stomach)", labelEn: "On empty stomach" },
                { id: "none_normal", labelHi: "नहीं, सामान्य है (No discomfort)", labelEn: "None / Normal digestion" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setAdaptiveAnswer(item.id);
                    setAyushAssessmentField("aharaShakti", item.labelHi);
                  }}
                  className={cn(
                    "p-3 rounded-xl border text-left text-xs transition-all animate-press",
                    adaptiveAnswer === item.id
                      ? "border-teal bg-teal text-white font-bold shadow-sm"
                      : "border-border bg-surface text-text hover:border-teal/30"
                  )}
                >
                  <span className="block font-bold">{item.labelHi}</span>
                  <span className="text-[10px] opacity-80 block">{item.labelEn}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stepper Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
          disabled={currentSectionIndex === 0}
          className="px-5 py-3 rounded-2xl bg-surface border border-border text-text font-bold text-xs flex items-center gap-2 disabled:opacity-40 animate-press"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>पिछला चरण (Previous Section)</span>
        </button>

        {currentSectionIndex < SECTIONS.length - 1 ? (
          <button
            onClick={() => setCurrentSectionIndex(currentSectionIndex + 1)}
            className="px-6 py-3 rounded-2xl bg-teal text-white font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-teal-bright animate-press"
          >
            <span>अगला चरण (Next Section)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-xs flex items-center gap-2 shadow-md hover:bg-primary-dark animate-press"
          >
            <span>दशविध परीक्षा पूर्ण (Finish & Continue)</span>
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
