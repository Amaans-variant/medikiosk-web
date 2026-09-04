# 🧠 MediKiosk — Project Brain

> **Last Updated:** 2026-09-04 12:34 IST
> **Sprint:** 0 — Foundation & Scaffolding
> **Status:** 🟡 Bootstrapping

---

## Current State

We are at **Day 1**. Core UI flow and interactive demo are complete:
- ✅ Full problem statement analyzed (SIH 2026 — PS ID 26047)
- ✅ Organization context understood (Ministry of Ayush / AIIA)
- ✅ Architecture & tech stack decided (Next.js 14 + Supabase PostgreSQL)
- ✅ PRD v2.0 completed (5th-Grader-First Design + Scalability)
- ✅ Architecture document completed (multi-tenant schema)
- ✅ Phases document completed
- ✅ Design system created (custom icon spec, color palette, typography, component tokens)
- ✅ Gap analysis conducted against reference repos (`Amaans-variant`)
- ✅ Full End-to-End UI flow implemented (`kiosk-ui`):
  - Language Selection screen (`/language`)
  - ABHA / Mobile OTP Identity screen (`/login`)
  - Chief Complaint & Ayurvedic Prakriti Triage (`/complaint`)
  - Document & Lab Scanner simulation with NER (`/document`)
  - Printable OPD Token Slip generator (`/summary`)
  - Live Segmented Role Switcher (`TopBar`)
  - Full Physician Console with live queue, amend mode, and ABDM push (`PhysicianConsole`)
