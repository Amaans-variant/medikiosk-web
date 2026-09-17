"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useKioskStore } from "@/store/kioskStore";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Siren, Activity, User, Stethoscope, BarChart3, ShieldAlert, X, PhoneCall, Sun, Moon, LogOut, ChevronDown, RotateCcw, ExternalLink } from "lucide-react";
import CompactLanguageHeaderControl from "./CompactLanguageHeaderControl";
import { cn } from "@/lib/utils";

export default function TopBar() {
  const { queue, activeEmergencyAlert, triggerEmergencyAlert, clearEmergencyAlert } = useKioskStore();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { t } = useTranslation();
  const router = useRouter();
  const [showSosModal, setShowSosModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const waitingCount = queue.filter(p => p.status === 'waiting').length;

  const handleNotifyStaffAndDoctor = () => {
    setIsNotifying(true);
    setTimeout(() => {
      triggerEmergencyAlert({
        location: "Kiosk Station #1 (Ground Floor OPD)",
        reason: "Patient or attendant triggered Emergency Staff Assistance at Kiosk Desk"
      });
      setIsNotifying(false);
    }, 250);
  };

  const handleCancelEmergency = () => {
    clearEmergencyAlert();
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    router.push("/");
  };

  return (
    <>
      <header className="min-h-16 shrink-0 border-b border-border bg-surface-card px-3 sm:px-6 py-2 sm:py-0 flex flex-wrap items-center justify-between gap-2 sm:gap-4 sticky top-0 z-50">
        {/* Brand & Hospital Info with Role Console Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary flex items-center justify-center shadow-xs shrink-0">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-primary text-base tracking-tight">{t("appName")}</span>
              <span className="text-[11px] bg-teal-light text-teal font-semibold px-2 py-0.5 rounded-full border border-teal/20">
                AIIA · OPD Intake
              </span>

              {/* Console Badge in place of Demo Environment */}
              {user?.role === "doctor" ? (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-light border border-teal/30 text-teal text-xs font-bold shadow-xs select-none">
                  <Stethoscope className="w-3.5 h-3.5 text-teal" />
                  <span>{t("navDoctorConsole")}</span>
                  {waitingCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono bg-teal text-white">
                      {waitingCount}
                    </span>
                  )}
                </div>
              ) : user?.role === "admin" ? (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-light border border-primary/30 text-primary text-xs font-bold shadow-xs select-none">
                  <BarChart3 className="w-3.5 h-3.5 text-primary" />
                  <span>{t("navHospitalAnalytics")}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold shadow-xs select-none">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>{t("navPatientIntake")}</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-text-muted">Ministry of Ayush · Govt. of India</p>
          </div>
        </div>

        {/* System Status Indicators & Accessibility Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          {/* Compact Language Header Selector with English Fallback */}
          <CompactLanguageHeaderControl />

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border bg-surface text-text border-border hover:bg-surface-card"
            title={theme === "dark" ? t("lightMode") : t("darkMode")}
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{theme === "dark" ? t("lightMode") : t("darkMode")}</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>ABDM Gateway Live</span>
          </div>

          <button 
            onClick={() => setShowSosModal(true)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-xs",
              activeEmergencyAlert
                ? "bg-rose-600 text-white animate-pulse ring-2 ring-rose-400 font-black shadow-rose-600/50 shadow-md"
                : "bg-rose-700 text-white hover:bg-rose-800"
            )}
            title="Emergency Triage Assistance"
          >
            <Siren className={cn("w-4 h-4", activeEmergencyAlert && "animate-bounce")} />
            <span className="hidden sm:inline">
              {activeEmergencyAlert ? "Emergency SOS Active" : t("emergencyHelp")}
            </span>
          </button>

          {/* Signed-in user */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center gap-1.5 bg-surface border border-border px-2.5 py-1.5 rounded-lg text-xs font-bold text-text hover:bg-surface-card transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center text-[10px] font-black shrink-0">
                  {user.displayName.charAt(0)}
                </span>
                <span className="hidden lg:inline">{user.displayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-surface-card border border-border shadow-lg z-40 py-2 animate-fadeIn">
                    <div className="px-3.5 py-2 border-b border-border mb-1">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{t("signedInAs")}</p>
                      <p className="text-sm font-bold text-text truncate">{user.identifier}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-3.5 py-2 text-left text-xs font-bold text-alert flex items-center gap-2 hover:bg-alert-light transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {user.role === "patient" ? "Exit Intake" : t("logout")}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Emergency Assistance Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-card border-2 border-rose-400 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text">Emergency Staff Assistance</h3>
                  <p className="text-xs text-text-muted">AIIA Emergency Triage Desk</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSosModal(false)}
                className="text-text-muted hover:text-text p-1.5 rounded-xl hover:bg-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 text-xs text-rose-900 dark:text-rose-200 leading-relaxed space-y-2">
              <p className="font-semibold text-rose-950 dark:text-rose-100">
                If the patient is experiencing sudden severe chest pain, breathlessness, loss of consciousness, or acute trauma:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-rose-800 dark:text-rose-300">
                <li>Alert the nearest OPD triage nurse immediately.</li>
                <li>Proceed directly to <strong>Room 1 · Red Flag Emergency Triage</strong>.</li>
                <li>Do not wait for standard token queue call.</li>
              </ul>
            </div>

            {/* Direct Staff & Doctor Notification Responsive Button & Live Status */}
            <div className="space-y-3 pt-1">
              {!activeEmergencyAlert ? (
                <button
                  type="button"
                  onClick={handleNotifyStaffAndDoctor}
                  disabled={isNotifying}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 active:scale-[0.98] text-white rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 transition-all duration-150 group cursor-pointer disabled:opacity-75"
                >
                  <Siren className={cn("w-5 h-5 text-white shrink-0", isNotifying ? "animate-spin" : "animate-bounce group-hover:scale-110 transition-transform")} />
                  <span>{isNotifying ? "Broadcasting Emergency SOS..." : "🚨 Notify Hospital Staff & Doctor Now"}</span>
                </button>
              ) : (
                <div className="bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 rounded-2xl p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                      </span>
                      <span className="font-black text-xs text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                        {activeEmergencyAlert.status === 'acknowledged'
                          ? "Staff Dispatched & Doctor Responded"
                          : "Emergency Alert Active on Doctor's Console"}
                      </span>
                    </div>
                    <span className="text-[10px] font-black bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-md">
                      Room 1 Triage
                    </span>
                  </div>

                  <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                    {activeEmergencyAlert.status === 'acknowledged' ? (
                      <>
                        <strong className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Acknowledged by {activeEmergencyAlert.acknowledgedBy}:</strong> Emergency triage staff and nurse have been dispatched directly to Kiosk #1.
                      </>
                    ) : (
                      <>
                        Hospital triage nurse and <strong>Doctor Console have been notified with high priority</strong>. An emergency ticket was placed in Room 1 Triage queue. Please remain at the kiosk or proceed to Room 1.
                      </>
                    )}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-rose-700 dark:text-rose-300 font-semibold border-t border-rose-200 dark:border-rose-900/50 pt-2">
                    <span>Dispatched: {new Date(activeEmergencyAlert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSosModal(false);
                        router.push("/doctor");
                      }}
                      className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-900 dark:text-rose-300 dark:hover:text-rose-100 underline text-[11px] font-bold"
                    >
                      <span>View Doctor's Dashboard</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleNotifyStaffAndDoctor}
                      className="flex-1 py-2 px-3 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Re-alert Staff
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEmergency}
                      className="py-2 px-3 bg-surface hover:bg-surface-card border border-border text-text-muted hover:text-text rounded-xl text-xs font-semibold transition-colors"
                    >
                      Clear SOS
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-text">
                <PhoneCall className="w-4 h-4 text-rose-700" />
                <span>Internal Triage Ext: <strong>#108</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="bg-primary text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-colors shadow-xs"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
