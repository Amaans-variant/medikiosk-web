# MediKiosk — OPD Clinical Intake POC

A single-night, zero-backend proof of concept for an AI-driven clinical intake kiosk for
high-density Indian OPDs. Pure client-side simulation — no server, no real PII.

## Stack
- React 18 + Vite
- Tailwind CSS (custom clinical design tokens — see `tailwind.config.js`)
- lucide-react for iconography
- State: a single decoupled store (`useKioskStore`) via React Context + `useReducer`

## Setup

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`). Use the segmented control in the
top bar to switch between **Patient Kiosk Mode** and **Physician Console** — they share the same
live store, so completing a kiosk intake immediately appears in the console's queue.

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build
```

## File structure

```
src/
  App.jsx                        Root shell: provider + top bar + active module
  index.css                      Tailwind layers + base resets
  store/
    useKioskStore.jsx            Context + reducer: single source of truth
  data/
    mockData.js                  Symptoms, languages, mock OCR result, seed queue
  components/
    TopBar.jsx                   Role switcher, ABDM status, language, SOS
    shared/
      Stepper.jsx                 Bidirectional step header used by the kiosk flow
      VitalsPulse.jsx              Lightweight SVG ECG-style accent (welcome screen)
      QRScanModal.jsx               Simulated ABHA QR viewfinder (auto-resolves ~1.5s)
    kiosk/
      KioskFlow.jsx                Orchestrates the 4-step flow + back navigation
      WelcomeStep.jsx               Step 1 — language + QR / mobile identification
      ComplaintStep.jsx             Step 2 — symptom grid + adaptive follow-up
      DocumentStep.jsx              Step 3 — scan simulation + OCR/NER extraction
      SummaryStep.jsx               Step 4 — review, confirm, token dispatch
    physician/
      PhysicianConsole.jsx          Queue + consult panel + push-to-EMR toast
      QueueSidebar.jsx               Live ordered patient queue
      ConsultPanel.jsx                HPI, meds, flagged labs, amend, push to EMR
```

## Notes on the simulation
- No real ABHA numbers, Aadhaar, or phone numbers are ever generated — all identifiers are
  formatted mock tokens (e.g. `91-XXXX-XXXX-1234`).
- The kiosk flow and physician console read/write the same in-memory store, so this is a true
  single-page demo of the intake → queue → consult loop, not two disconnected screens.
- Every kiosk step preserves prior answers when navigating backward — nothing resets except an
  explicit "Start next patient" after a token is issued.
