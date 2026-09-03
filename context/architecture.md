# MediKiosk — Architecture

## 1. Stack
- **React 18** (function components + hooks only, no class components)
- **Vite** for dev server / build
- **Tailwind CSS 3** for styling, with a project-specific token set in `tailwind.config.js`
  (colors: `canvas`, `surface`, `ink`, `line`, `clinic`, `signal`, `alert`, `caution`)
- **lucide-react** for all iconography
- No router — the app has exactly two top-level views toggled by state, not by URL. No backend,
  no persistence layer, no auth.

## 2. Component hierarchy

```
App
└─ KioskStoreProvider              (src/store/useKioskStore.jsx)
   └─ Shell
      ├─ TopBar                    (src/components/TopBar.jsx)
      │   - role switcher (kiosk / physician)
      │   - ABDM online indicator, language chip, SOS button
      │
      ├─ KioskFlow                 (rendered when activeView === 'kiosk')
      │   ├─ Stepper                (shared/Stepper.jsx)
      │   └─ [active step]
      │       ├─ WelcomeStep        (kiosk/WelcomeStep.jsx)
      │       │   ├─ VitalsPulse     (shared/VitalsPulse.jsx)
      │       │   └─ QRScanModal     (shared/QRScanModal.jsx, conditional)
      │       ├─ ComplaintStep      (kiosk/ComplaintStep.jsx)
      │       ├─ DocumentStep       (kiosk/DocumentStep.jsx)
      │       └─ SummaryStep        (kiosk/SummaryStep.jsx)
      │
      └─ PhysicianConsole          (rendered when activeView === 'physician')
          ├─ QueueSidebar           (physician/QueueSidebar.jsx)
          └─ ConsultPanel           (physician/ConsultPanel.jsx)
```

`KioskFlow` is a thin orchestrator: it reads `kioskStepIndex` from the store, maps it to one of
the four step components via a lookup object, and renders the shared `Stepper` above it. Each
step component is fully self-contained — it reads only the slice of store state it needs and
calls store actions directly; there is no prop-drilling of state between steps.

## 3. State management

A single store, `useKioskStore`, implemented as **React Context + `useReducer`**
(`src/store/useKioskStore.jsx`). This is the one decoupled source of truth for the whole app —
both modules (kiosk and physician) read and write the same store, which is what makes the
kiosk → queue → consult hand-off work without prop drilling or a backend.

### State shape

```js
{
  activeView: 'kiosk' | 'physician',
  language: 'en' | 'hi' | 'ta',
  networkOnline: true,               // simulated ABDM connectivity indicator

  kioskStepIndex: 0,                 // 0..3, maps to KIOSK_STEPS
  patient: null,                     // { name, age, gender, abhaId, mobile } | null
  complaint: {
    symptomId: null,
    duration: null,                  // 'Hours' | 'Days' | 'Weeks'
    severity: 5,                     // 1..10
    associated: [],                  // string[]
  },
  documents: {
    status: 'idle',                  // 'idle' | 'scanning' | 'done'
    medications: [],
    labValues: [],
    sourceDoc: null,
  },
  lastToken: null,                   // { token, room, waitMinutes } | null

  queue: [ ...patientRecord ],       // seeded with one mock in-progress patient
  selectedPatientId: string | null,  // which queue entry the physician console shows
}
```

### Actions (dispatched via typed action creators exposed from the hook)
`setView`, `setLanguage`, `goToStep`, `nextStep`, `prevStep`, `setPatient`,
`setComplaintField`, `toggleAssociatedSymptom`, `setDocumentsStatus`, `setDocumentsResult`,
`dispatchToken`, `resetKiosk`, `selectQueuePatient`, `amendRecord`, `pushToEmr`,
`removeFromQueue`.

### Lifecycle of a single patient through state
1. `WelcomeStep` calls `setPatient(profile)` after QR auto-resolve or mobile "verification."
2. `ComplaintStep` calls `setComplaintField` / `toggleAssociatedSymptom` as the patient answers;
   `complaint` accumulates across the step.
3. `DocumentStep` calls `setDocumentsStatus('scanning')` then, after the simulated OCR delay,
   `setDocumentsResult(...)` with the mock extraction payload.
4. `SummaryStep` reads `patient`, `complaint`, and `documents` to render the review screen. On
   confirm, it calls `dispatchToken(patientRecord)`, which:
   - sets `lastToken` (drives the confirmation screen), and
   - appends a fully-formed patient record to `queue` — this is the exact moment the patient
     becomes visible in the Physician Console.
5. `resetKiosk()` clears everything **except** `queue` and `activeView`/`language`, so the next
   patient starts clean while the physician's queue is untouched.

### Backward navigation guarantee
`prevStep` only decrements `kioskStepIndex` — it never touches `patient`, `complaint`, or
`documents`. This is what satisfies the "true bidirectional navigation" requirement: every field
a patient filled in is still there if they step back to correct an earlier answer.

## 4. Data flow: kiosk → physician console
There is no event bus or subscription model needed — because both views subscribe to the same
Context, appending to `queue` in the reducer is immediately reflected in `QueueSidebar` on next
render. `ConsultPanel` derives its displayed patient via
`state.queue.find(p => p.id === state.selectedPatientId)`, so `amendRecord` and `pushToEmr`
mutate the same array the sidebar reads from — no separate "consult" state.

## 5. Mock data & simulation boundaries (`src/data/mockData.js`)
- `LANGUAGES`, `SYMPTOMS`, `DURATION_OPTIONS`, `SEVERITY_ANCHORS`, `ASSOCIATED_SYMPTOMS` —
  static content driving Steps 1–2.
- `MOCK_OCR_RESULT` — the single fixed payload returned by the simulated document scan
  (`DocumentStep`), representing "detected medications" + "flagged lab values."
- `randomMockPatient()` — generates a plausible mock identity with a masked ABHA ID; used by
  both the QR-scan and mobile-number verification paths.
- `INITIAL_QUEUE` — one seeded in-progress patient so the Physician Console is never empty on
  first load.

## 6. Future API integration points (Phase 2+)
These are the exact seams where real integrations replace simulation, with no structural
rework required elsewhere:

| Simulated today | Lives in | Real integration point (Phase 2/3) |
|---|---|---|
| `QRScanModal` auto-resolve timer + `randomMockPatient()` | `shared/QRScanModal.jsx` | ABDM ABHA QR/OTP verification API |
| Mobile "Verify & Continue" timeout | `kiosk/WelcomeStep.jsx` | Hospital HIS patient lookup / OTP service |
| `MOCK_OCR_RESULT` returned after a fixed delay | `kiosk/DocumentStep.jsx` | Real OCR (e.g. Google Vision / Textract) + medical NER model, called from a new `services/ocr.js` |
| Static `LANGUAGES` list, no live translation | `TopBar`, `WelcomeStep` | Bhashini speech-to-text + translation API for voice-driven intake |
| `dispatchToken` writing to local reducer state | `store/useKioskStore.jsx` | Real-time backend (WebSocket/Firestore) so multiple kiosks and consoles share one queue |
| `pushToEmr` flipping a local `status` flag | `physician/ConsultPanel.jsx` | FHIR-formatted bundle POST to hospital EMR / ABDM Health Information Provider API |

The intent is that swapping any one of these requires changes only inside the listed file(s) —
the store's action names and shapes (`setPatient`, `setDocumentsResult`, `dispatchToken`,
`pushToEmr`) are already what a real integration would call.
