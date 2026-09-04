"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface AnatomicalRegionData {
  id: string;
  nameHi: string;
  nameEn: string;
  view: "front" | "back" | "both";
  subregions?: Array<{ id: string; nameHi: string; nameEn: string }>;
  supportsLaterality?: boolean;
}

export const ANATOMICAL_MAP_REGIONS: AnatomicalRegionData[] = [
  {
    id: "head",
    nameHi: "सिर",
    nameEn: "Head / Brain",
    view: "both",
    subregions: [
      { id: "forehead", nameHi: "माथा", nameEn: "Forehead / Frontal" },
      { id: "temple", nameHi: "कनपटी", nameEn: "Temple / Temporal" },
      { id: "top_head", nameHi: "सिर का ऊपरी हिस्सा", nameEn: "Top of Head / Vertex" },
      { id: "back_head", nameHi: "सिर का पिछला हिस्सा", nameEn: "Back of Head / Occiput" },
    ],
    supportsLaterality: true,
  },
  {
    id: "face",
    nameHi: "चेहरा",
    nameEn: "Face & Eyes",
    view: "front",
    subregions: [
      { id: "eyes", nameHi: "आँखें", nameEn: "Eyes / Orbit" },
      { id: "nose", nameHi: "नाक / साइनस", nameEn: "Nose / Sinus" },
      { id: "jaw", nameHi: "जबड़ा", nameEn: "Jaw / TMJ" },
      { id: "cheeks", nameHi: "गाल", nameEn: "Cheeks" },
    ],
    supportsLaterality: true,
  },
  {
    id: "neck",
    nameHi: "गला / गर्दन",
    nameEn: "Neck / Throat",
    view: "both",
    subregions: [
      { id: "front_throat", nameHi: "आगे का गला", nameEn: "Front Throat / Swallowing" },
      { id: "back_cervical", nameHi: "गर्दन की हड्डी", nameEn: "Back Neck / Cervical Spine" },
      { id: "thyroid", nameHi: "थायरॉइड क्षेत्र", nameEn: "Thyroid Region" },
    ],
    supportsLaterality: true,
  },
  {
    id: "chest",
    nameHi: "छाती",
    nameEn: "Chest & Ribs",
    view: "front",
    subregions: [
      { id: "center_retrosternal", nameHi: "छाती के बीच में", nameEn: "Center / Behind Breastbone" },
      { id: "left_chest", nameHi: "बाईं तरफ (हृदय)", nameEn: "Left Chest (Precordial)" },
      { id: "right_chest", nameHi: "दाहिनी तरफ", nameEn: "Right Chest (Lung / Pleural)" },
      { id: "ribcage", nameHi: "पसली", nameEn: "Ribcage / Musculoskeletal" },
    ],
    supportsLaterality: true,
  },
  {
    id: "upper_abdomen",
    nameHi: "ऊपरी पेट",
    nameEn: "Upper Abdomen",
    view: "front",
    subregions: [
      { id: "epigastrium", nameHi: "पेट के बीचों-बीच (एसिडिटी)", nameEn: "Center (Epigastrium / Acidity)" },
      { id: "right_upper_quadrant", nameHi: "दाहिना ऊपरी पेट (लिवर/गॉलब्लेडर)", nameEn: "Right Upper (Liver / Gallbladder)" },
      { id: "left_upper_quadrant", nameHi: "बायाँ ऊपरी पेट (तिल्ली/पेट)", nameEn: "Left Upper (Spleen / Stomach)" },
    ],
    supportsLaterality: true,
  },
  {
    id: "lower_abdomen",
    nameHi: "निचला पेट",
    nameEn: "Lower Abdomen",
    view: "front",
    subregions: [
      { id: "right_iliac", nameHi: "दाहिना निचला पेट (अपेंडिक्स)", nameEn: "Right Lower (Appendix)" },
      { id: "left_iliac", nameHi: "बायाँ निचला पेट", nameEn: "Left Lower (Colon / Diverticular)" },
      { id: "suprapubic", nameHi: "नाभि के नीचे (मूत्राशय)", nameEn: "Lower Center (Bladder / Pelvic)" },
      { id: "umbilical", nameHi: "नाभि के पास", nameEn: "Navel / Umbilicus" },
    ],
    supportsLaterality: true,
  },
  {
    id: "back",
    nameHi: "पीठ एवं रीढ़",
    nameEn: "Back & Spine",
    view: "back",
    subregions: [
      { id: "upper_back", nameHi: "ऊपरी पीठ", nameEn: "Upper Back / Thoracic Spine" },
      { id: "lumbar", nameHi: "कमर / निचली पीठ", nameEn: "Lower Back / Lumbar" },
      { id: "flank", nameHi: "कमर की साइड (गुर्दा/किडनी)", nameEn: "Flanks / Kidneys" },
    ],
    supportsLaterality: true,
  },
  {
    id: "shoulder",
    nameHi: "कंधा",
    nameEn: "Shoulder",
    view: "both",
    subregions: [
      { id: "shoulder_joint", nameHi: "कंधे का जोड़", nameEn: "Shoulder Joint / Rotator Cuff" },
      { id: "trapezius", nameHi: "कंधे की मांसपेशी", nameEn: "Shoulder Blade / Muscle" },
    ],
    supportsLaterality: true,
  },
  {
    id: "arm",
    nameHi: "बाँह एवं कोहनी",
    nameEn: "Arm & Elbow",
    view: "both",
    subregions: [
      { id: "biceps", nameHi: "ऊपरी बाँह", nameEn: "Upper Arm / Biceps" },
      { id: "elbow", nameHi: "कोहनी", nameEn: "Elbow Joint" },
      { id: "forearm", nameHi: "कलाई के पास (फोरआर्म)", nameEn: "Forearm" },
    ],
    supportsLaterality: true,
  },
  {
    id: "hand",
    nameHi: "हाथ एवं उंगलियाँ",
    nameEn: "Hand & Fingers",
    view: "both",
    subregions: [
      { id: "wrist", nameHi: "कलाई", nameEn: "Wrist Joint" },
      { id: "palm", nameHi: "हथेली", nameEn: "Palm" },
      { id: "fingers", nameHi: "उंगलियाँ", nameEn: "Fingers / Joints" },
    ],
    supportsLaterality: true,
  },
  {
    id: "hip",
    nameHi: "कूल्हा एवं पेल्विस",
    nameEn: "Hip & Pelvis",
    view: "both",
    subregions: [
      { id: "hip_joint", nameHi: "कूल्हे का जोड़", nameEn: "Hip Joint" },
      { id: "groin", nameHi: "जांघ का जोड़ (Groin)", nameEn: "Groin / Inguinal" },
    ],
    supportsLaterality: true,
  },
  {
    id: "knee",
    nameHi: "घुटना",
    nameEn: "Knee Joint",
    view: "both",
    subregions: [
      { id: "patella", nameHi: "घुटने का ढक्कन (Patella)", nameEn: "Kneecap / Front Knee" },
      { id: "back_knee", nameHi: "घुटने के पीछे", nameEn: "Back of Knee (Popliteal)" },
      { id: "joint_space", nameHi: "घुटने का जोड़", nameEn: "Joint Space / Meniscus" },
    ],
    supportsLaterality: true,
  },
  {
    id: "leg",
    nameHi: "जांघ एवं पैर",
    nameEn: "Thigh & Calf",
    view: "both",
    subregions: [
      { id: "thigh", nameHi: "जांघ (Thigh)", nameEn: "Thigh / Quadriceps" },
      { id: "calf", nameHi: "पिंडली (Calf)", nameEn: "Calf Muscle" },
      { id: "shin", nameHi: "पैर की हड्डी (Shin)", nameEn: "Shin Bone" },
    ],
    supportsLaterality: true,
  },
  {
    id: "foot",
    nameHi: "तलवा एवं टखना",
    nameEn: "Foot & Ankle",
    view: "both",
    subregions: [
      { id: "ankle", nameHi: "टखना (Ankle)", nameEn: "Ankle Joint" },
      { id: "sole", nameHi: "पैर का तलवा", nameEn: "Sole / Heel" },
      { id: "toes", nameHi: "पैर की उंगलियाँ", nameEn: "Toes" },
    ],
    supportsLaterality: true,
  },
];

