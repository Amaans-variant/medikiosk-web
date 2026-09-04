# 📅 MediKiosk — Build Phases

> **Philosophy:** Ship a working, demoable product at the end of EVERY phase.
> Never have a phase where you're "building infrastructure that won't be visible until Phase 3."
> Every phase ends with something you can put in front of a judge or user and say "try this."

---

## Phase Overview

```
Phase 1 ──────── Phase 2 ──────── Phase 3 ──────── Phase 4 ──────── Phase 5
Foundation &     Voice + Touch    Document OCR     Doctor Dashboard  ABDM & Polish
Walking Skeleton Clinical Intake  & Intelligence   & Summary Gen     & Demo Prep

Days 1-2         Days 3-5         Days 6-7         Days 8-9          Days 10-12
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MVP ────────────────────────────────────────────────── SIH Demo Ready ─────────
```

---

## Phase 1: Foundation & Walking Skeleton (Days 1–2)

### Goal
A fully running app with a patient flow that works end-to-end — even if the AI is mocked. Patient can log in, answer a few hardcoded questions via touch, see a basic summary, and a doctor can see it on a separate screen.

### Why This First
- Proves the full pipeline works before we add complexity
- Unblocks parallel work on all modules
- Gives us a demoable product on Day 2 if everything else fails

### Deliverables

| # | Task | Output |
| :--- | :--- | :--- |
| 1.1 | **Monorepo scaffolding** — `apps/kiosk-ui`, `apps/doctor-dashboard`, `packages/api`, `packages/shared` | Running project with hot reload |
| 1.2 | **FastAPI backend** — health check, CORS, structured logging, Pydantic config | `http://localhost:8000/docs` working |
| 1.3 | **PostgreSQL + Redis setup** — Docker Compose with volumes | `docker-compose up` boots full stack |
| 1.4 | **Database schema** — Alembic migration for core tables (patients, sessions, history_entries, summaries) | Schema applied, seed data loaded |
| 1.5 | **Kiosk UI shell** — Language selector → Mock ABHA login → Consent screen | 3-screen patient flow working |
| 1.6 | **Touch-only chief complaint screen** — Hardcoded 12 common complaints with medical icons | Patient taps "Pet Dard" and it records |
| 1.7 | **Mock summary generator** — Takes recorded answers, formats as JSON, stores in DB | Summary stored and retrievable via API |
| 1.8 | **Doctor dashboard shell** — Login → Queue list → Patient summary view (reads from same DB) | Doctor sees what patient entered |
| 1.9 | **Design system foundation** — `BigButton`, `IconCard`, `LanguageSelector` components with 64px touch targets | Reusable, accessible component library |
| 1.10 | **Clinical data files** — `chief_complaints.json`, `red_flags.json` with Hindi + English labels | Data-driven question bank (not hardcoded in UI) |

### Definition of Done (Phase 1)
- [ ] `docker-compose up` starts entire stack
- [ ] Patient flow: Language → Login → Consent → Chief Complaint (touch) → Basic Summary
- [ ] Doctor flow: Login → See patient in queue → View summary
- [ ] All data persisted in PostgreSQL
- [ ] Zero AI dependencies (everything mocked)

### What We Deliberately Skip
- ❌ Voice input (Phase 2)
- ❌ Adaptive branching (Phase 2)
- ❌ Ayurvedic assessment (Phase 2)
- ❌ Document scanning (Phase 3)
- ❌ LLM-generated summaries (Phase 4)
- ❌ ABDM/FHIR integration (Phase 5)

---

## Phase 2: Voice + Touch Clinical Intake Engine (Days 3–5)

### Goal
The clinical intake becomes intelligent — adaptive questioning, voice input, AYUSH assessment, and red-flag detection. This is the **core differentiator** of the product.

### Deliverables

