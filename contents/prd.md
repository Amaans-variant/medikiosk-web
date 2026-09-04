# 📋 MediKiosk — Product Requirements Document (PRD)

> **Product Name:** MediKiosk — AI Clinical History Software Platform
> **Problem Statement:** SIH 2026 — PS ID 26047 (Patient Case-Taking Software)
> **Organization:** Ministry of Ayush / All India Institute of Ayurveda (AIIA)
> **Version:** 2.0
> **Date:** 2026-09-04
> **Design Benchmark:** A 5th-grade student must be able to use this with zero help.

---

## 1. Executive Summary

MediKiosk is an **AI-powered patient-facing software platform** that enables patients to independently record a comprehensive medical history — through natural spoken conversation and guided touchscreen interaction — and simultaneously digitize their existing physical medical documents, generating a **structured, physician-ready clinical history summary** before the patient enters the consultation room.

It is **not** a chatbot. It is **not** a registration terminal. It is a **clinical intake system** that performs the work of a 15-minute structured history interview in under 5 minutes, with zero training required from the patient.

**The UI is designed so that a 10-year-old child can operate it on their first attempt.** If a screen needs an instruction manual, a tooltip, or a staff member to explain it — it has failed.

---

## 2. Problem Definition

### 2.1 Who Has the Problem?

| Stakeholder | Pain Point |
| :--- | :--- |
| **Patients** (especially elderly, rural, low-literacy) | Cannot communicate full history in 2-min OPD slots; carry disorganized paper records; repeat the same history at every visit; get misdiagnosed due to incomplete information |
| **OPD Physicians** (Ayurvedic & Allopathic) | Spend 60–70% of consultation time on history elicitation and deciphering paper records instead of clinical reasoning; cannot perform classical Dashavidha Pariksha in time-constrained OPDs |
| **Hospital Administrators** | Patient throughput bottlenecked at doctor's desk; no structured digital clinical data captured; ABDM integration remains on paper |
| **AYUSH Practitioners specifically** | Classical Ayurvedic assessment (Prakriti, Agni, Koshtha, etc.) requires significantly more time than allopathic history — currently impossible in OPD settings |

### 2.2 What Doesn't Exist Today?

No existing solution combines all four of:
1. **Conversational clinical history** (not a dumb form)
2. **Medical document digitization with entity extraction** (not just scanning)
3. **Ayurvedic (Dashavidha Pariksha) + Allopathic (SOCRATES/ROS) dual-framework intake**
4. **ABDM/FHIR-compliant output** ready for HIS integration

---

## 3. Target Users & Personas

### Persona 1: Kamla Devi (Primary Patient User — Low Literacy)
- **Age:** 62, Female
- **Location:** Rural Uttar Pradesh, visiting AIIA New Delhi OPD
- **Literacy:** Cannot read Hindi or English; speaks Awadhi-accented Hindi
- **Tech comfort:** Has never used a smartphone; uses a basic feature phone for calls
- **Medical context:** Diabetic for 8 years, carries 12+ paper prescriptions in a plastic bag, has knee pain (new complaint)
- **Need:** Must be able to complete the entire intake process using ONLY voice and large visual tap buttons, with audio prompts in Hindi. She should feel like she's having a conversation, not filling a form.

### Persona 2: Arjun (Child Benchmark User)
- **Age:** 10, Male, 5th-grade student
- **Location:** Semi-urban Maharashtra
- **Literacy:** Can read basic Hindi; limited English; uses a parent's phone for YouTube
- **Medical context:** Brought to AIIA OPD by his grandmother (who cannot read) for recurring stomach pain
- **Need:** If Arjun can operate the kiosk for his grandmother by tapping pictures and listening to prompts, the UI has passed. He is our **design litmus test** — every screen must be obvious enough for him to understand without reading a single sentence of instructions.

### Persona 3: Dr. Priya Sharma (Ayurvedic OPD Physician)
- **Age:** 34, Female
- **Role:** Assistant Professor, Kayachikitsa (Internal Medicine) Dept, AIIA
- **Daily load:** 80–120 OPD patients/day
- **Need:** Wants a pre-filled, structured clinical history (allopathic format + Dashavidha Pariksha assessment) on her screen BEFORE the patient sits down. Must be editable, not locked. Wants flagged abnormal lab values and medication list at a glance.

### Persona 4: Rajesh Kumar (Young Urban Patient)
- **Age:** 28, Male
- **Location:** Delhi, first visit to AIIA for chronic acidity
- **Literacy:** Graduate, smartphone user, comfortable with English and Hindi
- **Need:** Wants a fast, smooth digital intake; would prefer typing/tapping over speaking in a crowded waiting room. Wants to upload photos of past lab reports from his phone.

---

## 4. Functional Requirements

### Module A: Conversational Multimodal History Engine

