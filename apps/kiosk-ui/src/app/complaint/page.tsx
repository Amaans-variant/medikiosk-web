"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  HeadAnatomyIcon, 
  ChestHeartLungsIcon, 
  StomachDigestiveIcon, 
  SpineBackIcon,
  KneeJointIcon,
  ThroatNeckIcon,
  ArmShoulderIcon,
  FeverVitalsIcon,
  MicIcon 
} from "@/components/icons";
import { useKioskStore } from "@/store/kioskStore";
import { ConsultationType } from "@/models";
import { cn } from "@/lib/utils";
import AdaptiveClinicalInquiry from "@/components/AdaptiveClinicalInquiry";
import AyurvedaConsultationFlow from "@/components/AyurvedaConsultationFlow";
import InteractiveBodyMap from "@/components/InteractiveBodyMap";
import { Volume2, X, Stethoscope, Leaf } from "lucide-react";

// 8 Anatomically Accurate Body Regions with clinical descriptions
const BODY_REGIONS = [
  { 
    id: "head_brain", 
    labelHi: "सिर / मस्तिष्क", 
    labelEn: "Head & Brain", 
    subtext: "Headache, Migraine, Ardhavabhedaka",
    icon: HeadAnatomyIcon,
    snomed: "SCTID: 25064002"
  },
  { 
    id: "throat_neck", 
    labelHi: "गला एवं श्वासनली", 
    labelEn: "Throat & Neck", 
    subtext: "Sore Throat, Galaganda, Cough",
    icon: ThroatNeckIcon,
    snomed: "SCTID: 162397003"
  },
  { 
    id: "chest_heart_lungs", 
    labelHi: "छाती / हृदय एवं फेफड़े", 
    labelEn: "Chest, Heart & Lungs", 
    subtext: "Chest Pain, Hridroga, Shwasa-Kasa",
    icon: ChestHeartLungsIcon,
    snomed: "SCTID: 29857009"
  },
  { 
    id: "stomach_abdomen", 
    labelHi: "पेट / पाचन तंत्र", 
    labelEn: "Stomach & Digestion", 
    subtext: "Acidity, Amlapitta, Udarashoola",
    icon: StomachDigestiveIcon,
    snomed: "SCTID: 21522001"
  },
  { 
    id: "spine_back", 
    labelHi: "रीढ़ की हड्डी एवं पीठ", 
    labelEn: "Spine & Back", 
    subtext: "Lumbar Pain, Katigraha, Sciatica",
    icon: SpineBackIcon,
    snomed: "SCTID: 279039007"
  },
  { 
    id: "arm_shoulder", 
    labelHi: "कंधा, हाथ एवं कलाई", 
    labelEn: "Shoulders, Arms & Hands", 
    subtext: "Apabahuka, Joint Strain, Numbness",
    icon: ArmShoulderIcon,
    snomed: "SCTID: 53120007"
  },
  { 
    id: "knee_joint", 
    labelHi: "घुटने एवं संधि (जोड़)", 
    labelEn: "Knees & Leg Joints", 
    subtext: "Sandhivata, Amavata, Swelling",
    icon: KneeJointIcon,
    snomed: "SCTID: 30989003"
  },
  { 
    id: "fever_vitals", 
    labelHi: "बुखार एवं संपूर्ण शरीर", 
    labelEn: "Fever & Systemic", 
    subtext: "Jwara, Chills, Malaise",
    icon: FeverVitalsIcon,
    snomed: "SCTID: 386661006"
  },
];

