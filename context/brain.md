# MediKiosk — Brain (operational memory)

_Last updated: end of MVP build, single session. Read this first in any future session before
touching code._

## 1. Current operational state
- The MVP described in `phases.md` (Phase 0) is **fully built and complete** as static source
  code. It has **not been run through `npm install` / `npm run dev`** in this environment — the
  build/dev sandbox this was written in has no network access, so no npm registry, no live
  browser preview, no lint/build verification was possible. Treat the code as carefully
  hand-reviewed but **not machine-verified**. First task in any follow-up session with network
  access: `npm install && npm run dev`, click through all four kiosk steps and both console
  panes, and fix anything that surfaces.
- No backend exists. No environment variables, no `.env`, no API keys are referenced anywhere in
  the code — this is intentional for the POC and should stay that way until Phase 2 begins.
- Only one seeded patient (`INITIAL_QUEUE` in `mockData.js`) exists in the queue on cold load;
  everything else is generated at runtime by walking the kiosk flow.

## 2. Strict architecture rules — do not violate these in future changes
1. **One store, no exceptions.** All cross-view state (patient, complaint, documents, queue)
   lives in `useKioskStore.jsx`. Do not introduce a second Context, a second reducer, or prop-drill
   state that the store already owns. If a new feature needs state shared between kiosk and
   physician views, it goes in this store.
2. **Steps never reach into each other.** `WelcomeStep`, `ComplaintStep`, `DocumentStep`,
   `SummaryStep` only read/write the store — they must never import or call each other directly.
   `KioskFlow` is the only place that knows the step order.
3. **Back navigation must never clear data.** `prevStep` / `PREV_STEP` touches only
   `kioskStepIndex`. Any new action that resets patient/complaint/documents state must be named
   and gated explicitly (like `RESET_KIOSK`) — never make it implicit in navigation.
4. **No real identifiers, ever.** Any new mock-data generator must keep ABHA/mobile numbers in
   masked format (`91-XXXX-XXXX-####` style). This is a hard product requirement, not a style
   preference — do not "improve realism" by generating full numbers.
5. **Single accent color discipline.** `clinic` (emerald) is the only interactive/brand accent.
   `signal` (cyan) is reserved for system/network state only. `alert` (rose) and `caution`
   (amber) are reserved for clinical flags (high/low lab values, SOS) — never use them
   decoratively. Do not add a second "hero" accent color to chase visual novelty.
6. **Touch target floor.** Every new tappable element must be at least 48px tall (`h-12`) with
   `tap` utility (`active:scale-[0.98]`) applied. Default to `h-14` for primary actions to match
   the rest of the flow.
7. **No heavy front-page assets.** The welcome screen accent (`VitalsPulse`) must remain pure
   SVG/CSS. Do not swap it for a canvas particle system, a 3D scene, or an external image/video
   without confirming performance on actual kiosk-grade hardware first.
8. **lucide-react icon names must be verified before use** — several plausible names (e.g.
   `PillBottle`) do not exist in the installed version; `Pill` does. When adding new icons,
   confirm against the installed `lucide-react` version before assuming a name works.

## 3. Known simplifications intentionally left in the MVP
- `tokenCounter` in `SummaryStep.jsx` is a module-level `let` starting at 42 — resets on full
  page reload. Fine for a single-session demo; would need to move into the store (or a backend
  sequence) for anything longer-lived.
- Room/department assignment is a static per-symptom lookup in `mockData.js` (`SYMPTOMS[].room`)
  — there is no capacity awareness or physician availability logic.
- `QueueSidebar`'s minute counter re-renders via a 30s `setInterval` per row; fine at demo scale
  (single digits of patients), would need windowing/virtualization at real OPD queue volumes.
- The document scanner always returns the same fixed `MOCK_OCR_RESULT` regardless of what (if
  anything) is "scanned" — there is no actual file input or camera access.
- `networkOnline` exists in store state but is not currently toggled by any UI — it's a seam for
  Phase 3 offline-mode work, not a live feature yet.

## 4. Immediate next engineering tasks (in priority order)
1. Run the app for the first time (`npm install && npm run dev`) and fix any real build errors —
   this codebase has not been executed yet.
2. Add basic responsive QA pass on an actual tablet-width viewport (768px) — the grid/flex
   breakpoints were written for desktop-and-mobile but not visually verified at tablet width.
3. Add a lightweight automated check (even just React Testing Library smoke tests) for: back
   navigation preserving state, and kiosk-completion correctly appending to physician queue —
   these two behaviors are the core value proof of the POC and should not silently regress.
4. Decide on and implement the Phase 2 OCR integration seam (`services/ocr.js`) before adding
   any more mock-data complexity to `DocumentStep`.
5. Revisit `tokenCounter` and move it into the store once multi-session persistence is in scope.

## 5. Where to look for what
- Changing flow order or adding a step → `store/useKioskStore.jsx` (`KIOSK_STEPS`) +
  `components/kiosk/KioskFlow.jsx`.
- Changing design tokens (colors, radii, motion) → `tailwind.config.js`, then apply consistently
  across components — do not hardcode one-off hex values in a component.
- Changing mock clinical content (symptoms, meds, labs, languages) → `data/mockData.js` only.
- Changing what the physician sees per patient → `components/physician/ConsultPanel.jsx` reads
  directly off the `queue` entry shape defined in `store/useKioskStore.jsx`'s `DISPATCH_TOKEN`
  action — keep those two in sync if the patient record shape changes.