| # | Task | Output |
| :--- | :--- | :--- |
| 2.1 | **ASR adapter integration** — Bhashini API (primary) + Web Speech API (dev fallback) | Patient speaks in Hindi; text appears on screen |
| 2.2 | **TTS audio prompts** — Every question spoken aloud in patient's language | Audio plays automatically on each question screen |
| 2.3 | **`VoiceInput` component** — Microphone button with listening indicator, auto-stop on silence | Dual-mode: patient can speak OR tap, never forced to do one |
| 2.4 | **Dialogue Manager** — Adaptive question engine driven by `socrates_templates.json` | "Chest pain" → onset → character → radiation → severity (not a flat form) |
| 2.5 | **HPI deep-dive flow** — SOCRATES branching for top 20 chief complaints | Each complaint has tailored follow-up questions |
| 2.6 | **Past medical/surgical history** — Common conditions checklist (DM, HTN, Asthma, TB, Thyroid, Surgeries) | Touch cards with icons + voice fallback |
| 2.7 | **Current medications** — Voice: "Metformin 500 subah shaam" → parsed to structured med entry | Medication name + dose + frequency extracted from speech |
| 2.8 | **Allergy capture** — Drug allergies + food allergies with severity | Structured allergy list |
| 2.9 | **Family history** — Common hereditary conditions (DM, HTN, Heart Disease, Cancer) | Quick checklist with relationship mapping |
| 2.10 | **Review of Systems (ROS)** — Quick yes/no icon scan across major body systems | CVS, Resp, GI, MSK, Neuro, GU — each with 3-4 key symptoms |
| 2.11 | **Dashavidha Pariksha (AYUSH) module** — Full Ayurvedic constitutional assessment | Prakriti, Vikriti, Sara, Samhanana, Pramana, Satmya, Sattva, Ahara Shakti, Vyayama Shakti, Vaya — in colloquial Hindi/English |
| 2.12 | **Red-flag interceptor** — Rule-based + keyword matching for emergency symptoms | Triggers screen change to red alert + triage notification |
| 2.13 | **Session progress bar** — Visual indicator showing patient how far along they are | "Aap 60% ho chuke hain" with colored progress |
| 2.14 | **Back/undo navigation** — Patient can go back and change any answer | Maintains full answer stack with edit capability |

### Definition of Done (Phase 2)
- [ ] Patient can complete full intake via voice OR touch in Hindi and English
- [ ] Adaptive branching works for at least 10 chief complaints
- [ ] Dashavidha Pariksha assessment generates structured AYUSH data
- [ ] Red-flag detection works for cardiac, stroke, respiratory, anaphylaxis
- [ ] Every question has audio prompt (TTS)
- [ ] Session is resumable if patient takes a break

### Key Risk
- **Bhashini API rate limits or downtime.** Mitigation: Web Speech API fallback is ready from Day 1. Pre-record demo audio for SIH presentation.

---

## Phase 3: Document OCR & Intelligence (Days 6–7)

### Goal
Patient can photograph/upload their physical medical documents, and the system extracts medications, lab values, and diagnoses into a structured timeline.

### Deliverables

| # | Task | Output |
| :--- | :--- | :--- |
| 3.1 | **Document capture UI** — Camera viewfinder with auto-edge detection + file upload alternative | Works on kiosk camera and phone camera (PWA) |
| 3.2 | **OCR adapter integration** — Gemini Vision API (primary) + PaddleOCR (fallback) | Extracted text from printed and handwritten documents |
| 3.3 | **Document classifier** — Auto-detect: Prescription / Lab Report / Discharge Summary / Imaging | Classified with confidence score |
| 3.4 | **Clinical entity extractor** — LLM-based extraction of medications, lab values, diagnoses, procedures | Structured JSON: `{medications: [{name, dose, freq}], labs: [{analyte, value, ref_range, unit}]}` |
| 3.5 | **Abnormal value highlighter** — Lab values compared against standard reference ranges | Out-of-range flagged: Normal / Borderline / Critical |
| 3.6 | **Chronological timeline** — Documents sorted by date into a visual timeline | Patient and doctor can see medical history chronologically |
| 3.7 | **Confidence scoring & manual review flag** — Entities below 70% confidence marked for doctor review | Doctor sees which extractions are uncertain |
| 3.8 | **Multi-document handling** — Patient can scan 5–10 documents in one session | Batch processing with progress indicator |

