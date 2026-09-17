"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck, Stethoscope, UserRound, LayoutDashboard, Lock, ArrowRight, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, UserRole } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import CompactLanguageHeaderControl from "@/components/CompactLanguageHeaderControl";

const ROLE_ROUTE: Record<UserRole, string> = {
  admin: "/admin",
  doctor: "/doctor",
  patient: "/patient",
};

const ROLE_META: Record<UserRole, { icon: React.ElementType; titleKey: "roleAdmin" | "roleDoctor" | "rolePatient"; descKey: "roleAdminDesc" | "roleDoctorDesc" | "rolePatientDesc"; idLabelKey: "loginIdLabelStaff" | "loginIdLabelDoctor" | "loginIdLabelPatient" }> = {
  admin: { icon: LayoutDashboard, titleKey: "roleAdmin", descKey: "roleAdminDesc", idLabelKey: "loginIdLabelStaff" },
  doctor: { icon: Stethoscope, titleKey: "roleDoctor", descKey: "roleDoctorDesc", idLabelKey: "loginIdLabelDoctor" },
  patient: { icon: UserRound, titleKey: "rolePatient", descKey: "rolePatientDesc", idLabelKey: "loginIdLabelPatient" },
};

/**
 * Initial entry point of the application.
 * ------------------------------------------------------------------
 * Simulated role-based sign-in. Real backend integration point:
 * `useAuthStore().login()` — see store/authStore.ts for exactly what
 * to change (nothing here needs to change once that's wired up).
 */
export default function RoleLoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();
  const { login, status, error } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [identifier, setIdentifier] = useState("");
  const [secret, setSecret] = useState("");

  const isSubmitting = status === "authenticating";
  const meta = ROLE_META[selectedRole];
  const RoleIcon = meta.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Patients get a single tap, no typing required (see contents/prd.md
    // "7 Laws of MediKiosk UI" — Law 1 & Law 5 — this screen must not force
    // a low-literacy or elderly patient to type an ID/password). A unique
    // per-session identifier is generated instead; a real backend can swap
    // this for an actual kiosk/device ID.
    const effectiveIdentifier = selectedRole === "patient" ? `walk-in-${Date.now()}` : identifier;
    const result = await login({ role: selectedRole, identifier: effectiveIdentifier, secret });
    if (result.ok) {
      router.push(ROLE_ROUTE[result.role]);
    }
  };

  return (
    <div className="min-h-screen-safe bg-surface flex flex-col">
      {/* Top-right utility controls: language + dark mode, available pre-login */}
      <div className="w-full flex items-center justify-end gap-2 px-4 sm:px-6 pt-4 sm:pt-6">
        <CompactLanguageHeaderControl />
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? t("lightMode") : t("darkMode")}
          className="flex items-center gap-1.5 bg-surface-card border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-text hover:bg-surface transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-teal" /> : <Moon className="w-4 h-4 text-teal" />}
          <span className="hidden sm:inline">{theme === "dark" ? t("lightMode") : t("darkMode")}</span>
        </button>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary flex items-center justify-center shadow-md mb-3">
              <Activity className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-primary font-bold text-2xl sm:text-3xl tracking-tight">{t("appName")}</h1>
            <p className="text-text-muted text-xs sm:text-sm mt-1">{t("appTagline")}</p>
          </div>

          {/* Auth Card */}
          <div className="bg-surface-card border border-border rounded-3xl shadow-lg p-5 sm:p-7">
            <div className="text-center mb-5">
              <h2 className="text-text font-bold text-xl sm:text-2xl">{t("loginTitle")}</h2>
              <p className="text-text-muted text-xs sm:text-sm mt-1">{t("loginSubtitle")}</p>
            </div>

            {/* Role Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {(Object.keys(ROLE_META) as UserRole[]).map((role) => {
                const RIcon = ROLE_META[role].icon;
                const isActive = role === selectedRole;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3 px-1.5 transition-all",
                      isActive
                        ? "border-primary bg-primary-light/60 text-primary shadow-xs"
                        : "border-border text-text-muted hover:border-primary/40 hover:text-text"
                    )}
                  >
                    <RIcon className="w-5 h-5" />
                    <span className="text-[11px] sm:text-xs font-bold">{t(ROLE_META[role].titleKey)}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] sm:text-xs text-text-muted text-center mb-5 min-h-[1.5em]">
              {t(meta.descKey)}
            </p>

            {/* Form — Admin/Doctor (hospital staff, can type credentials) */}
            {selectedRole !== "patient" ? (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-text mb-1.5" htmlFor="login-identifier">
                    {t(meta.idLabelKey)}
                  </label>
                  <div className="relative">
                    <RoleIcon className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={t(meta.idLabelKey)}
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl border-2 border-border bg-surface text-text text-sm font-semibold focus:outline-none focus:border-primary"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1.5" htmlFor="login-secret">
                    {t("loginPasswordLabel")}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-secret"
                      type="password"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl border-2 border-border bg-surface text-text text-sm font-semibold focus:outline-none focus:border-primary"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 pb-2">
                  <span className="text-text-muted text-[11px]">Quick Fill Demo:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedRole === "doctor") {
                        setIdentifier("Doc1");
                        setSecret("1234");
                      } else {
                        setIdentifier("Hs1");
                        setSecret("h1234");
                      }
                    }}
                    className="text-primary font-bold text-xs hover:underline flex items-center gap-1"
                  >
                    <span>Use {selectedRole === "doctor" ? "Doc1 / 1234" : "Hs1 / h1234"}</span>
                  </button>
                </div>

                {error && (
                  <p className="text-alert text-xs font-semibold bg-alert-light border border-alert/20 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white font-bold text-sm sm:text-base py-3.5 rounded-2xl shadow-md hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>{t("loginSigningIn")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("loginContinue")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Patient — one big tap, no typing. Low-literacy / elderly
                 patients must never be asked to type an ID or password here
                 (see contents/prd.md "7 Laws of MediKiosk UI"). */
              <form onSubmit={handleSubmit} className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-lg sm:text-xl py-5 rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2.5 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>{t("loginSigningIn")}</span>
                    </>
                  ) : (
                    <>
                      <UserRound className="w-6 h-6" />
                      <span>शुरू करें · Start Check-in</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-center text-[12px] text-text-muted">
                  निःशुल्क ओपीडी पर्ची पंजीकरण (Free Hospital OPD Token)
                </p>
              </form>
            )}

            {selectedRole !== "patient" && (
              <p className="text-center text-[10px] sm:text-[11px] text-text-muted font-medium mt-4">
                {t("loginDemoHint")}
              </p>
            )}
          </div>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted font-medium mt-5">
            <ShieldCheck className="w-4 h-4 text-teal" />
            <span>{t("loginSecureBadge")}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
