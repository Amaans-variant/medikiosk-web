# 🛡️ MediKiosk — Senior QA & Test Audit Report

> **Audit Date:** 2026-09-04  
> **Auditor Role:** Senior QA Lead / Test Architect  
> **Target Under Test:** `apps/kiosk-ui` (Next.js 14 App Router, Zustand, Tailwind)  
> **Standard:** GIGW 3.0, WCAG 2.1 AA/AAA, 5th-Grader-First Design Laws

---

## 1. Executive Summary

| Category | Status | Notes |
| :--- | :---: | :--- |
| **Code & Type Integrity** | 🟢 PASS | `tsc --noEmit` clean, `next lint` zero errors/warnings. Production build succeeds. |
| **State Persistence & Routing** | 🔴 CRITICAL | Using `window.location.href` forces full page reload, wiping in-memory state. |
| **Idempotency & Enqueue Logic** | 🟡 MAJOR | `useEffect` in React StrictMode triggers duplicate token generation on `/summary`. |
| **Input Validation & Sanitization** | 🟡 MAJOR | Phone & OTP inputs accept letters/symbols instead of strictly digits `0-9`. |
| **Interactive Voice/Audio Feedback** | 🟡 MINOR | Mic pill & speaker buttons lack active toggle states ("Listening..." waveform). |
| **Visual Accessibility & Targets** | 🟢 PASS | 72px targets respected; WCAG contrast AAA; high-legibility typography. |

---

## 2. Detailed Defect Analysis

### 🐛 DEFECT-01 (CRITICAL): Full Page Reloads Destroying Client State
- **Location:** `language/page.tsx`, `login/page.tsx`, `complaint/page.tsx`, `document/page.tsx`, `summary/page.tsx`
- **Issue:** Navigation is performed using native `window.location.href = '/...'` instead of Next.js `useRouter().push(...)`.
- **Impact:** Each navigation triggers a full browser reload (HTTP request cycle). Unpersisted Zustand state resets to default seed values, dropping the patient's selected language and mobile number.
- **Remediation:** Replace all `window.location.href` calls with `router.push()` from `next/navigation` for sub-100ms client transitions.

---

### 🐛 DEFECT-02 (MAJOR): Double Token Enqueue in StrictMode
- **Location:** `src/app/summary/page.tsx` (Lines 19–24)
- **Issue:** `completeIntakeAndEnqueue()` is called directly in an unguarded `useEffect`.
- **Impact:** In React 18 development or fast re-renders, the effect fires twice, creating two identical tokens (e.g. Token #43 and #44) for the same intake.
- **Remediation:** Guard token creation with a ref `hasEnqueued = useRef(false)` and persist the generated token in the store.

---

### 🐛 DEFECT-03 (MAJOR): Input Validation Bypasses
- **Location:** `src/app/login/page.tsx`
- **Issue:** 
  ```tsx
  onChange={(e) => setMobileNumber(e.target.value)} // accepts 'abcde12345'
  disabled={mobileNumber.length !== 10}
  ```
- **Impact:** Non-numeric characters allow invalid submissions; keypad on mobile devices doesn't default to numeric dialer.
- **Remediation:** Enforce regex sanitization `e.target.value.replace(/\D/g, '')` and `inputMode="numeric"`.

---

### 🐛 DEFECT-04 (MINOR): Mic & Audio Guidance Missing Active Feedback
- **Location:** `complaint/page.tsx`, `language/page.tsx`
- **Issue:** Tapping the mic pill ("Bol kar batayein") or audio speaker does not change visual state.
- **Impact:** Fails 5th-grader design rule: a child or low-literacy user needs immediate visual confirmation (e.g. mic turns green, waveform pulses, text changes to "Sun rahe hain... / Listening").
- **Remediation:** Add interactive speech simulation state with real browser SpeechSynthesis / SpeechRecognition fallback.

---

## 3. Recommended Remediation Order
1. Migrate all page routing to `useRouter` from `next/navigation`.
2. Add token generation idempotency guard on `/summary`.
3. Harden phone and OTP input masks.
4. Add speech synthesis audio cue and mic toggle state.
