# 🔍 Comparative Analysis & Gap Report: MediKiosk Reference Repositories

> **Analyzed Sources:**
> 1. `Amaans-variant/medikiosk-web` (Commit `df4eeabb1c1c0de655bb0b38d659fd829ad140a2`)
> 2. `Amaans-variant/medikiosk-app` (`main` branch)
> 
> **Compared Against:** Our MediKiosk architecture, PRD v2.0, Design System, and current codebase.

---

## 1. Executive Summary

Both reference repositories represent a **single-night, zero-backend client-side prototype** built with React + Vite. 

While they lack real backend persistence, multi-tenancy, and crucially **Ayurvedic clinical reasoning (the core mandate of PS 26047)**, they have several **exceptionally smart presentation techniques for live hackathon judging** that we should adopt immediately.

---

## 2. What the Reference Repositories Did Really Well (Steal & Integrate)

### 🌟 1. The Unified TopBar with Instant Role Switcher (`TopBar.jsx`)
* **What they did:** In `medikiosk-web`, the top header has a pill toggle: `[ Patient Kiosk Mode | Physician Console ]`. 
* **Why it's brilliant for SIH:** During a 3-minute hackathon pitch, judges don't want to see you switch browser tabs between `:3000` and `:3001`. A single top toggle lets the presenter complete an intake as a patient, click "Physician Console", and watch that exact patient appear at the top of the doctor's queue instantly.
* **Our action:** Add a unified mode switcher to our Next.js shell for live demonstration mode.

### 🌟 2. Document Scanning & OCR Extraction Simulation (`DocumentStep.jsx`)
* **What they did:** A simulated camera viewfinder with timed progress messages:
  1. *"Reading document layout..."*
  2. *"Running OCR on handwritten prescription..."*
  3. *"Extracting medications with NER..."*
  4. *"Cross-checking lab reference ranges..."*
* Followed by an interactive display of:
  - Extracted medications table (`Metformin 500mg BD`, `Amlodipine 5mg OD`)
  - Lab values with visual **HIGH / LOW abnormal flags** (`HbA1c 8.4% HIGH`, `Fasting Glucose 162 HIGH`).
* **Our action:** Implement this exact scanning & NER review interface into Step 3 of our patient kiosk flow.

### 🌟 3. Complete Physician Consult & "Amend" Workflow (`ConsultPanel.jsx`)
* **What they did:** The doctor dashboard includes:
  - Structured HPI summary.
  - **"Amend" button**: Allows the doctor to edit the AI-generated draft in place before saving.
  - **"Push to EMR (ABDM)" button**: Updates status to a green `"Pushed to EMR"` badge with toast notification.
* **Our action:** Integrate the inline amendment and FHIR/ABDM push button into our doctor dashboard.

### 🌟 4. Real-time Emergency SOS Button (`TopBar.jsx`)
* **What they did:** Red SOS button in the top right that immediately triggers critical triage.
* **Our action:** Incorporate this directly into our kiosk header for red-flag escalation.

### 🌟 5. Live Queue with Priority Badges (`QueueSidebar.jsx`)
* **What they did:** Patient cards in the queue displaying: Token #, Name, Age/Gender, Wait Time (`waitSince`), Symptom, and colored Priority Pill (`High`, `Medium`, `Low`).

---

## 3. Where the Reference Repositories Fall Short (Our Competitive Edge)

| Evaluation Factor | Reference Repositories (`Amaans-variant`) | Our MediKiosk (`SIH 2026`) |
| :--- | :--- | :--- |
| **Ayurvedic Intake (PS 26047 Core)** | ❌ **Completely missing.** Zero Dashavidha Pariksha, no Prakriti, no Agni assessment. Pure western allopathic only. | ✅ **Core First-Class Feature**: Built-in Dashavidha Pariksha, Prakriti triage, and NAMASTE portal terminology mapping. |
| **Backend & Persistence** | ❌ Purely in-memory React state. Refreshing the browser deletes everything. | ✅ **Real PostgreSQL + Supabase backend** with full FHIR R4 schema and REST API. |
| **Iconography & Design Quality** | ❌ Generic `lucide-react` tech icons with default Tailwind blue. Looks like a generic SaaS template. | ✅ **Custom Medical SVG Iconography**, 5th-grader accessibility, 72px touch targets, Noto Sans Devanagari. |
| **Scalability & Multi-Tenancy** | ❌ Hardcoded for single OPD room, zero multi-tenancy. | ✅ Multi-tenant from Day 1 (`hospital_id` on all tables, scalable from 1 to 1,000 hospitals). |
| **Conversational Voice Engine** | ❌ Text-only simulated chat. | ✅ Integrated Voice Pill (`Bol kar batayein`) designed for Indic speech-to-text (Bhashini). |
| **Pain Assessment** | ❌ Plain numeric scale (1–10). | ✅ **Wong-Baker FACES clinical scale** with custom medical facial illustrations. |

---

## 4. Synthesis & Gap-Filling Plan

To create the ultimate, award-winning solution that combines **their presentation brilliance** with **our superior clinical and architectural depth**, we will incorporate the following into our Next.js app:

1. **Add the Demo TopBar (`components/TopBar.tsx`)**:
   - Segmented toggle: `[ Patient Kiosk | Doctor Console ]`
   - ABDM Online status indicator
   - Emergency SOS triage button
   - Live Token counter
2. **Build the Document OCR Step (`/document`)**:
   - Camera viewfinder simulation
   - Multi-stage OCR analysis progress
   - Extracted Medications table + Flagged Lab Values
3. **Build the Summary & Token Generation Step (`/summary`)**:
   - Printable OPD Token Card (Token number, Department, Room, QR code)
4. **Build the Physician Console (`/doctor`)**:
   - Queue sidebar with live wait times and triage priority
   - Structured HPI view + Dashavidha Pariksha tab
   - One-click "Amend Draft" editor
   - "Approve & Push to ABDM" action
5. **Preserve our superior 5th-Grader-First Design & AYUSH clinical depth**.
