"use client";

import React, { useState, useEffect, useRef } from "react";
import TopBar from "./TopBar";
import PhysicianConsole from "./PhysicianConsole";
import HospitalAnalytics from "./HospitalAnalytics";
import SIHDemoControlBar from "./SIHDemoControlBar";
import ChatbotWidget from "./chatbot/ChatbotWidget";
import { useKioskStore } from "@/store/kioskStore";
import { cn } from "@/lib/utils";
import { Clock, RefreshCw } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const KIOSK_IDLE_TIMEOUT_MS = 180000; // 3 Minutes Idle Timeout

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { activeView, easyView, highContrast, resetPatientSession, currentPatient } = useKioskStore();
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // The role login screen ("/") is a pre-auth gate: no hospital TopBar,
  // demo control bar, or kiosk idle-timeout modal — just the login card
  // and the chatbot. Every other route keeps the existing shell exactly
  // as before (zero change to that behavior).
  const isAuthGate = pathname === "/";

  // Reset idle timer on user interactions in kiosk mode
  useEffect(() => {
    if (isAuthGate || activeView !== "kiosk") {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const resetIdleTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      // Only set idle timer if patient has started entering data
      if (currentPatient.name || currentPatient.complaintId || currentPatient.complaintIds.length > 0) {
        timerRef.current = setTimeout(() => {
          setIsExpiredModalOpen(true);
        }, KIOSK_IDLE_TIMEOUT_MS);
      }
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetIdleTimer));
    resetIdleTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetIdleTimer));
    };
  }, [isAuthGate, activeView, currentPatient]);

  const handleStartNewPatient = () => {
    resetPatientSession();
    setIsExpiredModalOpen(false);
    router.push("/language");
  };

  if (isAuthGate) {
    // Lean shell for the pre-auth role login screen: no hospital chrome,
    // just the page content plus the persistent chatbot.
    return (
      <div
        className={cn(
          "min-h-screen flex flex-col bg-surface transition-all",
          easyView && "text-lg tracking-wide [font-size:115%]",
          highContrast && "bg-slate-950 text-yellow-300 contrast-125 font-bold"
        )}
      >
        {children}
        <ChatbotWidget />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col bg-surface transition-all",
        easyView && "text-lg tracking-wide [font-size:115%]",
        highContrast && "bg-slate-950 text-yellow-300 contrast-125 font-bold"
      )}
    >
      <SIHDemoControlBar />
      <TopBar />
      <div className="flex-1 flex flex-col">
        {activeView === 'analytics' ? (
          <HospitalAnalytics />
        ) : activeView === 'physician' ? (
          <PhysicianConsole />
        ) : (
          children
        )}
      </div>

      {/* Session Expired / Timeout Modal */}
      {isExpiredModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-card border-2 border-amber-400 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 text-center animate-scaleIn">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-text">Session Expired</h3>
              <p className="text-sm text-text-muted">
                Your kiosk session timed out due to inactivity. Patient data has been securely cleared to protect patient privacy.
              </p>
            </div>

            <button
              onClick={handleStartNewPatient}
              className="w-full py-4 bg-primary text-white font-black text-base rounded-2xl hover:bg-primary-dark transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Start New Patient
            </button>
          </div>
        </div>
      )}

      <ChatbotWidget />
    </div>
  );
}
