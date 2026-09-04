"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { 
  CheckCircle2, 
  QrCode, 
  Printer, 
  Stethoscope, 
  Sparkles, 
  MapPin, 
  Clock,
  Leaf,
  Info
} from "lucide-react";

export default function SummaryStep() {
  const router = useRouter();
  const { currentPatient, completeIntakeAndEnqueue, setView, resetPatientSession } = useKioskStore();
  const [tokenNumber, setTokenNumber] = useState<number>(43);
  const hasEnqueued = useRef<boolean>(false);

  const isAyurveda = currentPatient.consultationType === "ayurveda";

  useEffect(() => {
    // Idempotent guard: only push to the OPD queue once per session
    if (!hasEnqueued.current) {
      hasEnqueued.current = true;
      const token = completeIntakeAndEnqueue();
      setTokenNumber(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center pb-32">
      {/* Progress Bar (100% Complete) */}
      <div className="w-full max-w-[1024px] px-8 pt-6">
        <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-teal w-full transition-all duration-500 ease-out" />
        </div>
        <div className="mt-2 text-teal text-sm font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> 100% Completed · OPD Slip Ready
          </span>
          <span className="text-xs bg-teal-light text-teal px-2.5 py-0.5 rounded-full border border-teal/30">
            {isAyurveda ? "🌿 AYUSH OPD Stream" : "🏥 Modern Medicine Stream"}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-[720px] mt-6 flex flex-col items-center px-4 space-y-6">
        <div className="text-center">
          <h1 className="text-primary text-3xl sm:text-4xl font-bold flex items-center justify-center gap-2">
            धन्यवाद! आपका टोकन तैयार है
          </h1>
          <p className="text-text-muted text-base sm:text-lg mt-1">
            Thank you! Your case intake is recorded and routed to the physician.
          </p>
        </div>

        {/* Printable Physical OPD Slip Card */}
        <div className="w-full bg-surface-card border-2 border-primary/20 rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden flex flex-col items-center text-center space-y-5">
          {/* Top Notch pattern */}
          <div className="w-16 h-1.5 bg-primary/20 rounded-full" />

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-text-muted font-mono block">
              All India Institute of Ayurveda · OPD Token
            </span>
            <span className="text-xs font-bold text-teal bg-teal-light px-3 py-0.5 rounded-full mt-1 inline-block">
              {isAyurveda ? "Kayachikitsa / Shalakya Block" : "General OPD Block"}
            </span>
          </div>

          {/* Huge Token Number */}
          <div>
            <span className="text-xs sm:text-sm font-semibold text-text-muted block">Aapka Token Number</span>
            <div className="text-6xl sm:text-7xl font-black text-primary tracking-tight font-mono my-1">
              #{tokenNumber}
            </div>
          </div>

          {/* Routing Room and Department */}
          <div className="w-full bg-primary-light border border-primary/20 rounded-2xl p-4 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Assigned Cabin</span>
                <p className="text-sm sm:text-base font-bold text-text">
                  {isAyurveda ? "Room 2 · Kayachikitsa (Internal Medicine)" : "Room 3 · General Medicine OPD"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-text-muted flex items-center gap-1 justify-end font-medium">
                <Clock className="w-3 h-3" /> Est. Wait
              </span>
              <p className="text-sm font-bold text-teal">~8 minutes</p>
            </div>
          </div>

          {/* Patient Details Snapshot */}
          <div className="w-full border-t border-b border-border py-4 text-left space-y-1.5 text-xs sm:text-sm text-text-muted">
            <div className="flex justify-between">
              <span>Patient Name:</span>
              <span className="font-bold text-text">{currentPatient.name} ({currentPatient.age}y / {currentPatient.gender})</span>
            </div>
            <div className="flex justify-between">
              <span>ABHA ID:</span>
              <span className="font-mono text-primary font-semibold">{currentPatient.abhaId}</span>
            </div>
            <div className="flex justify-between">
              <span>Primary Complaint:</span>
              <span className="font-semibold text-text">{currentPatient.complaintLabel}</span>
            </div>
            <div className="flex justify-between">
              <span>Care Stream:</span>
              <span className="font-bold text-teal">{isAyurveda ? "Ayurveda (AYUSH)" : "Modern Medicine"}</span>
            </div>
          </div>

          {/* QR Code & Barcode */}
          <div className="flex items-center justify-between w-full pt-1">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-surface rounded-xl border border-border flex items-center justify-center p-1.5 shrink-0">
                <QrCode className="w-full h-full text-primary" />
              </div>
              <div className="text-left text-xs text-text-muted">
                <p className="font-semibold text-text">Scan at Doctor&apos;s Desk</p>
                <p>Digital Token Verified</p>
              </div>
            </div>

            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 border border-border bg-surface px-4 py-2.5 rounded-xl text-xs font-bold text-text hover:bg-surface-sunk animate-press shadow-xs"
            >
              <Printer className="w-4 h-4 text-primary" /> Print Slip
            </button>
          </div>
        </div>

        {/* DEDICATED AYURVEDA-SPECIFIC SUMMARY SECTION */}
        {isAyurveda && (
          <div className="w-full bg-surface-card border-2 border-teal/40 rounded-3xl p-6 sm:p-7 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal text-white flex items-center justify-center shadow-xs shrink-0">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-text text-base sm:text-lg">
                      दशविध परीक्षा सारांश (Dashavidha Pariksha Summary)
                    </h3>
                    <span className="text-[10px] font-bold bg-teal-light text-teal px-2.5 py-0.5 rounded-full">
                      AIIA Record
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    12-Factor Ayurvedic Clinical History recorded for Qualified Vaidya Review
                  </p>
                </div>
              </div>
            </div>

            {/* 12 SIH Problem Statement Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="bg-surface p-3.5 rounded-xl border border-border">
                <span className="text-[10px] text-teal font-bold uppercase block font-mono">1. प्रकृति (Prakriti)</span>
                <p className="font-bold text-text mt-1">{currentPatient.prakriti || currentPatient.ayushAssessment?.prakriti || "Not assessed"}</p>
                <span className="text-[10px] text-text-muted">Doshic Baseline</span>
              </div>

              <div className="bg-surface p-3.5 rounded-xl border border-border">
                <span className="text-[10px] text-warning font-bold uppercase block font-mono">2. विकृति (Vikriti)</span>
                <p className="font-bold text-text mt-1">{currentPatient.ayushAssessment?.vikriti || "Not assessed"}</p>
                <span className="text-[10px] text-text-muted">Doshic Morbidity</span>
              </div>

              <div className="bg-surface p-3.5 rounded-xl border border-border">
                <span className="text-[10px] text-primary font-bold uppercase block font-mono">3. सार (Sara)</span>
                <p className="font-bold text-text mt-1">{currentPatient.ayushAssessment?.sara || "Not assessed"}</p>
                <span className="text-[10px] text-text-muted">Tissue Excellence</span>
              </div>

              <div className="bg-surface p-3.5 rounded-xl border border-border">
                <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">4. संहनन (Samhanana)</span>
                <p className="font-bold text-text mt-1">{currentPatient.ayushAssessment?.samhanana || "Not assessed"}</p>
                <span className="text-[10px] text-text-muted">Body Compactness</span>
              </div>

              <div className="bg-surface p-3.5 rounded-xl border border-border">
                <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">5. प्रमाण (Pramana)</span>
                <p className="font-bold text-text mt-1">{currentPatient.ayushAssessment?.pramana || "Not assessed"}</p>
                <span className="text-[10px] text-text-muted">Anthropometry</span>
              </div>

              <div className="bg-surface p-3.5 rounded-xl border border-border">
                <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">6. सात्म्य (Satmya)</span>
                <p className="font-bold text-text mt-1">{currentPatient.ayushAssessment?.satmya || "Not assessed"}</p>
                <span className="text-[10px] text-text-muted">Adaptability</span>
              </div>

              <div className="bg-surface p-3.5 rounded-xl border border-border">
                <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">7. सत्त्व (Sattva)</span>
                <p className="font-bold text-text mt-1">{currentPatient.ayushAssessment?.sattva || "Not assessed"}</p>
                <span className="text-[10px] text-text-muted">Mental Resilience</span>
              </div>

              <div className="bg-surface p-3.5 rounded-xl border border-border">
                <span className="text-[10px] text-warning font-bold uppercase block font-mono">8. आहार शक्ति (Ahara Shakti)</span>
                <p className="font-bold text-text mt-1">{currentPatient.ayushAssessment?.aharaShakti || "Not assessed"}</p>
                <span className="text-[10px] text-text-muted">Intake & Digestion</span>
              </div>

              <div className="bg-surface p-3.5 rounded-xl border border-border">
                <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">9. व्यायाम शक्ति (Vyayama Shakti)</span>
                <p className="font-bold text-text mt-1">{currentPatient.ayushAssessment?.vyayamaShakti || "Not assessed"}</p>
                <span className="text-[10px] text-text-muted">Physical Endurance</span>
              </div>

              <div className="bg-surface p-3.5 rounded-xl border border-border">
                <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">10. वय (Vaya)</span>
                <p className="font-bold text-text mt-1">{currentPatient.ayushAssessment?.vaya || "Not assessed"}</p>
                <span className="text-[10px] text-text-muted">Age Stage</span>
              </div>

              <div className="bg-surface p-3.5 rounded-xl border border-border">
                <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">11. आहार (Ahara)</span>
                <p className="font-bold text-text mt-1">{currentPatient.ayushAssessment?.ahara || "Not assessed"}</p>
                <span className="text-[10px] text-text-muted">Dietary Habits</span>
              </div>

              <div className="bg-surface p-3.5 rounded-xl border border-border">
                <span className="text-[10px] text-text-muted font-bold uppercase block font-mono">12. विहार (Vihara)</span>
                <p className="font-bold text-text mt-1">{currentPatient.ayushAssessment?.vihara || "Not assessed"}</p>
                <span className="text-[10px] text-text-muted">Daily Lifestyle</span>
              </div>
            </div>

            {/* Non-Diagnostic Clinical Safety Banner */}
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Vaidya Evaluation Protocol:</strong> Observational Dashavidha Pariksha findings collected for qualified Ayurvedic Vaidya sign-off. AI does not autonomously diagnose Dosha imbalances or prescribe Ayurvedic Chikitsa.
              </p>
            </div>
          </div>
        )}

        {/* Live Demo Switcher CTA */}
        <div className="w-full">
          <div className="bg-teal-light border-2 border-teal/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <div className="flex items-center gap-1.5 text-teal font-bold text-sm justify-center sm:justify-start">
                <Sparkles className="w-4 h-4" /> Live Demo Simulation
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Switch to Doctor Console to see #{tokenNumber} appear in the physician queue!
              </p>
            </div>
            <button
              onClick={() => setView('physician')}
              className="bg-teal text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md hover:bg-teal-bright flex items-center gap-2 shrink-0 animate-press"
            >
              <Stethoscope className="w-4 h-4" /> Open Doctor Console →
            </button>
          </div>
        </div>
      </main>

      {/* Start Next Patient Button */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-sm p-4 sm:p-5 flex justify-center border-t border-border z-40">
        <button
          onClick={() => {
            resetPatientSession();
            router.push("/language");
          }}
          className="max-w-[720px] w-full bg-primary text-white font-bold text-base sm:text-xl py-3.5 sm:py-4 rounded-xl shadow-lg hover:bg-primary-dark animate-press transition-colors leading-tight flex items-center justify-center gap-2"
        >
          <span>Naye Mareez Ke Liye Shuru Karein (New Patient Intake) ⟳</span>
        </button>
      </div>
    </div>
  );
}