### Definition of Done (Phase 3)
- [ ] Patient uploads a photo of a prescription → system extracts medication list
- [ ] Patient uploads a lab report → system extracts values and flags abnormals
- [ ] Documents appear in chronological order on doctor's timeline view
- [ ] Handles both Hindi and English documents
- [ ] Confidence scores displayed for all extracted entities

### Key Risk
- **Handwritten prescription accuracy.** Mitigation: Use Gemini Vision (multimodal LLM) which is significantly better than traditional OCR for handwritten medical text. Always show confidence and allow doctor correction.

---

## Phase 4: Doctor Dashboard & Summary Generator (Days 8–9)

### Goal
The doctor sees a complete, AI-synthesized, structured clinical summary on their screen the moment the patient walks in. The summary combines conversational history AND digitized documents into one physician-ready view.

### Deliverables

| # | Task | Output |
| :--- | :--- | :--- |
| 4.1 | **LLM summary generator** — Synthesizes all intake answers + document extractions into structured clinical summary | JSON summary in standard format: CC → HPI → Past → Meds → Allergies → Family → Personal → ROS → AYUSH → Documents |
| 4.2 | **Doctor queue view** — Real-time OPD queue with patient names, token numbers, and summary status | List updates via WebSocket when new patients complete intake |
| 4.3 | **Patient summary screen (Doctor)** — Full summary with sections, flags, and timeline | As designed in PRD Section 5.5 |
| 4.4 | **AYUSH assessment card** — Dedicated Dashavidha Pariksha results panel | Prakriti, Agni, Koshtha, etc. in card format with NAMASTE codes |
| 4.5 | **Inline editing** — Doctor can click any field and edit it | Every bullet point is editable; edits are tracked |
| 4.6 | **Accept / Amend / Reject workflow** — Doctor actions that finalize the summary | Accepted summaries are marked for ABDM push |
| 4.7 | **Flagged values panel** — Aggregated view of abnormal labs and drug interaction warnings | Prominent amber/red cards at top of summary |
| 4.8 | **Triage alert panel** — Real-time alerts for red-flag patients | Audio + visual alert on doctor's screen; 1-click acknowledge |
| 4.9 | **Patient audio confirmation** — Before submission, patient hears a spoken recap and confirms | "Aapne bataya ki 3 din se sir dard hai aur ulti jaisa lagta hai. Kya yeh sahi hai?" |
| 4.10 | **"AI-Assisted Draft" watermark** — Visible on every summary | Non-removable disclaimer |

### Definition of Done (Phase 4)
- [ ] AI generates structured clinical summary from intake + documents
- [ ] Doctor sees summary on their screen with all sections
- [ ] Doctor can edit, accept, or reject the summary
- [ ] AYUSH assessment card shows Dashavidha Pariksha results
- [ ] Real-time queue updates and triage alerts work

---

## Phase 5: ABDM Integration, Polish & Demo Prep (Days 10–12)

### Goal
Production-grade polish, ABDM/FHIR compliance, security hardening, and a flawless SIH demonstration.

### Deliverables

| # | Task | Output |
| :--- | :--- | :--- |
| 5.1 | **FHIR R4 Bundle builder** — Generate valid FHIR Bundles from accepted summaries | Patient, Encounter, Condition, Observation, MedicationStatement, QuestionnaireResponse resources |
| 5.2 | **ABDM sandbox integration** — ABHA verification + FHIR push to ABDM sandbox | Demonstrate ABDM interoperability (even if sandbox) |
| 5.3 | **Consent management hardening** — Audio-visual consent with granular options and audit trail | DPDP Act 2023 compliant consent flow |
| 5.4 | **Session purge mechanism** — Auto-delete temporary data from kiosk/client/Redis within 30 seconds | Verified via audit log that temp data is gone |
| 5.5 | **Security audit** — PHI scrubbing from logs, rate limiting verification, CORS lockdown | Security checklist passed |
| 5.6 | **Performance optimization** — Lazy loading, API response caching, image compression | Page loads < 2s, API responses < 500ms |
| 5.7 | **Offline resilience** — Touch-only mode works if network drops; data queued for sync | PWA service worker with offline fallback |
| 5.8 | **Demo mode** — Pre-loaded patient personas (Kamla Devi, Rajesh Kumar) with scripted flows | 1-click demo scenarios for SIH presentation |
| 5.9 | **Error handling & edge cases** — Graceful failures for ASR timeout, OCR failure, LLM error | User-friendly error messages in Hindi/English, auto-retry |
| 5.10 | **README, deployment docs, and pitch deck integration** — Clean documentation | Judges can understand and run the project independently |

