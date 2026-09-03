# MediKiosk — Product Requirements Document

## 1. Product summary
MediKiosk is an AI-driven clinical intake kiosk for high-density outpatient departments (OPDs)
in India. It replaces the paper token + verbal triage queue with a touch-first self-service flow
that verifies identity via ABHA, captures a structured chief complaint, digitizes prior
prescriptions and lab reports, and hands a clean clinical summary straight to the physician's
console — before the patient sits down.

This POC is a **single-night, zero-backend** build: pure client-side React with realistic mock
data. It exists to validate the interaction model and information architecture, not to integrate
with real ABDM, OCR, or hospital EMR systems (see `phases.md`).

## 2. Primary users
- **Patient (or assisting kiosk staff)** — walks up to a shared touch kiosk, completes intake
  unassisted or with light guidance, in English, Hindi, or Tamil.
- **Physician / triage nurse** — works from the Physician Console on a desktop or tablet inside
  the consult room, reviewing the live queue and each patient's structured summary.

## 3. Problem this POC addresses
- OPD queues in high-volume Indian hospitals are paper- and memory-driven: verbal complaint
  capture is slow, inconsistent, and loses information (duration, severity, prior medications)
  before it reaches the physician.
- Prior prescriptions and lab reports are handwritten or on loose paper and are rarely reviewed
  before the consult starts.
- There is no fast, structured bridge between "patient walks in" and "physician has full
  context."

## 4. Goals for this POC
1. Prove a touch-first, bidirectional (forward **and** backward) multi-step intake flow that
   never loses state.
2. Demonstrate a believable simulated OCR/NER pipeline that turns a scanned document into
   structured medications and flagged lab values.
3. Demonstrate a live hand-off: a completed kiosk intake appears instantly in the physician's
   queue with zero manual re-entry.
4. Establish a clinical, accessible, non-generic visual language suitable for kiosk hardware,
   desktop monitors, and tablets.

## 5. Non-goals (explicitly out of scope for this POC)
- Real ABDM / ABHA API integration.
- Real OCR/NER (Tesseract, cloud vision, medical NER models).
- Real speech-to-text (Bhashini or otherwise).
- Persistence beyond the browser session (no backend, no database).
- Multi-kiosk / multi-tenant concurrency, auth, or role-based access control.
- Real FHIR-formatted EMR push.

## 6. User stories

### Patient Kiosk Mode
- As a patient, I can pick my language (English / हिन्दी / தமிழ்) before anything else, so the
  rest of the flow feels native to me.
- As a patient, I can either scan my ABHA QR code or enter my mobile number to identify myself,
  so I don't have to fill out a paper form.
- As a patient, I can select my main symptom from a small set of large, icon-led cards, so I
  don't have to type or describe anything under stress.
- As a patient, once I pick a symptom, I can specify how long it's been going on, how severe it
  feels right now (1–10, with plain-language anchors), and any related symptoms, so my physician
  gets real clinical signal, not just a one-word complaint.
- As a patient, I can scan any prior prescriptions or lab reports I brought, so my physician sees
  my medication history and any abnormal values before I walk in.
- As a patient, I can review everything I entered before I confirm, and go back to fix any step
  without losing what I already filled in elsewhere.
- As a patient, once I confirm, I get a clear token number, my assigned room, and an estimated
  wait time, so I know exactly what happens next.

### Physician Console
- As a physician, I can see a live, ordered queue of waiting patients with token number, name,
  age/gender, wait time, and a primary-complaint badge, so I can triage at a glance.
- As a physician, I can open any patient and see a standardized summary: chief complaint + HPI,
  extracted medications, and flagged lab values with clear high/low indicators.
- As a physician, I can amend the HPI text inline if the patient's self-report needs clinical
  correction, without leaving the console.
- As a physician, I can push a reviewed record to the hospital EMR / ABDM with one action and get
  clear confirmation that the session is cleared.

## 7. UX constraints (binding for this POC)
- **Touch targets:** minimum 48px, most primary actions built at 56px (`h-14`) height, with
  `active:scale-[0.98]` press feedback on every tappable element.
- **Bidirectional navigation:** every kiosk step after the first has a working `< Back` button;
  state is never cleared on back-navigation, only on explicit "Start next patient."
- **No dead ends:** the primary action on each step is disabled (not hidden) until its
  step is valid, so the patient always knows what's missing.
- **Privacy:** no real Aadhaar, ABHA, or mobile numbers are ever rendered — all identifiers are
  masked mock tokens (`91-XXXX-XXXX-1234` style).
- **Visual language:** clinical neutral base (slate/zinc/white), a single accent color
  (clinical emerald `#059669`), no gradient meshes, no glow boxes, no generic SaaS card kit.
- **Performance:** the welcome-screen visual accent (`VitalsPulse`) is pure SVG + CSS animation —
  no canvas, no WebGL, no external assets — so it loads instantly on kiosk-grade hardware.

## 8. Success criteria for this POC
- A reviewer can complete a full kiosk intake (welcome → complaint → documents → summary → token)
  in under 90 seconds without instruction.
- A reviewer can navigate backward from any step and confirm previously entered data is intact.
- A completed intake appears in the Physician Console queue without a page reload.
- A physician can amend and push a record and see confirmation, with the queue reflecting the
  updated status.
