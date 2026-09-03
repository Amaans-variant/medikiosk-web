# MediKiosk — Phases

## Phase 0 / MVP — built in this POC (done)
Everything below exists in the codebase today, fully client-side, no backend.

- [x] Segmented role switcher: Patient Kiosk Mode ↔ Physician Console, sharing one store.
- [x] Top bar system indicators: simulated "ABDM Online" status, current language chip, SOS button.
- [x] Step 1 — Welcome & Identification
  - [x] Language chips: English / हिन्दी / தமிழ்.
  - [x] "Scan ABHA QR Code" → simulated camera viewfinder modal, auto-resolves after 1.5s.
  - [x] "Enter Mobile Number" → simulated verification with masked mock profile.
- [x] Step 2 — Chief Complaint Elicitation
  - [x] 4-symptom icon grid (Chest Pain, High Fever/Chills, Abdominal Discomfort, Severe Cough).
  - [x] Adaptive follow-up: duration selector, 1–10 severity slider with plain-language anchors,
        associated-symptom toggle checklist.
- [x] Step 3 — Document Scanner Simulation
  - [x] Dropzone-style "tap to scan" trigger.
  - [x] ~2s simulated scan with progress bar and rotating OCR/NER status messages.
  - [x] Structured extraction display: medications (name, dose, frequency) + flagged lab values
        with high/low chips and reference ranges.
- [x] Step 4 — Summary & Token Dispatch
  - [x] Full review screen (identity, complaint, document summary).
  - [x] Confirmation with generated OPD token, assigned room, and estimated wait time.
  - [x] Record automatically appended to the Physician Console's live queue.
- [x] True bidirectional navigation: `< Back` on every step, all prior answers retained.
- [x] Physician Console
  - [x] Live, wait-time-ordered queue sidebar (token, name, age/gender, wait time, complaint badge).
  - [x] Rapid Consult Summary: HPI block, extracted medications, flagged labs.
  - [x] `Amend Record` inline HPI editing.
  - [x] `Push to Hospital EMR / ABDM` action with toast confirmation and per-record "sent" state.
- [x] Anti-"AI slop" visual system: slate/zinc/white neutral base, single emerald clinical accent,
      no gradients/glow, 48–56px touch targets with press feedback.
- [x] Lightweight, fast-loading SVG pulse-wave accent on the welcome screen (no canvas, no assets).
- [x] Privacy: all identifiers are masked mock tokens — no real ABHA/Aadhaar/mobile numbers.

**Explicitly not built in MVP:** any network call, any persistence beyond the browser tab, any
authentication, any multi-kiosk concurrency.

## Phase 2 — real integrations, single-facility pilot
Replace each simulated boundary listed in `architecture.md §6` with a live integration, one at a
time, without changing the store's action shapes.

- [ ] **Real ABHA verification** — ABDM QR/OTP verification API behind `QRScanModal`; mobile-path
      hits a real HIS/ABDM patient-lookup + OTP service.
- [ ] **Real OCR + medical NER** — replace `MOCK_OCR_RESULT` with a live pipeline (e.g. cloud OCR
      + a medical NER model) behind a new `services/ocr.js`; handle low-confidence extractions
      with a "please confirm" review sub-step before Step 4.
- [ ] **Real Bhashini speech-to-text** — voice-driven symptom and complaint entry in all three
      launch languages, as an alternative input method alongside the existing tap-based flow.
- [ ] **Shared real-time queue** — move `queue` out of local reducer state into a real-time
      backend (WebSocket or a managed real-time DB) so multiple physical kiosks feed one console
      and multiple consoles can co-triage.
- [ ] **Persistence & session recovery** — survive a kiosk browser refresh or crash mid-flow.
- [ ] **Basic auth for the Physician Console** — staff login, not open by URL.
- [ ] **Accessibility pass with real users** — screen-reader labeling audit, large-text mode,
      left-handed/right-handed touch reach validation on actual kiosk hardware.

## Phase 3 — hospital-grade rollout
- [ ] **FHIR-formatted EMR push** — `pushToEmr` posts a real FHIR bundle (Patient, Condition,
      Observation, MedicationStatement resources) to the hospital EMR / ABDM Health Information
      Provider, with real success/failure handling and retry.
- [ ] **Multi-department routing logic** — replace the static symptom→room mapping with live
      department capacity and physician availability.
- [ ] **Analytics & throughput dashboards** — average wait time, token-to-consult latency,
      symptom distribution, OCR extraction accuracy over time.
- [ ] **Offline-first kiosk mode** — queue intakes locally and sync when ABDM connectivity drops,
      surfaced through the existing "ABDM Online" indicator (which already exists as a UI seam
      in `TopBar`, currently hardcoded true).
- [ ] **Multi-facility, multi-language expansion** beyond English/Hindi/Tamil, with a proper
      i18n layer replacing the current static `LANGUAGES` array.
- [ ] **Formal clinical validation** of the severity-slider and adaptive-questioning logic with
      hospital clinical governance before wider deployment.
- [ ] **Security & compliance review** — DPDP Act (India) compliance audit, encryption at rest,
      audit logging for every EMR push and record amendment.