export const SYSTEMIC_COMPLAINTS = [
  { id: "fever", nameHi: "बुखार / ताप", nameEn: "Fever & Chills" },
  { id: "weakness", nameHi: "कमजोरी / थकान", nameEn: "Weakness & Fatigue" },
  { id: "breathless", nameHi: "सांस फूलना", nameEn: "Breathing Difficulty" },
  { id: "bodyache", nameHi: "पूरे शरीर में दर्द", nameEn: "General Body Pain" },
  { id: "other", nameHi: "अन्य समस्या", nameEn: "Other Symptoms" },
];

interface InteractiveBodyMapProps {
  selectedRegionId: string | null;
  selectedSubregionId?: string | null;
  selectedLaterality?: "left" | "right" | "both" | "middle" | "none" | null;
  language: string;
  onSelectRegion: (regionId: string, regionNameHi: string, regionNameEn: string) => void;
  onSelectSubregion?: (subregionId: string, subregionNameHi: string, subregionNameEn: string) => void;
  onSelectLaterality?: (laterality: "left" | "right" | "both" | "middle" | "none") => void;
}

export default function InteractiveBodyMap({
  selectedRegionId,
  selectedSubregionId,
  selectedLaterality,
  language,
  onSelectRegion,
  onSelectSubregion,
  onSelectLaterality,
}: InteractiveBodyMapProps) {
  const [viewMode, setViewMode] = useState<"front" | "back">("front");

  const isHindi = language === "hi";

  const selectedRegionData = ANATOMICAL_MAP_REGIONS.find((r) => r.id === selectedRegionId);

  const filterRegion = (r: AnatomicalRegionData) => {
    if (r.view === "both") return true;
    return r.view === viewMode;
  };

  return (
    <div className="w-full flex flex-col items-center bg-surface-card border border-border rounded-3xl p-5 sm:p-7 shadow-xs">
      {/* Front / Back Toggle Controls */}
      <div className="flex items-center justify-between w-full mb-6 pb-4 border-b border-border">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-text">
            {isHindi ? "शरीर का हिस्सा चुनें" : "Select Anatomical Region"}
          </h2>
          <p className="text-xs text-text-muted">
            {isHindi ? "सामने या पीछे के हिस्से पर टैप करें" : "Tap on body region or switch view"}
          </p>
        </div>

        <div className="flex items-center bg-surface border border-border p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode("front")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              viewMode === "front" ? "bg-teal text-white shadow-xs" : "text-text-muted hover:text-text"
            )}
          >
            {isHindi ? "सामने का भाग (Front)" : "FRONT"}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("back")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              viewMode === "back" ? "bg-teal text-white shadow-xs" : "text-text-muted hover:text-text"
            )}
          >
            {isHindi ? "पीछे का भाग (Back)" : "BACK"}
          </button>
        </div>
      </div>

      {/* Main Grid: Visual Body Silhouette & Region Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {/* Left Column: Anatomical SVG Silhouette Container */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-surface border border-border rounded-2xl p-6 min-h-[420px] relative">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal bg-teal-light px-3 py-1 rounded-full mb-4 border border-teal/20">
            {viewMode === "front" ? (isHindi ? "सामने का दृश्य (Front View)" : "Anatomical Front View") : (isHindi ? "पीछे का दृश्य (Back View)" : "Anatomical Back View")}
          </span>

          {/* SVG Human Silhouette Graphic */}
          <div className="relative w-48 h-80 flex items-center justify-center">
            <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-xs" aria-label="Human body map illustration">
              {/* Silhouette Outline */}
              <path
                d="M 100 20 C 115 20 125 35 125 50 C 125 65 115 75 100 75 C 85 75 75 65 75 50 C 75 35 85 20 100 20 Z 
                   M 75 75 L 60 85 L 40 160 L 52 165 L 68 105 L 70 180 L 65 280 L 60 360 L 85 360 L 92 240 L 100 240 L 108 240 L 115 360 L 140 360 L 135 280 L 130 180 L 132 105 L 148 165 L 160 160 L 140 85 L 125 75 Z"
                fill="#e2e8f0"
                stroke="#94a3b8"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* Head Region Box */}
              <circle
                cx="100"
                cy="48"
                r="28"
                className={cn(
                  "cursor-pointer transition-all stroke-2",
                  selectedRegionId === "head" || selectedRegionId === "face"
                    ? "fill-teal/40 stroke-teal animate-pulse"
                    : "fill-transparent stroke-slate-400 hover:fill-teal/20"
                )}
                onClick={() => onSelectRegion("head", "सिर", "Head / Brain")}
              />

              {/* Neck Region Box */}
              <rect
                x="84"
                y="74"
                width="32"
                height="18"
                rx="4"
                className={cn(
                  "cursor-pointer transition-all stroke-2",
                  selectedRegionId === "neck"
                    ? "fill-teal/40 stroke-teal animate-pulse"
                    : "fill-transparent stroke-slate-400 hover:fill-teal/20"
                )}
                onClick={() => onSelectRegion("neck", "गला / गर्दन", "Neck / Throat")}
              />

              {/* Chest / Upper Back Box */}
              <rect
                x="68"
                y="94"
                width="64"
                height="48"
                rx="6"
                className={cn(
                  "cursor-pointer transition-all stroke-2",
                  selectedRegionId === "chest" || (viewMode === "back" && selectedRegionId === "back")
                    ? "fill-teal/40 stroke-teal animate-pulse"
                    : "fill-transparent stroke-slate-400 hover:fill-teal/20"
                )}
                onClick={() => {
                  if (viewMode === "back") {
                    onSelectRegion("back", "पीठ एवं रीढ़", "Back & Spine");
                  } else {
                    onSelectRegion("chest", "छाती", "Chest & Ribs");
                  }
                }}
              />

              {/* Abdomen / Lumbar Spine Box */}
              <rect
                x="70"
                y="144"
                width="60"
                height="50"
                rx="6"
                className={cn(
                  "cursor-pointer transition-all stroke-2",
                  selectedRegionId === "upper_abdomen" || selectedRegionId === "lower_abdomen" || (viewMode === "back" && selectedRegionId === "back")
                    ? "fill-teal/40 stroke-teal animate-pulse"
                    : "fill-transparent stroke-slate-400 hover:fill-teal/20"
                )}
                onClick={() => {
                  if (viewMode === "back") {
                    onSelectRegion("back", "पीठ एवं रीढ़", "Back & Spine");
                  } else {
                    onSelectRegion("upper_abdomen", "ऊपरी पेट", "Upper Abdomen");
                  }
                }}
              />

              {/* Hip / Pelvis Box */}
              <rect
                x="68"
                y="196"
                width="64"
                height="34"
                rx="6"
                className={cn(
                  "cursor-pointer transition-all stroke-2",
                  selectedRegionId === "hip"
                    ? "fill-teal/40 stroke-teal animate-pulse"
                    : "fill-transparent stroke-slate-400 hover:fill-teal/20"
                )}
                onClick={() => onSelectRegion("hip", "कूल्हा एवं पेल्विस", "Hip & Pelvis")}
              />

              {/* Knee Joint Boxes */}
              <circle
                cx="80"
                cy="295"
                r="14"
                className={cn(
                  "cursor-pointer transition-all stroke-2",
                  selectedRegionId === "knee"
                    ? "fill-teal/40 stroke-teal animate-pulse"
                    : "fill-transparent stroke-slate-400 hover:fill-teal/20"
                )}
                onClick={() => onSelectRegion("knee", "घुटना", "Knee Joint")}
              />
              <circle
                cx="120"
                cy="295"
                r="14"
                className={cn(
                  "cursor-pointer transition-all stroke-2",
                  selectedRegionId === "knee"
                    ? "fill-teal/40 stroke-teal animate-pulse"
                    : "fill-transparent stroke-slate-400 hover:fill-teal/20"
                )}
                onClick={() => onSelectRegion("knee", "घुटना", "Knee Joint")}
              />
            </svg>
          </div>

          <p className="text-[11px] text-text-muted mt-3 text-center">
            {isHindi ? "नक्शे के किसी भी हिस्से पर सीधे टैप करें" : "Tap directly on any highlighted body region"}
          </p>
        </div>

        {/* Right Column: Clear Bilingual Textual Anatomical Cards */}
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">
            {isHindi ? "प्रमुख शरीर क्षेत्र (Select Body Region)" : "Anatomical Body Regions"}
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ANATOMICAL_MAP_REGIONS.filter(filterRegion).map((region) => {
              const isSelected = selectedRegionId === region.id;
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => onSelectRegion(region.id, region.nameHi, region.nameEn)}
                  aria-label={`${region.nameHi} / ${region.nameEn}`}
                  aria-pressed={isSelected}
                  className={cn(
                    "p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between min-h-[82px] relative",
                    isSelected
                      ? "border-teal bg-teal-light/50 ring-2 ring-teal/30 shadow-xs"
                      : "border-border bg-surface hover:border-teal/40"
                  )}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-teal text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-text leading-tight">{region.nameHi}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{region.nameEn}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Systemic / Non-Anatomical Options */}
          <div className="pt-3 border-t border-border">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">
              {isHindi ? "अन्य शारीरिक लक्षण (Systemic Symptoms)" : "Systemic & General Symptoms"}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SYSTEMIC_COMPLAINTS.map((sys) => {
                const isSelected = selectedRegionId === sys.id;
                return (
                  <button
                    key={sys.id}
                    type="button"
                    onClick={() => onSelectRegion(sys.id, sys.nameHi, sys.nameEn)}
                    aria-label={`${sys.nameHi} / ${sys.nameEn}`}
                    aria-pressed={isSelected}
                    className={cn(
                      "p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between",
                      isSelected
                        ? "border-teal bg-teal-light text-teal font-bold border-2"
                        : "border-border bg-surface text-text hover:bg-surface-card"
                    )}
                  >
                    <span>{sys.nameHi}</span>
                    {isSelected && <span className="text-teal font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Subregion & Laterality Detail Modal/Panel */}
      {selectedRegionData && (selectedRegionData.subregions || selectedRegionData.supportsLaterality) && (
        <div className="w-full mt-6 pt-5 border-t border-border bg-surface p-5 rounded-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm sm:text-base text-primary">
              {isHindi ? `चुना गया हिस्सा: ${selectedRegionData.nameHi}` : `Selected Region: ${selectedRegionData.nameEn}`}
            </h4>
            <span className="text-xs text-text-muted">
              {isHindi ? "सटीक स्थान और पक्ष चुनें" : "Specify exact location and side"}
            </span>
          </div>

          {/* 1. Subregions Selection */}
          {selectedRegionData.subregions && (
            <div>
              <span className="text-xs font-bold text-text-muted block mb-2">
                {isHindi ? "सटीक स्थान (Where exactly?)" : "Where exactly in this region?"}
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedRegionData.subregions.map((sub) => {
                  const isSubSelected = selectedSubregionId === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => onSelectSubregion && onSelectSubregion(sub.id, sub.nameHi, sub.nameEn)}
                      aria-pressed={isSubSelected}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                        isSubSelected
                          ? "bg-teal text-white border-teal shadow-xs"
                          : "bg-surface-card text-text border-border hover:border-teal/30"
                      )}
                    >
                      {isHindi ? sub.nameHi : sub.nameEn}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Laterality Selection */}
          {selectedRegionData.supportsLaterality && (
            <div>
              <span className="text-xs font-bold text-text-muted block mb-2">
                {isHindi ? "किस तरफ दर्द है? (Pain Side / Laterality)" : "Which side is affected?"}
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "left", labelHi: "बायाँ (Left)", labelEn: "Left Side" },
                  { id: "right", labelHi: "दायाँ (Right)", labelEn: "Right Side" },
                  { id: "both", labelHi: "दोनों तरफ (Both)", labelEn: "Both Sides" },
                  { id: "middle", labelHi: "बीच में (Middle)", labelEn: "Middle / Center" },
                  { id: "none", labelHi: "स्पष्ट नहीं (Not Sure)", labelEn: "Not Sure" },
                ].map((lat) => {
                  const isLatSelected = selectedLaterality === lat.id;
                  return (
                    <button
                      key={lat.id}
                      type="button"
                      onClick={() => onSelectLaterality && onSelectLaterality(lat.id as "left" | "right" | "both" | "middle" | "none")}
                      aria-pressed={isLatSelected}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                        isLatSelected
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-surface-card text-text border-border hover:border-primary/30"
                      )}
                    >
                      {isHindi ? lat.labelHi : lat.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