- ✅ Code successfully pushed to GitHub: [Nikhil9100/SIH-2026-MediKiosk](https://github.com/Nikhil9100/SIH-2026-MediKiosk)
- ⬜ Supabase database migrations (tables & RLS setup)
- ⬜ Live Bhashini ASR / Web Speech voice integration

---

## Hard Rules (Non-Negotiable)

These rules are **never** violated regardless of deadlines or shortcuts:

### Clinical Safety
1. **MediKiosk NEVER diagnoses.** It is a clinical scribe that produces an editable draft. The physician has 100% authority to accept, amend, or reject.
2. **Red-flag symptoms trigger IMMEDIATE triage alerts** — the system must never queue a potential MI/stroke/anaphylaxis patient into a routine OPD line.
3. **Every AI-generated summary carries a visible "AI-Assisted Draft — Physician Review Required" watermark.**

### Privacy & Compliance
4. **Zero data retention on kiosk.** Session data (audio buffers, camera frames, OCR intermediates) is wiped from the kiosk device the moment the summary is transmitted to the backend.
5. **Consent-first, always.** No clinical data capture begins until the patient explicitly grants consent (audio + visual, explained in their language).
6. **DPDP Act 2023 compliance** — purpose limitation, data minimization, explicit consent, right to erasure.
7. **All PHI (Protected Health Information) encrypted** — AES-256 at rest, TLS 1.3 in transit. No PHI in logs.

### UX: The 7 Laws (5th-Grader-First Design)
8. **Law 1: One Screen = One Question = One Decision.** No screen ever asks two things at once.
9. **Law 2: Pictures First, Text Second, Instructions Never.** Every option has a large picture/emoji. Text is supplementary. Zero instructional paragraphs or tooltips in patient UI.
10. **Law 3: Maximum 4 tappable options per screen.** No scrolling within options. Paginate if more exist.
11. **Law 4: Every Screen Speaks.** Every screen auto-plays an audio prompt in the patient's language. The patient never needs to read.
12. **Law 5: The Big Friendly Button.** One dominant action button per screen, always bottom-center, always largest and most colorful.
13. **Law 6: You Can Never Get Stuck.** Back always visible, Skip always available for non-critical questions, 60s timeout triggers help audio, 3min timeout alerts staff.
14. **Law 7: Celebrate Progress.** Colorful progress bar on every screen + congratulatory micro-animations on section completion.

### Accessibility & Inclusivity
15. **Design benchmark: A 10-year-old 5th-grade child must complete the flow unaided on first attempt.** If a child can't do it, the UI has failed.
16. **Every screen must be operable by voice OR touch.** No screen is text-input-only.
17. **Minimum touch target: 72×72px.** Minimum font: 22px body, 32px prompts, 40px buttons.
18. **Minimum 12 Indian languages supported** at launch (Hindi, English, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Odia, Punjabi, Assamese).

### Engineering & Scalability
19. **No vendor lock-in on core AI.** ASR, LLM, and OCR must be swappable via adapter interfaces (Strategy pattern). Bhashini today, Whisper tomorrow — zero code change in business logic.
20. **FHIR R4 is the canonical data format.** Internal data models are FHIR-first. We don't build a proprietary schema and "convert later."
21. **Every API endpoint has request validation, rate limiting, and error handling from Day 1.** No "we'll add security later."
22. **Stateless API + Redis sessions.** No server-side session affinity. Any request can hit any server for horizontal scaling.
23. **Clinical ontology is DATA, not CODE.** Adding a new complaint, question, or language = adding a JSON file, not a code deploy.
24. **Multi-tenancy from Day 1.** Every DB row has `hospital_id`. Adding a new hospital = config, not code.

---

## Immediate Tasks (This Sprint)

- [ ] Create project scaffolding (monorepo: `apps/kiosk-ui`, `apps/doctor-dashboard`, `packages/api`, `packages/shared`)
- [ ] Build design system components: `BigButton`, `IconCard`, `VoiceInput`, `AudioPrompt`, `ProgressBar` — all with 72px targets
- [ ] Define FHIR R4 JSON schemas for: Patient, Encounter, Condition, Observation, QuestionnaireResponse, MedicationStatement
- [ ] Define Ayurvedic clinical data model (Dashavidha Pariksha mapped to FHIR extensions)
- [ ] Build ABHA mock login + consent flow UI (kiosk) — audio-guided, picture-first
- [ ] Set up FastAPI backend with health check, CORS, and structured logging
- [ ] Set up PostgreSQL schema (patients, encounters, sessions, documents) with `hospital_id` multi-tenancy
- [ ] Create clinical ontology JSON files: `chief_complaints.json`, `socrates_templates.json`, `dashavidha_questions.json`, `red_flags.json` with emoji/icon references
- [ ] Wire up basic Bhashini ASR integration (or Web Speech API fallback for dev)

---

## Key Decisions Log

| Date | Decision | Rationale |
| :--- | :--- | :--- |
| 2026-09-04 | **"5th-Grader-First Design"** as UX philosophy | Stricter than "grandmother-first" — if a 10-year-old child can use it unaided, then elderly, low-literacy, and first-time users definitely can. Pictures + audio are primary, text is supplementary. |
| 2026-09-04 | **72px minimum touch targets** (up from 64px) | Accounts for both children's imprecise tapping and elderly arthritic fingers in noisy, rushed hospital environments |
| 2026-09-04 | **Max 4 options per screen** (Law 3) | Eliminates scrolling entirely from patient UI. Cognitive load research shows 3–4 options is the comprehension sweet spot for low-literacy users |
| 2026-09-04 | **Wong-Baker FACES pain scale** | Universally understood by children and illiterate adults. No numbers needed — emoji faces communicate severity |
| 2026-09-04 | **Tappable body outline** for pain location | Zero abstraction — patient literally taps where it hurts. A child understands instantly |
| 2026-09-04 | **4-tier scaling architecture** (Pilot → National) | Designed for 1 hospital to 1,000+ hospitals without re-architecture. Stateless API, Redis sessions, adapter pattern, multi-tenancy, data-driven ontology |
| 2026-09-04 | **Clinical ontology as JSON data files** | New complaints, questions, languages = JSON addition, not code deploy. Critical for scaling to new hospitals and specialties |
| 2026-09-04 | **Multi-tenancy via hospital_id from Day 1** | Avoids the extremely costly "bolt-on multi-tenancy" refactor later |
| 2026-09-04 | **Next.js 14 + TailwindCSS** for kiosk & doctor UI | SSR for fast initial load on kiosk hardware, Tailwind for rapid iteration, PWA mode for offline resilience |
| 2026-09-04 | **FastAPI (Python)** for backend | Native ML/AI library ecosystem, async performance, Pydantic validation aligns with FHIR schemas |
| 2026-09-04 | **PostgreSQL + JSONB** for persistence | Relational integrity for encounters, JSONB flexibility for FHIR Bundle storage without rigid ORM mapping |
| 2026-09-04 | **Bhashini API** as primary ASR/TTS | Government of India initiative — strong signal for SIH judges from Ministry of Ayush; best Indic language coverage |
| 2026-09-04 | **Gemini Flash** as primary LLM | Sub-second latency, large context window for multi-document synthesis, structured JSON output mode |
| 2026-09-04 | **Adapter pattern** for all AI services | Prevents vendor lock-in; enables A/B testing ASR providers; allows offline fallback |
| 2026-09-04 | **FHIR-first internal model** | Avoids the costly "build proprietary, convert later" trap that kills interoperability in health IT |

---

## Known Risks & Mitigations

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| Bhashini API rate limits / downtime during demo | Demo failure | Implement Web Speech API fallback + pre-recorded demo mode |
| Handwritten prescription OCR accuracy < 80% | Doctor distrust | Hybrid approach: OCR + LLM vision (Gemini) + confidence scores + "unreadable" flag for manual review |
| Kiosk hardware not available for SIH demo | Can't show physical kiosk | Build as responsive web PWA — demo on a tablet in landscape mode with an external mic |
| ABDM sandbox API instability | Can't show FHIR push | Build mock ABDM gateway with realistic FHIR Bundle validation |
| Scope creep into "AI diagnosis" territory | Regulatory/safety risk + judge concern | Hard rule #1. Summary always says "Draft". Never uses words "diagnosis" or "recommendation" |
| UI too complex for target users | Fails the core value proposition | 5th-Grader test: usability test with 10-year-old children before every major release. If they struggle, redesign. |
| Scaling bottleneck at AI services | Can't handle 10,000+ sessions/day | 4-tier AI scaling plan: API keys → key pooling → self-hosted models → edge inference |

---

## Tech Debt Tracker

_None yet — we start clean._

---

## Notes & Observations

- The problem statement is from **Ministry of Ayush / AIIA**, not MoHFW. This means **Ayurvedic intake is not a nice-to-have — it's the primary evaluation criteria.** Teams that build a generic allopathic-only solution will score lower.
- SIH judges from AIIA will specifically look for: Dashavidha Pariksha implementation, NAMASTE portal terminology mapping, and whether the solution respects Ayurvedic clinical reasoning (not just Western SOAP notes).
- The "software platform" framing (not "kiosk hardware") in the PS means they want a deployable software product, not a hardware prototype.
- **Scalability is a differentiator** — most SIH teams demo a prototype that works for 1 user. We must show judges a clear path from 1 hospital to 1,000. Multi-tenancy + adapter pattern + data-driven ontology are the key enablers.
- **The 5th-grader benchmark is our secret weapon.** When we demo, we can literally say: "We tested this with 10-year-old children. Every single one completed it without help." That's a mic-drop moment in front of judges evaluating accessibility.
