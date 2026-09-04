"use client";

import React, { useState } from "react";
import { useKioskStore } from "@/store/kioskStore";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  RotateCcw, 
  Play, 
  ShieldAlert, 
  Leaf, 
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SIHDemoControlBar() {
  const router = useRouter();
  const { loadDemoScenario, resetDemoEnvironment, setView } = useKioskStore();
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerScenario = (num: 1 | 2 | 3) => {
    setActiveScenario(num);
    loadDemoScenario(num);

    if (num === 1) {
      setToastMessage("Demo 1 Loaded: Normal Patient (Hindi Abdominal Pain, Prescription OCR)");
      router.push("/language");
    } else if (num === 2) {
      setToastMessage("Demo 2 Loaded: Emergency Priority (Chest Pain & Breathlessness Red-Flag)");
      setView("physician");
    } else if (num === 3) {
      setToastMessage("Demo 3 Loaded: AYUSH Mode (Ayurveda Dashavidha Pariksha & Vaidya Console)");
      router.push("/consultation-type");
    }

    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleReset = () => {
    setActiveScenario(null);
    resetDemoEnvironment();
    setToastMessage("Demo Environment Reset: All state restored to clean initial sandbox.");
    router.push("/language");
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="bg-slate-900 text-white text-xs px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0 sticky top-0 z-[60]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white border border-teal/40 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-teal shrink-0" />
          <span className="font-semibold text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Left: SIH Demo Mode & Fictional Data Badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 font-bold text-teal">
          <Sparkles className="w-4 h-4 text-teal animate-pulse" />
          <span>SIH 2026 Live Presentation Launcher</span>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2.5 py-0.5 rounded-full border border-slate-700">
          Demo Environment · Fictional Data
        </span>
      </div>

      {/* Center/Right: 3 Presets + Reset Button */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Scenario 1 */}
        <button
          onClick={() => triggerScenario(1)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all border",
            activeScenario === 1
              ? "bg-teal text-white border-teal shadow-xs"
              : "bg-slate-800 text-slate-200 hover:text-white border-slate-700 hover:border-slate-600"
          )}
          title="Demo 1: Normal Patient (Hindi Voice, Abdominal Pain, Prescription OCR)"
        >
          <Play className="w-3 h-3 text-teal" />
          <span>Demo 1: Normal Intake</span>
        </button>

        {/* Scenario 2 */}
        <button
          onClick={() => triggerScenario(2)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all border",
            activeScenario === 2
              ? "bg-rose-700 text-white border-rose-600 shadow-xs"
              : "bg-slate-800 text-slate-200 hover:text-white border-slate-700 hover:border-slate-600"
          )}
          title="Demo 2: Emergency Priority (Chest Pain & Breathlessness Red-Flag Alert)"
        >
          <ShieldAlert className="w-3 h-3 text-rose-400" />
          <span>Demo 2: Emergency Red-Flag</span>
        </button>

        {/* Scenario 3 */}
        <button
          onClick={() => triggerScenario(3)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all border",
            activeScenario === 3
              ? "bg-emerald-700 text-white border-emerald-600 shadow-xs"
              : "bg-slate-800 text-slate-200 hover:text-white border-slate-700 hover:border-slate-600"
          )}
          title="Demo 3: AYUSH Mode (Ayurveda Dashavidha Pariksha & Vaidya Review)"
        >
          <Leaf className="w-3 h-3 text-emerald-400" />
          <span>Demo 3: AYUSH Mode</span>
        </button>

        {/* Reset Environment */}
        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all ml-1"
          title="Reset all demo queues and session data to initial sandbox state"
        >
          <RotateCcw className="w-3 h-3 text-amber-400" />
          <span>Reset Demo</span>
        </button>
      </div>
    </div>
  );
}