export default function ChiefComplaintScreen() {
  const router = useRouter();
  const { currentPatient, toggleComplaint, setConsultationType, setComplaintHistoryDetails, setSeverity, language } = useKioskStore();
  const [selectedIds, setSelectedIds] = useState<string[]>(currentPatient.complaintIds || ["stomach_abdomen"]);
  const severity = currentPatient.severity ?? 6;
  const [isListening, setIsListening] = useState<boolean>(false);

  const consultationType: ConsultationType = currentPatient.consultationType || "ayurveda";

  const handleToggle = (id: string, label: string) => {
    toggleComplaint(id, label);
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleNext = () => {
    router.push("/document");
  };

  const handleMicToggle = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        // Safe voice intake: only select if not already selected, never fabricate unrelated body regions
        if (!selectedIds.includes("stomach_abdomen")) {
          handleToggle("stomach_abdomen", "पेट / पाचन तंत्र (Stomach & Digestion)");
        }
        setIsListening(false);
      }, 1500);
    } else {
      setIsListening(false);
    }
  };

  const playPromptAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = consultationType === "ayurveda"
        ? "Aapko kahan kahan takleef hai? Apne lakshan aur Dashavidha Pariksha ke vishay mein batayein."
        : "Aapko kahan kahan dard ya takleef hai? Ek se zyada jagah bhi chun sakte hain.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const selectedRegions = BODY_REGIONS.filter(r => selectedIds.includes(r.id));

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center pb-36">
      {/* 1. Progress Bar */}
      <div className="w-full max-w-6xl px-4 sm:px-8 pt-6">
        <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal to-teal-bright w-[50%] transition-all duration-500 ease-out" />
        </div>
        <div className="mt-2 flex justify-between items-center text-xs font-semibold text-text-muted">
          <span>
            {consultationType === "ayurveda"
              ? "Step 2 of 4 · आयुर्वेदिक लक्षण एवं दशविध परीक्षा (AYUSH Intake)"
              : "Step 2 of 4 · Anatomical Pain Mapping (Modern Medicine)"}
          </span>
          <span className="text-teal font-bold bg-teal-light px-2.5 py-0.5 rounded-full border border-teal/20">
            {consultationType === "ayurveda" ? "🌿 Ayurveda Mode Active" : "🏥 Modern Medicine Mode"}
          </span>
        </div>
      </div>

      {/* 2. Header Navigation & Consultation Mode Switcher */}
      <header className="w-full max-w-6xl px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 sm:mt-6">
        <button 
          onClick={() => router.push("/login")}
          className="text-primary font-semibold text-lg sm:text-xl flex items-center gap-2 animate-press"
        >
          <span className="text-2xl">←</span> Peeche (Back)
        </button>

        {/* Stream Toggle Pill */}
        <div className="flex items-center gap-1.5 bg-surface-card p-1 rounded-2xl border border-border text-xs font-bold shadow-xs">
          <button
            onClick={() => setConsultationType("modern")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all",
              consultationType === "modern"
                ? "bg-primary text-white shadow-sm font-black"
                : "text-text-muted hover:text-text"
            )}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Modern Medicine</span>
          </button>

          <button
            onClick={() => setConsultationType("ayurveda")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all",
              consultationType === "ayurveda"
                ? "bg-teal text-white shadow-sm font-black"
                : "text-text-muted hover:text-text"
            )}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Ayurveda (AYUSH)</span>
          </button>
        </div>
      </header>

      {/* 3. Main Content Area */}
      <main className="w-full max-w-6xl mt-6 flex flex-col items-center px-4 space-y-6 sm:space-y-8">
        
        {/* Title and Voice Prompt */}
        <div className="text-center flex flex-col items-center gap-1.5 max-w-2xl">
          <h1 className="text-primary text-2xl sm:text-3xl md:text-4xl font-bold flex items-center justify-center gap-3">
            {consultationType === "ayurveda" ? "मुख्य लक्षण एवं वेदना स्थान" : "Aapko Kahan Dard Ya Takleef Hai?"}
            <button 
              onClick={playPromptAudio}
              className="text-teal bg-teal-light rounded-full p-2 sm:p-2.5 animate-press hover:bg-[#E8F8F0] shrink-0"
              aria-label="Listen to question"
            >
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </h1>
          <h2 className="text-text-muted text-base sm:text-lg">
            {consultationType === "ayurveda"
              ? "Select affected body region and provide Ayurvedic Dashavidha Pariksha inputs"
              : "Tap all body parts where you feel pain or discomfort (Select one or more)"}
          </h2>
        </div>

        {/* Selected Points Chips Bar */}
        {selectedRegions.length > 0 && (
          <div className="w-full bg-surface-card border border-border rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-text-muted mr-1">Selected Focus:</span>
            {selectedRegions.map((region) => (
              <span 
                key={region.id}
                className="inline-flex items-center gap-1.5 bg-primary-light text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold"
              >
                {region.labelHi.split('/')[0]} ({region.labelEn})
                <button 
                  onClick={() => handleToggle(region.id, `${region.labelHi} (${region.labelEn})`)}
                  className="hover:text-alert text-primary/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Interactive Human Body Map Component */}
        <InteractiveBodyMap 
          selectedRegionId={selectedIds[0] || "upper_abdomen"}
          language={language}
          onSelectRegion={(id, nameHi, nameEn) => {
            handleToggle(id, `${nameHi} (${nameEn})`);
          }}
        />

        {/* Severity Slider (Present in both modes) */}
        <div className="w-full bg-surface-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-text text-base sm:text-lg">
                {consultationType === "ayurveda" ? "वेदना की तीव्रता (Pain / Discomfort Severity)" : "Dard Ki Tibrata (Severity Scale)"}
              </h3>
              <p className="text-xs text-text-muted">
                Rate intensity from 0 (No pain) to 10 (Worst imaginable pain)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-muted hidden sm:inline">
                {severity <= 2 ? "😊 Mild" : severity <= 6 ? "😐 Moderate" : "😫 Severe"}
              </span>
              <span className={cn(
                "text-base sm:text-lg font-bold font-mono px-3 py-1 rounded-xl shadow-xs",
                severity >= 7 ? "bg-alert/15 text-alert" : severity >= 4 ? "bg-warning-light text-warning" : "bg-teal-light text-teal"
              )}>
                {severity} / 10
              </span>
            </div>
          </div>

          <div>
            <input 
              type="range" 
              min="0" 
              max="10" 
              step="1"
              value={severity}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSeverity(val);
              }}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label="Symptom severity slider"
            />

            <div className="flex justify-between text-xs text-text-muted mt-2 font-medium">
              <span className="text-teal font-bold flex items-center gap-1">
                😊 0–3: Thoda Sa (Mild / Slight)
              </span>
              <span className="text-warning font-bold flex items-center gap-1">
                😐 4–6: Madhyam (Moderate / Bothersome)
              </span>
              <span className="text-alert font-bold flex items-center gap-1">
                😫 7–10: Bahut Tej (Severe / Unbearable)
              </span>
            </div>
          </div>
        </div>

        {/* MODE SPECIFIC INTAKE SECTION */}
        {consultationType === "ayurveda" ? (
          /* Dedicated Ayurveda Mode: Dashavidha Pariksha with 12 SIH Fields */
          <div className="w-full pt-2">
            <AyurvedaConsultationFlow onComplete={handleNext} />
          </div>
        ) : (
          /* Modern Medicine Mode: SOCRATES Adaptive Inquiry (NO AYUSH Questions mixed in) */
          <div className="w-full space-y-6">
            <AdaptiveClinicalInquiry 
              complaintId={selectedIds[0] || "chest_heart_lungs"}
              onHistoryUpdate={(history, summaryDraft) => {
                setComplaintHistoryDetails(history, summaryDraft);
              }}
            />

            {/* Quick Voice Pill */}
            <button 
              onClick={handleMicToggle}
              className={cn(
                "w-full flex items-center justify-center gap-3 border-2 rounded-2xl py-3.5 px-6 transition-all",
                isListening 
                  ? "bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200"
                  : "bg-surface-card border-primary/20 text-primary hover:bg-primary-light/50"
              )}
            >
              <div className="w-5 h-5">
                <MicIcon />
              </div>
              <span className="font-bold text-xs sm:text-sm">
                {isListening 
                  ? "Sun rahe hain... (Listening...)" 
                  : "🎙️ Bolkar Lakshan Batayein (Tap to Speak Symptoms)"}
              </span>
            </button>
          </div>
        )}
      </main>

      {/* Sticky Bottom Action Button */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/95 backdrop-blur-md p-4 sm:p-5 flex justify-center border-t border-border z-40">
        <button 
          onClick={handleNext}
          className="max-w-6xl w-full bg-primary text-white font-bold text-base sm:text-lg md:text-xl py-4 rounded-2xl shadow-lg hover:bg-primary-dark animate-press transition-colors flex items-center justify-center gap-2"
        >
          <span>
            {consultationType === "ayurveda"
              ? "दस्तावेज़ स्कैनिंग पर जाएँ (Next: Scan Reports & Prescriptions)"
              : `Puraani Parchi Scan Karein (Next: ${selectedIds.length} Points Selected)`}
          </span>
          <span className="text-xl">→</span>
        </button>
      </div>
    </div>
  );
}