| ID | Requirement | Priority | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| A-01 | System shall conduct structured clinical history interview via voice AND touch simultaneously | P0 | Every question screen has: (1) audio prompt in selected language, (2) microphone listening indicator, (3) tappable option buttons with pictures |
| A-02 | ASR shall support minimum 12 Indian languages with regional accent tolerance | P0 | Hindi, English, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Odia, Punjabi, Assamese recognized with >85% accuracy |
| A-03 | Adaptive clinical branching based on chief complaint | P0 | If patient says "chest pain", system auto-branches into SOCRATES probing (onset, character, radiation, severity, etc.) |
| A-04 | AYUSH Dashavidha Pariksha intake mode | P0 | System elicits: Prakriti, Vikriti, Sara, Samhanana, Pramana, Satmya, Sattva, Ahara Shakti, Vyayama Shakti, Vaya — mapped to colloquial vernacular questions |
| A-05 | Red-flag symptom detection with immediate triage alert | P0 | Detection of: acute chest pain + dyspnoea, stroke symptoms (facial droop, arm weakness, speech difficulty), severe allergic reaction, suicidal ideation → screen turns alert mode, audio alarm, triage staff notified with token number |
| A-06 | Review of Systems (ROS) quick-scan | P1 | After HPI, system runs through major systems (CVS, Resp, GI, MSK, Neuro, GU, Psych) with yes/no icon cards |
| A-07 | TTS audio prompts for every question | P0 | Every question played aloud in patient's chosen language; patient can re-play by tapping speaker icon |
| A-08 | Session timeout with gentle audio reminder | P1 | If no input for 60 seconds, audio prompt: "Kya aapko koi madad chahiye?" (Do you need help?) — after 3 minutes, session pauses and alerts attendant |
| A-09 | Back/undo navigation | P0 | Patient can go back to any previous answer and change it via a large, always-visible "← Peeche" button |
| A-10 | Every option button must have a picture/emoji AND text | P0 | A non-literate user must be able to understand every option from the picture alone. Text is supplementary, never primary. |
| A-11 | Maximum 3-4 options visible per screen | P0 | No scrolling within options. If more than 4 options exist, paginate into separate screens with a "Aur Dikhayein (Show More)" button |

### Module B: Medical Document Digitization & Intelligence

| ID | Requirement | Priority | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| B-01 | Camera/scanner-based document capture | P0 | Patient places document; system auto-detects edges, de-skews, and captures high-resolution image. Single giant "📸 Photo Lo (Take Photo)" button. |
| B-02 | OCR for printed AND handwritten text in Hindi + English | P0 | >90% accuracy on printed lab reports; >75% accuracy on legible handwritten prescriptions |
| B-03 | Document classification | P0 | Auto-classifies into: Prescription, Lab Report, Discharge Summary, Imaging Report, Other |
| B-04 | Clinical entity extraction | P0 | Extracts: Medication name + dosage + frequency, Lab analyte + value + reference range, Diagnosis names, Surgery/procedure names with dates |
| B-05 | Chronological timeline generation | P1 | Documents sorted by extracted date into a visual medical timeline |
| B-06 | Abnormal value highlighting | P0 | Out-of-range lab values flagged with severity (Mild / Moderate / Critical) |
| B-07 | Drug interaction alert | P2 | Cross-references extracted medications against known interaction databases |
| B-08 | Confidence scoring | P0 | Each extracted entity has a confidence score; entities below 70% confidence flagged as "Needs Manual Verification" |
| B-09 | Simple skip option | P0 | If patient has no documents, single big "Mere paas koi kagaz nahi hai (I don't have any documents)" button to skip entire module |

### Module C: Structured History Summary Generator

| ID | Requirement | Priority | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| C-01 | Generate structured clinical summary in standard format | P0 | Output follows: Chief Complaint → HPI → Past Medical/Surgical → Drug & Allergy → Family → Personal → ROS → AYUSH Assessment → Prior Investigations Summary |
| C-02 | Physician-facing summary in English/Hindi | P0 | Clean, scannable bullet format; readable in ≤20 seconds |
| C-03 | Patient-facing audio confirmation | P0 | 15–30 second spoken recap in patient's language; patient confirms or requests changes via ✅ / ❌ emoji buttons |
| C-04 | Editable by physician | P0 | Every section is inline-editable; physician can add, delete, or modify any content |
| C-05 | "AI-Assisted Draft" watermark | P0 | Every summary carries visible disclaimer: "AI-Assisted Draft — Physician Review Required" |
| C-06 | 1-click Accept / Amend / Reject | P0 | Doctor can approve entire summary, edit sections, or reject and start fresh |
| C-07 | FHIR R4 Bundle export | P0 | Summary generates a valid HL7 FHIR R4 Bundle containing: Patient, Encounter, Condition(s), Observation(s), MedicationStatement(s), QuestionnaireResponse |
| C-08 | AYUSH-specific summary card | P0 | Separate card showing: Prakriti assessment, Agni status, Koshtha type, Ahara-Vihara observations, mapped to NAMASTE terminology |

