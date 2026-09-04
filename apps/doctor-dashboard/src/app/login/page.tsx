"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { Volume2, QrCode, Smartphone, ArrowRight, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export default function LoginScreen() {
  const router = useRouter();
  const { setPatientDemographics, patientCategory, setPatientCategory } = useKioskStore();
  const [mobileNumber, setMobileNumber] = useState("");
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [isQrScanning, setIsQrScanning] = useState(false);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobileNumber(numeric);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(numeric);
  };

  const handleNext = () => {
    if (!isOtpMode) {
      if (mobileNumber.length === 10) {
        setIsOtpMode(true);
      }
    } else {
      if (otp.length === 6) {
        setPatientDemographics({
          mobile: `+91 ${mobileNumber}`
        });
        router.push("/complaint");
      }
    }
  };

  const handleSimulateQrScan = () => {
    setIsQrScanning(true);
    setTimeout(() => {
      setPatientDemographics({
        name: "Priya Sharma",
        age: 42,
        gender: "F",
        abhaId: "91-4412-8871-3319"
      });
      setIsQrScanning(false);
      router.push("/complaint");
    }, 1000);
  };

  const playAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = isOtpMode 
        ? "Apne phone par aaya hua chheh ank ka O-T-P darj karein."
        : "Apna das ank ka mobile number dalein, ya ABHA card scan karein.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center pb-32">
      {/* Progress Bar */}
      <div className="w-full max-w-[1024px] px-4 sm:px-8 pt-6">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal to-teal-bright w-[25%] transition-all duration-500 ease-out" />
        </div>
        <div className="mt-2 text-text-muted text-xs sm:text-sm font-medium flex justify-between items-center">
          <span>चरण 1 / 4 · मरीज़ की पहचान (Step 1 of 4 · Identity & ABHA)</span>
          <span className="text-teal font-semibold">ABDM Verification</span>
        </div>
      </div>

      {/* Header Navigation */}
      <header className="w-full max-w-[1024px] px-4 sm:px-8 flex justify-between items-center mt-4 sm:mt-6">
        <button 
          onClick={() => isOtpMode ? setIsOtpMode(false) : router.push("/consultation-type")}
          className="text-primary font-semibold text-base sm:text-lg flex items-center gap-1.5 animate-press"
        >
          <span className="text-xl">←</span> Peeche (Back)
        </button>
        <button 
          onClick={() => router.push("/complaint")}
          className="text-text-muted hover:text-text font-semibold text-xs sm:text-sm flex items-center gap-1.5 bg-surface-card px-3.5 py-1.5 rounded-xl border border-border"
        >
          Skip (Walk-in Patient) ⏭
        </button>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[800px] mt-6 flex flex-col items-center px-4 space-y-6">
        
        {/* Patient / Guardian Caregiver Category Selection */}
        <div className="w-full max-w-[800px] flex items-center justify-between bg-surface-card p-3 rounded-2xl border border-border shadow-xs">
          <span className="text-xs font-bold text-text-muted flex items-center gap-1.5 font-mono">
            👤 Registered For:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPatientCategory('self')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                patientCategory === 'self'
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface text-text-muted hover:text-text"
              )}
            >
              Self (खुद का पंजीयन)
            </button>

            <button
              onClick={() => setPatientCategory('assisted_minor')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1",
                patientCategory === 'assisted_minor'
                  ? "bg-teal text-white shadow-xs"
                  : "bg-surface text-text-muted hover:text-text"
              )}
            >
              Guardian / Caregiver (बच्चे या परिजन हेतु)
            </button>
          </div>
        </div>

        {/* Prompts */}
        <div className="text-center flex flex-col items-center gap-1.5">
          <h1 className="text-primary text-2xl sm:text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
            {isOtpMode ? "OTP Darj Karein" : patientCategory === 'assisted_minor' ? "Guardian / Child Intake" : "Pehchan (Patient Identity)"}
            <button 
              onClick={playAudio}
              className="text-teal bg-teal-light rounded-full p-2 hover:bg-[#E8F8F0] shrink-0"
              aria-label="Listen to audio instructions"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </h1>
          <h2 className="text-text-muted text-sm sm:text-base">
            {isOtpMode ? "Enter the 6-digit verification code sent to your phone" : "Fast check-in via Ayushman Bharat Digital Mission (ABHA) or Mobile"}
          </h2>
        </div>

        {!isOtpMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {/* ABHA QR Option */}
            <div className="bg-surface-card border-2 border-border hover:border-primary/50 transition-all rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center shadow-xs relative overflow-hidden justify-between">
              <div className="absolute top-0 right-0 bg-emerald-700 text-white px-3 py-1 rounded-bl-xl font-bold text-[10px] tracking-wider uppercase">
                Fastest · Fast Track
              </div>
              <div className="w-16 h-16 bg-primary-light rounded-2xl mb-4 flex items-center justify-center text-primary border border-primary/20 mt-2">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text mb-0.5">Scan ABHA Card QR</h3>
                <p className="text-text-muted text-xs sm:text-sm mb-5">
                  Instant verification with your Ayushman Bharat Health Account
                </p>
              </div>
              
              <button 
                onClick={handleSimulateQrScan}
                disabled={isQrScanning}
                className="w-full bg-primary text-white font-bold text-sm sm:text-base py-3.5 rounded-2xl hover:bg-primary-dark transition-colors shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isQrScanning ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    <span>Scanning Card...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Scan ABHA QR Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile Number Option */}
            <div className="bg-surface-card border-2 border-primary rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center shadow-xs justify-between">
              <div className="w-16 h-16 bg-teal-light rounded-2xl mb-4 flex items-center justify-center text-teal border border-teal/20 mt-2">
                <Smartphone className="w-8 h-8" />
              </div>
              <div className="w-full">
                <h3 className="text-xl font-bold text-text mb-0.5">Mobile Number</h3>
                <p className="text-text-muted text-xs sm:text-sm mb-4">Enter 10-digit phone number for OTP</p>
                
                <div className="w-full relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold text-base">
                    +91
                  </span>
                  <input 
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="98765 43210"
                    className="w-full text-center pl-12 text-xl font-bold p-3.5 border-2 border-border rounded-2xl focus:outline-none focus:border-primary tracking-wider bg-surface"
                    value={mobileNumber}
                    onChange={handleMobileChange}
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="w-full pt-4">
                <button
                  onClick={handleNext}
                  disabled={mobileNumber.length !== 10}
                  className="w-full bg-teal text-white font-bold text-sm sm:text-base py-3.5 rounded-2xl hover:bg-teal-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send OTP (ओटीपी भेजें) →
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md bg-surface-card border-2 border-primary rounded-3xl p-7 flex flex-col items-center text-center shadow-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-light text-teal flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text">Enter 6-Digit OTP</h3>
              <p className="text-text-muted text-xs mt-0.5">Sent via SMS to +91 {mobileNumber}</p>
            </div>

            <input 
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="• • • • • •"
              className="w-full text-center tracking-[0.5em] text-2xl font-black p-3.5 border-2 border-border rounded-2xl focus:outline-none focus:border-primary bg-surface font-mono"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              autoFocus
            />

            <button 
              onClick={() => setOtp("582194")}
              className="text-primary font-bold text-xs underline hover:text-primary-dark"
            >
              Demo Auto-Fill (582194)
            </button>
          </div>
        )}

        {/* ABDM Security Trust Badge */}
        <div className="flex items-center gap-2 text-xs text-text-muted font-medium pt-2">
          <ShieldCheck className="w-4 h-4 text-teal" />
          <span>Encrypted & Compliant with National Health Authority ABDM Guidelines</span>
        </div>
      </main>

      {/* Sticky Bottom Action Button */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-sm p-4 sm:p-5 flex justify-center border-t border-border z-40">
        <button 
          onClick={handleNext}
          disabled={!isOtpMode ? mobileNumber.length !== 10 : otp.length !== 6}
          className="max-w-[800px] w-full bg-primary text-white font-bold text-base sm:text-xl py-4 rounded-2xl shadow-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>{isOtpMode ? "सत्यापित करें (Verify & Continue)" : "Aage Badhein (Continue to Complaint) →"}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