### Definition of Done (Phase 5)
- [ ] Full end-to-end patient journey works flawlessly (Identify → Converse → Scan → Confirm → Doctor Review)
- [ ] FHIR R4 Bundle is generated and validated
- [ ] ABDM sandbox shows data push
- [ ] Demo mode runs smoothly with pre-loaded personas
- [ ] All temporary data is purged after session ends
- [ ] Project runs with single `docker-compose up` command

---

## Parallel Workstreams

If you have a team of 5-6 members, here's how to parallelize:

```
                    Day 1-2          Day 3-5          Day 6-7          Day 8-9          Day 10-12
                   ─────────       ──────────       ──────────       ──────────       ───────────
Frontend Dev 1:    Kiosk shell     Voice+Touch      Doc capture UI   Summary screens  Polish & Demo
                   Design system   intake flow      scanner UI       AYUSH card       Offline mode

Frontend Dev 2:    Doctor shell    (help Frontend1) Timeline view    Doctor dashboard Error handling
                   Queue page      ROS screens      Doc review       Edit/Accept      Demo mode

Backend Dev 1:     FastAPI setup   Dialogue Mgr     OCR pipeline     Summary gen      FHIR builder
                   DB schema       Clinical ontol.  Entity extract   LLM integration  ABDM sandbox

Backend Dev 2:     Auth/Consent    ASR adapter       Doc classifier  Triage alerts    Security audit
                   Redis sessions  TTS adapter       Abnormal flags  Queue WebSocket  Session purge

AI/ML Lead:        Clinical data   SOCRATES logic    OCR tuning       Summary prompt  Demo personas
                   Question bank   Dashavidha Qs     Entity prompts   AYUSH mapping   E2E testing

PM / Designer:     PRD/wireframes  User testing      User testing     User testing     Pitch deck
                   Icon design     Flow validation   Doc flow test    Doctor UX test   Video demo
```

---

## Decision Framework: What to Cut if Running Behind

> **Rule: Always cut SCOPE, never cut QUALITY.**

If you're behind schedule, cut features in this order (bottom = cut first):

```
KEEP AT ALL COSTS (Core Demo)
├── Touch-based chief complaint + HPI (SOCRATES)
├── Dashavidha Pariksha assessment (MUST for Ministry of Ayush)
├── Doctor summary screen (Accept/Edit)
├── Red-flag detection & triage alert
├── Basic ABHA login + consent flow
├── At least Hindi + English voice
│
CUT IF 2 DAYS BEHIND
├── Document OCR (replace with manual entry form)
├── ABDM FHIR push (show generated Bundle, skip API call)
├── Real-time WebSocket updates (use polling)
│
CUT IF 4 DAYS BEHIND
├── Voice input (go touch-only with audio prompts)
├── Chronological timeline (show flat list)
├── Drug interaction alerts
├── Offline mode
│
NEVER CUT
├── Ayurvedic assessment (it's the evaluating organization's core)
├── Consent flow (privacy compliance is non-negotiable)
├── Doctor edit capability (AI must never be autonomous)
├── "AI-Assisted Draft" disclaimer
└── Hindi language support
```

---

## Post-SIH Roadmap (If Selected for Grand Finale / Production)

| Phase | Timeline | Features |
| :--- | :--- | :--- |
| **v1.1** | Month 1–2 | Real ABDM production integration, expanded language support (all 22 scheduled languages), hospital pilot at AIIA |
| **v1.2** | Month 3–4 | IoT vitals integration (BP monitor, thermometer, pulse oximeter), specialist referral routing |
| **v2.0** | Month 5–8 | Multi-hospital deployment, HIS/EMR adapter marketplace, clinical decision support for doctors |
| **v3.0** | Month 9–12 | Population health analytics dashboard, Ayurvedic treatment outcome tracking, research data export |