### Module D: Consent, Privacy & ABDM Integration

| ID | Requirement | Priority | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| D-01 | ABHA ID authentication | P0 | Patient logs in via: ABHA QR scan, 14-digit ABHA number + OTP, or Aadhaar-based ABHA creation |
| D-02 | Audio-visual consent flow | P0 | Consent explained in patient's language via audio + simple animation/pictogram; explicit tap/voice confirmation required. No legal jargon — plain language only. |
| D-03 | Granular consent options | P1 | Patient can consent to: history capture, document scanning, data sharing with doctor, ABDM upload — independently |
| D-04 | Session data purge | P0 | All temporary data (audio buffers, camera frames, OCR intermediates) deleted from kiosk/client within 30 seconds of submission |
| D-05 | PHI encryption | P0 | AES-256 at rest; TLS 1.3 in transit; no PHI in application logs |
| D-06 | FHIR push to HIS | P1 | Structured summary pushed to hospital HIS/EMR via FHIR API |
| D-07 | ABDM Health Record linkage | P1 | Summary linked to patient's ABHA Personal Health Record |

---

## 5. UX Requirements & Design Principles

### 5.1 Design Philosophy: "5th-Grader-First Design"

> **The Golden Rule:** If a 10-year-old child cannot figure out what to do on every screen within 5 seconds — without reading any text — the screen has failed.
>
> Text is ALWAYS supplementary. Pictures, colors, audio, and spatial position are the PRIMARY communication channels.

This is stricter than "Grandmother-First Design." A grandmother may hesitate out of fear of technology. A child will tap confidently on whatever looks obviously tappable — so we must make the RIGHT action the OBVIOUS action.

### 5.2 The 7 Laws of MediKiosk UI

These laws are **inviolable**. Every PR, every design review, every screen is tested against them.

#### Law 1: One Screen = One Question = One Decision
No screen ever asks two things at once. The patient makes exactly one decision per screen: tap an option, speak an answer, or press Next/Skip.

#### Law 2: Pictures First, Text Second, Instructions Never
Every option has a large, instantly recognizable picture or emoji. Text appears below the picture as a label. There are zero instructional paragraphs, help text, or tooltips anywhere in the patient-facing UI.

#### Law 3: Maximum 4 Tappable Things Per Screen
The patient should see their options at a single glance. If there are more than 4 choices, they are paginated across screens — never scrolled.

#### Law 4: Every Screen Speaks
Every screen auto-plays a clear audio prompt in the patient's language the moment it loads. The patient always knows what to do because the screen TELLS them — they don't need to read.

#### Law 5: The Big Friendly Button
Every screen has ONE dominant action button that is visually the largest, most colorful element on the screen. It's always in the same position (bottom-center). The patient's eye and thumb are trained to always go to the same spot.

#### Law 6: You Can Never Get Stuck
- Back button always visible (top-left, always same position)
- Skip button always visible for non-critical questions (top-right)
- If stuck for 60 seconds → audio: "Kya aapko madad chahiye?"
- If stuck for 3 minutes → staff is alerted
- No dead-end screens. Every screen has a way forward.

#### Law 7: Celebrate Progress
A friendly, colorful progress bar runs along the top of every screen showing how far the patient has come. When completing a section, a brief congratulatory animation plays (e.g., ✅ with a gentle "Bahut accha!" audio) — the same positive feedback a child gets in a learning app.

### 5.3 Visual Design System

| Element | Specification | Why |
| :--- | :--- | :--- |
| **Minimum touch target** | 72 × 72px (2× Apple HIG minimum) | Sized for children's imprecise taps AND elderly arthritic fingers |
| **Font size** | Minimum 22px body; 32px question prompts; 40px primary buttons | Readable at arm's length in bright hospital lighting |
| **Color contrast** | WCAG AAA (7:1 ratio minimum) | Must work under harsh fluorescent lighting in Indian government hospitals |
| **Color palette** | 5 colors only: Blue (primary/trust), Green (yes/good/done), Red (no/alert), Amber (attention), White (background) | Minimal palette = instant comprehension. No confusing gradients or subtle shades |
| **Icon style** | Filled, bold, colorful emoji-style icons with thick outlines | Not flat design, not outlined icons — filled and chunky so they're recognizable even at 72px |
| **Option card style** | Rounded rectangle with colored border + large icon + bold label underneath | Looks "tappable" — like a physical button. No flat/borderless cards that look like text |
| **Layout** | Single-column, centered, one question per screen | No sidebars, no multi-column, no tabs. Linear flow like a storybook |
| **Spacing** | 24px minimum gap between tappable elements | Prevents mis-taps. A finger landing between two buttons should NOT trigger either |
| **Animation** | Only 3 animations in entire app: (1) gentle mic pulse when listening, (2) progress bar fill, (3) ✅ checkmark on section complete | No decorative transitions, no loading spinners with clever messages, no sliding panels |
| **Background** | Clean white (#FFFFFF) with soft gray (#F5F5F5) for section dividers | Maximum contrast, zero visual noise. Kiosk screens get dirty — white shows content clearly |
| **Error states** | Never use text-only errors. Show: 🔴 red icon + spoken audio explaining what went wrong + single retry button | The patient should NEVER see a technical error message |

### 5.4 Screen-by-Screen Interaction Wireframes

#### Screen 1: Language Selection (Entry Point)
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│              🏥  MEDIKIOSK                                       │
│              ────────────                                        │
│                                                                  │
│       🔊 "Apni bhasha chunein / Choose your language"            │
│                                                                  │
│    ┌────────────────┐    ┌────────────────┐                      │
│    │                │    │                │                      │
│    │   🇮🇳 हिन्दी    │    │   🇬🇧 English   │                      │
│    │                │    │                │                      │
│    └────────────────┘    └────────────────┘                      │
│    ┌────────────────┐    ┌────────────────┐                      │
│    │                │    │                │                      │
│    │   தமிழ்        │    │   తెలుగు       │                      │
│    │                │    │                │                      │
│    └────────────────┘    └────────────────┘                      │
│                                                                  │
│             ┌──────────────────────────┐                         │
│             │  ▼  Aur Bhasha (More)    │                         │
│             └──────────────────────────┘                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

Design notes:
• Flags or regional art as visual cues (not text-dependent)
• 4 most common languages shown first
• "More" button shows remaining 8 languages
• Audio plays in Hindi + English simultaneously on first load
```

#### Screen 2: ABHA Login
```
┌──────────────────────────────────────────────────────────────────┐
│ ← Peeche                                           Skip ⏭      │
│                                                                  │
│       🔊 "Apna ABHA card dikhayein ya number dalein"             │
│                                                                  │
│    ┌──────────────────────────────────────────────┐              │
│    │                                              │              │
│    │         📱  SCAN KAREIN                      │              │
│    │         (Scan QR Code)                       │              │
│    │                                              │              │
│    │      [  Camera Viewfinder Box  ]             │              │
│    │                                              │              │
│    └──────────────────────────────────────────────┘              │
│                                                                  │
│                      ── ya (or) ──                               │
│                                                                  │
│    ┌──────────────────────────────────────────────┐              │
│    │  🔢  ABHA Number Dalein (Enter ABHA Number)  │              │
│    │  ┌──────────────────────────────────────┐    │              │
│    │  │  __ __ - __ __ __ __ - __ __ __ __   │    │              │
│    │  └──────────────────────────────────────┘    │              │
│    └──────────────────────────────────────────────┘              │
│                                                                  │
│    ┌──────────────────────────────────────────────┐              │
│    │  👤  Naya Hoon (I'm New / No ABHA)           │              │
│    └──────────────────────────────────────────────┘              │
│                                                                  │
│   ▬▬▬▬▬░░░░░░░░░░░░░░░░░░░░░░░░░░░ 10%                        │
└──────────────────────────────────────────────────────────────────┘

Design notes:
• THREE clear paths: Scan, Type, or Skip
• "I'm New" button is prominent — most patients won't have ABHA
• Large numeric keypad (not phone keyboard) for ABHA entry
• Progress bar begins here
```

#### Screen 3: Chief Complaint Selection
```
┌──────────────────────────────────────────────────────────────────┐
│ ← Peeche                                                        │
│                                                                  │
│       🔊 "Aapko kya taklif hai?"                                 │
│          (What is troubling you?)                                │
│                                                                  │
│    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     │
│    │     🤕      │     │     🫁      │     │     🤢      │     │
│    │   Sir Dard   │     │   Saans ki  │     │    Ulti /   │     │
│    │  (Headache)  │     │   Taklif    │     │   Jee     │     │
│    │             │     │ (Breathing) │     │  Machlana   │     │
│    └─────────────┘     └─────────────┘     └─────────────┘     │
│                                                                  │
│    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     │
│    │     🫃      │     │     🦴      │     │     🔥      │     │
│    │  Pet Dard    │     │  Jod Dard   │     │   Bukhar    │     │
│    │  (Stomach)   │     │  (Joint)    │     │   (Fever)   │     │
│    └─────────────┘     └─────────────┘     └─────────────┘     │
│                                                                  │
│    ┌──────────────────────────────────────────────────────┐     │
│    │  🎤  Bol kar batayein (Speak your problem)          │     │
│    │      ████████░░░░░░░░ Listening...                  │     │
│    └──────────────────────────────────────────────────────┘     │
│                                                                  │
│    ┌──────────────────────────────────────────────────────┐     │
│    │                  ▼ Aur Dikhayein (Show More)         │     │
│    └──────────────────────────────────────────────────────┘     │
│                                                                  │
│   ▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░░░░░░░░ 25%                        │
└──────────────────────────────────────────────────────────────────┘

Design notes:
• 6 most common complaints shown as icon cards (3×2 grid)
• Each card is LARGE (min 72×72px icon, text below)
• "Show More" reveals next set of 6 complaints (paginated, not scrolled)
• Mic button always at bottom — patient can ALWAYS speak instead
• A 5th grader sees pictures of body parts and understands immediately
```

#### Screen 4: Follow-Up Question (SOCRATES Branching)
```
┌──────────────────────────────────────────────────────────────────┐
│ ← Peeche                                        Skip ⏭         │
│                                                                  │
│       🔊 "Pet dard kab se hai?"                                  │
│          (Since when do you have stomach pain?)                  │
│                                                                  │
│    ┌──────────────────┐     ┌──────────────────┐                │
│    │                  │     │                  │                │
│    │  📅 Aaj se       │     │  📅 2-3 Din      │                │
│    │  (Today)         │     │  (2-3 Days)      │                │
│    │                  │     │                  │                │
│    └──────────────────┘     └──────────────────┘                │
│    ┌──────────────────┐     ┌──────────────────┐                │
│    │                  │     │                  │                │
│    │  📅 1 Hafte se   │     │  📅 1 Mahine     │                │
│    │  (1 Week)        │     │  se zyada        │                │
│    │                  │     │  (>1 Month)      │                │
│    └──────────────────┘     └──────────────────┘                │
│                                                                  │
│    ┌──────────────────────────────────────────────────────┐     │
│    │  🎤  Bol kar batayein                                │     │
│    └──────────────────────────────────────────────────────┘     │
│                                                                  │
│   ▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░░░░░ 35%                        │
└──────────────────────────────────────────────────────────────────┘

Design notes:
• Exactly 4 options — no scrolling
• Each option has a calendar emoji — visual = time
• Skip button available for non-critical follow-ups
• Same layout pattern as every other question — patient learns the pattern once
```

#### Screen 5: Pain Severity (Visual Scale — No Numbers)
```
┌──────────────────────────────────────────────────────────────────┐
│ ← Peeche                                                        │
│                                                                  │
│       🔊 "Dard kitna hai?"                                       │
│          (How much pain?)                                        │
│                                                                  │
│                                                                  │
│    😊 ─────────── 😐 ─────────── 😣 ─────────── 😭              │
│    Kam              Thoda           Zyada           Bahut         │
│    (Mild)           (Moderate)      (Severe)        (Very Bad)   │
│                                                                  │
│           [ ●═══════════════════════════○ ]                       │
│                    ▲ Drag or Tap                                  │
│                                                                  │
│    ┌──────────────────────────────────────────────────────┐     │
│    │              ✅  Aage (Next)                          │     │
│    └──────────────────────────────────────────────────────┘     │
│                                                                  │
│   ▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░░░ 40%                        │
└──────────────────────────────────────────────────────────────────┘

Design notes:
• Wong-Baker FACES scale — universally understood by children AND adults
• No numbers needed — face expressions communicate severity
• Slider with large drag handle (min 48px diameter)
• OR patient can just tap a face directly
• Audio describes each face as patient slides
```

#### Screen 6: Body Part Selector (Where Does It Hurt?)
```
┌──────────────────────────────────────────────────────────────────┐
│ ← Peeche                                                        │
│                                                                  │
│       🔊 "Dard kahan hai? Body pe tap karein"                    │
│          (Where does it hurt? Tap on the body)                   │
│                                                                  │
│                    ┌──────────┐                                  │
│                    │   😐     │   Head                           │
│                    ├──────────┤                                  │
│                    │  ┌────┐  │   Chest                          │
│                    │  │    │  │                                  │
│                    │  └────┘  │   Stomach                        │
│                    │    ||    │                                  │
│                    │   /  \   │   Legs                           │
│                    │  /    \  │                                  │
│                    └──────────┘                                  │
│                                                                  │
│              (Tappable body outline — regions                    │
│               highlight in blue when touched)                    │
│                                                                  │
│    ┌──────────────────────────────────────────────────────┐     │
│    │              ✅  Aage (Next)                          │     │
│    └──────────────────────────────────────────────────────┘     │
│                                                                  │
│   ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░ 45%                        │
└──────────────────────────────────────────────────────────────────┘

Design notes:
• Simple, clear body outline — NOT an anatomical diagram
• Regions are large tap zones (head, chest, stomach, back, arms, legs)
• Tapped region highlights in blue and gets a ✅
• Multiple regions selectable
• A child literally taps where it hurts — zero abstraction
```

#### Screen 7: Document Scanning
```
┌──────────────────────────────────────────────────────────────────┐
│ ← Peeche                                                        │
│                                                                  │
│       🔊 "Agar aapke paas purane kagaz hain, toh unki           │
│           photo lein. Ya 'Skip' dabayein."                       │
│                                                                  │
│    ┌──────────────────────────────────────────────────────┐     │
│    │                                                      │     │
│    │                                                      │     │
│    │            📷  Camera Preview                        │     │
│    │                                                      │     │
│    │                                                      │     │
│    └──────────────────────────────────────────────────────┘     │
│                                                                  │
│    ┌──────────────────────────────────────────────────────┐     │
│    │         📸  PHOTO LO  (Take Photo)                   │     │
│    └──────────────────────────────────────────────────────┘     │
│                                                                  │
│    Photos taken: 📄 📄 📄 (3)     ┌──────────────┐             │
│                                   │ ✅ Ho Gaya    │             │
│                                   │ (Done)       │             │
│    ┌──────────────────────────┐   └──────────────┘             │
│    │ ⏭ Mere paas kagaz nahi  │                                 │
│    │   (I have no documents)  │                                 │
│    └──────────────────────────┘                                 │
│                                                                  │
│   ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░ 70%                        │
└──────────────────────────────────────────────────────────────────┘

Design notes:
• ONE giant button: "Take Photo"
• Thumbnails of taken photos shown as small cards
• "I have no documents" is prominent — not hidden
• "Done" button appears after at least 1 photo
• Camera auto-detects document edges (green outline overlay)
```

#### Screen 8: Completion / Thank You
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                         ✅                                       │
│                                                                  │
│              🔊 "Bahut accha! Aapka kaam ho gaya!"               │
│                 (Great! You're done!)                             │
│                                                                  │
│              "Aapka token number hai:"                            │
│                                                                  │
│                   ┌──────────┐                                   │
│                   │          │                                   │
│                   │    47    │                                   │
│                   │          │                                   │
│                   └──────────┘                                   │
│                                                                  │
│              "Doctor aapko jaldi bulayenge"                       │
│              (The doctor will call you soon)                      │
│                                                                  │
│              How was it?                                          │
│              😊        😐        😞                              │
│              Easy     Okay      Hard                             │
│                                                                  │
│   ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ 100% ✅                    │
└──────────────────────────────────────────────────────────────────┘

Design notes:
• Celebratory screen — green check, congratulatory audio
• Token number is HUGE and unmissable
• 3-emoji satisfaction rating — zero text required
• Screen auto-resets to language selection after 30 seconds
```

### 5.5 Patient Journey Flow (Simplified)

```
                          ┌──────────┐
                          │ 🌐       │
                          │ Language │
                          └────┬─────┘
                               │
                          ┌────▼─────┐
                          │ 🪪       │
                          │ Login /  │
                          │ Skip     │
                          └────┬─────┘
                               │
                          ┌────▼─────┐
                          │ ✅       │
                          │ Consent  │
                          │ (Audio)  │
                          └────┬─────┘
                               │
              ┌────────────────▼────────────────┐
              │        🗣️ / 👆                   │
              │   Clinical History Interview    │
              │   (Adaptive Voice + Touch)      │
              │                                  │
              │   • Chief Complaint (icons)      │
              │   • Follow-ups (SOCRATES)        │
              │   • Pain scale (faces)           │
              │   • Body part (tap on body)      │
              │   • Past history (icon checklist)│
              │   • Medications (voice/touch)    │
              │   • AYUSH assessment             │
              │     (Dashavidha Pariksha)        │
              └────────────────┬────────────────┘
                               │
                          ┌────▼─────┐
                          │ 📸       │
                          │ Scan     │
                          │ Docs     │
                          │ (or Skip)│
                          └────┬─────┘
                               │
                          ┌────▼─────┐
                          │ 🔊       │
                          │ Audio    │
                          │ Confirm  │
                          │ ✅ / ❌   │
                          └────┬─────┘
                               │
                          ┌────▼─────┐
                          │ 🎫       │
                          │ Token #  │
                          │ Done!    │
                          └────┬─────┘
                               │
                               ▼
                     Pushed to Doctor's Screen
```

### 5.6 Doctor Dashboard UX

The doctor's screen is designed for **glanceability**, not exploration:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🟢 Kamla Devi, 62F │ ABHA: 91-XXXX-XXXX-XXXX │ Token: 47           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ ⚡ CHIEF COMPLAINT                                                     │
│ Right knee pain × 3 months, progressive, worse on stairs               │
│                                                                        │
│ 📋 HPI                                                                 │
│ • Onset: Gradual, 3 months ago                                         │
│ • Character: Dull ache, occasional sharp on movement                   │
│ • Aggravating: Climbing stairs, prolonged standing                      │
│ • Relieving: Rest, warm compress                                       │
│ • Severity: 6/10                                                       │
│ • No swelling, no locking, no giving way                               │
│                                                                        │
│ 🏥 PAST HISTORY                              💊 CURRENT MEDICATIONS   │
│ • Type 2 DM × 8 years                        • Metformin 500mg BD     │
│ • Hypertension × 5 years                     • Amlodipine 5mg OD     │
│ • No surgeries                                • Triphala Churna HS    │
│                                                                        │
│ ⚠️ FLAGGED: HbA1c 9.2% (3 months ago) — uncontrolled                  │
│ ⚠️ FLAGGED: Creatinine 1.8 mg/dL — borderline elevated                │
│                                                                        │
│ 🪷 AYUSH ASSESSMENT (Dashavidha Pariksha)                              │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ Prakriti: Vata-Kapha  │ Agni: Mandagni │ Koshtha: Krura        │   │
│ │ Bala: Madhyama        │ Sara: Asthi (Madhyama)                 │   │
│ │ Ahara: Irregular timing, heavy dinner                          │   │
│ │ Vihara: Sedentary, poor sleep (wakes 2-3x/night)              │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│ 📊 DOCUMENT TIMELINE                                                   │
│ ─── 2026-06 ── HbA1c: 9.2% ⚠️ │ Cr: 1.8 ⚠️ │ FBS: 186 ⚠️          │
│ ─── 2026-03 ── Rx: Metformin ↑500→500 BD                              │
│ ─── 2025-12 ── HbA1c: 8.4% ⚠️ │ Lipid panel: normal                  │
│                                                                        │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│ │ ✅ Accept All  │  │ ✏️ Edit       │  │ ❌ Reject     │                  │
│ └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                        │
│ ⓘ AI-Assisted Draft — Physician Review Required                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Scalability Requirements

### 6.1 Scale Targets

MediKiosk must be designed to scale from **1 hospital pilot → 1,000 hospitals nationwide** without re-architecture.

| Scale Level | Description | Concurrent Users | Daily Sessions | Infrastructure |
| :--- | :--- | :--- | :--- | :--- |
| **Pilot** | 1 hospital (AIIA), 5 kiosks | 5–10 | 500–1,000 | Single server + managed DB |
| **District** | 10–20 hospitals, 50–100 kiosks | 50–100 | 5,000–10,000 | Auto-scaling containers + read replicas |
| **State** | 100+ hospitals, 500+ kiosks | 500–1,000 | 50,000–100,000 | Kubernetes cluster, CDN, regional DB shards |
| **National** | 1,000+ hospitals, 5,000+ kiosks | 5,000–10,000 | 500,000–1,000,000 | Multi-region deployment, global load balancing |

### 6.2 Architecture Decisions for Scalability

| Decision | How It Enables Scale |
| :--- | :--- |
| **Stateless API servers** | Any request can hit any server. Horizontal scaling via load balancer. No sticky sessions. |
| **Redis for session state** | Kiosk session data lives in Redis (not server memory), so sessions survive server restarts and can be served by any API instance |
| **PostgreSQL with JSONB** | FHIR Bundles stored as JSONB — no rigid ORM schema to migrate as clinical requirements evolve. Supports partial indexing on JSONB fields for fast queries at scale |
| **Object storage (S3/MinIO) for documents** | Document images are never in the database. Pre-signed URLs with auto-expiry. Infinite storage scaling. |
| **Adapter pattern for AI services** | Can switch from single Gemini API key → load-balanced pool of API keys → self-hosted models (vLLM) without code changes |
| **Event-driven updates (Redis Pub/Sub → WebSocket)** | Doctor dashboard receives real-time updates without polling. Pub/Sub decouples producers from consumers. |
| **Database connection pooling (PgBouncer)** | Handles 1,000+ concurrent connections without exhausting PostgreSQL's connection limit |
| **Clinical ontology as data, not code** | Adding a new chief complaint, AYUSH question, or language = adding a JSON entry, not a code deploy |
| **Multi-tenancy via hospital_id** | Single codebase serves multiple hospitals. Each hospital's data is logically isolated via `hospital_id` column |

### 6.3 Scaling the AI Pipeline

```
Level 1 (Pilot): Direct API calls
├── Bhashini API → 1 key, rate limited
├── Gemini API → 1 key
└── Good for 500 sessions/day

Level 2 (District): API key pooling + caching
├── 5 Bhashini keys round-robined
├── 3 Gemini keys with request queuing
├── TTS audio cached for common prompts (80% cache hit rate)
└── Good for 10,000 sessions/day

Level 3 (State): Hybrid cloud + self-hosted
├── Self-hosted Whisper (on GPU instances) for ASR — no rate limits
├── Self-hosted vLLM (Llama 3) for summary generation — no API costs
├── Gemini API retained for OCR (hard to self-host vision models)
├── Bhashini for TTS (or self-hosted IndicTTS)
└── Good for 100,000 sessions/day

Level 4 (National): Full self-hosted + edge inference
├── GPU cluster with model serving (TensorRT / Triton)
├── Edge inference on kiosk devices for ASR (reduced latency)
├── Central LLM cluster for summarization
├── CDN-cached TTS for all common prompts in all 12 languages
└── Good for 1,000,000 sessions/day
```

### 6.4 Data Scalability

| Data Type | Volume at National Scale | Strategy |
| :--- | :--- | :--- |
| Clinical sessions | 1M records/day | Partitioned by `created_at` (monthly), archived after 90 days to cold storage |
| Document images | 3–5M images/day (3–5 per session) | Object storage with lifecycle policies: hot (7 days) → warm (30 days) → archive (1 year) → delete |
| FHIR Bundles | 1M bundles/day | Pushed to ABDM and retained for 30 days locally, then purged (ABDM is the source of truth) |
| Audio recordings | None retained | Audio is transcribed in real-time and discarded. Never stored. Privacy-by-design. |
| Analytics / Metrics | Aggregated only | No PHI in analytics. Only anonymized counts, completion rates, language distribution |

### 6.5 Adding New Hospitals (Multi-Tenancy)

```
New hospital onboarding:
1. Admin creates hospital profile (name, departments, ABDM facility ID)
2. Upload hospital logo and configure OPD structure
3. Assign doctor accounts and department mappings
4. Configure kiosk devices (generate device tokens)
5. Done — zero code deployment needed

Data isolation:
• Every row has hospital_id
• API middleware extracts hospital_id from auth token
• All queries automatically scoped to hospital
• Admin dashboard for cross-hospital analytics (aggregated, anonymized)
```

---

## 7. Non-Functional Requirements

| Category | Requirement | Target |
| :--- | :--- | :--- |
| **Performance** | Kiosk screen-to-screen transition | < 300ms (instant feel) |
| **Performance** | ASR response latency | < 2 seconds |
| **Performance** | Document OCR + entity extraction | < 15 seconds per page |
| **Performance** | Full summary generation | < 10 seconds |
| **Scalability** | Concurrent kiosk sessions (Pilot) | 10+ simultaneous |
| **Scalability** | Concurrent kiosk sessions (National) | 10,000+ simultaneous |
| **Scalability** | Daily patient throughput per kiosk | 200+ patients/day |
| **Scalability** | Add new hospital | Config-only, zero code deploy |
| **Scalability** | Add new language | JSON translation file + TTS voice, zero code deploy |
| **Scalability** | Add new chief complaint | JSON entry in clinical ontology, zero code deploy |
| **Availability** | System uptime | 99.5% (hospital operating hours) |
| **Accessibility** | WCAG compliance | AA minimum, AAA for text contrast |
| **Accessibility** | Minimum user age (design benchmark) | 10 years old (5th-grade child) |
| **Accessibility** | Maximum user age | No upper limit — designed for elderly with limited vision/dexterity |
| **Accessibility** | Literacy requirement | Zero — fully operable via pictures + audio alone |
| **Security** | Data encryption at rest | AES-256 |
| **Security** | Data encryption in transit | TLS 1.3 |
| **Security** | Session timeout | Auto-purge after 15 minutes of inactivity |
| **Localization** | Languages at launch | 12 Indian languages |
| **Offline** | Graceful degradation | Touch-only mode works if network drops; queues data for sync |

---

## 8. Out of Scope (Explicit Exclusions)

These are things MediKiosk deliberately **does NOT do**:

1. ❌ **Diagnose patients** — it generates a structured history draft, never a diagnosis
2. ❌ **Prescribe medications** — that is exclusively the physician's role
3. ❌ **Replace the physician consultation** — it enhances and accelerates it
4. ❌ **Store long-term patient records** — it pushes to HIS/ABDM and purges locally
5. ❌ **Perform physical examination** — it captures reported symptoms only (no IoT vitals devices in v1)
6. ❌ **Handle billing, appointments, or OPD registration** — those are HIS functions
7. ❌ **Provide health advice or treatment suggestions to the patient** — zero patient-facing clinical content

---

## 9. Success Metrics

| Metric | Target | Measurement Method |
| :--- | :--- | :--- |
| **5th-grader test pass rate** | 100% of test children complete flow unaided | Usability testing with 5 children aged 10–12 |
| Patient intake completion rate | > 85% of patients who start complete the full flow | Session analytics |
| Average intake time | < 5 minutes (voice) / < 7 minutes (touch-only) | Session timestamps |
| Physician summary read time | < 20 seconds to understand chief complaint + key history | Physician survey |
| Clinical history completeness | > 90% of relevant fields captured vs. manual gold standard | Audit of 50 cases by physician panel |
| Patient satisfaction (ease of use) | > 4.2/5 across all literacy levels | Post-session 3-emoji rating |
| ASR accuracy (Hindi + English) | > 85% word recognition rate | Automated WER testing |
| OCR entity extraction accuracy | > 80% F1 for medications, > 85% for lab values | Annotated test set evaluation |
| Red-flag detection sensitivity | 100% (zero missed critical symptoms) | Clinical validation against known red-flag cases |
| Horizontal scaling test | Handles 10x load increase with < 20% latency increase | Load test with k6 or Locust |
| New hospital onboarding time | < 1 hour (config only, no code deploy) | Timed onboarding drill |
