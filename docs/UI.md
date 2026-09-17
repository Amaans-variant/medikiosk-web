# MediKiosk UI Foundation

## Phase 4 patient information architecture
- `/patient`: welcome screen and entry point
- `/patient/language`: English, Hindi, Bengali, Telugu, Tamil, and Marathi selection
- `/patient/consent`: explicit consent review
- `/patient/start`: readiness confirmation after accepted consent
- `/patient/complaint`: chief complaint capture with patient-led free text
- `/patient/anatomy`: optional region/subregion selection with an accessible body map
- `/patient/interview`: deterministic clinical history collection with branching questions

The patient experience uses one shared shell, header, progress indicator, and help control. The shell intentionally contains no clinical history fields in Phase 1.

## Language architecture
User-facing strings live in `lib/i18n.ts` under shared translation keys for English, Hindi, Bengali, Telugu, Tamil, and Marathi. Each initial language has a complete onboarding dictionary, including header, progress, help, consent, error, loading, and accessibility copy. English remains the fallback for future additions. The selected language is stored in patient workflow client state and persisted in local storage so navigation does not reset it.

## Consent flow
Consent begins as `NOT_REVIEWED`. Visiting the consent screen never accepts it. Only the explicit `I Agree & Continue` action sets `ACCEPTED` and permits the start screen. The secondary back action returns to language selection without changing consent state; there is no implicit decline or acceptance.

## Responsive strategy
The shell uses a fluid, centered container with readable max-width content, mobile-first spacing, large touch targets, and a single primary action. It is tested at 320px, 390px, 768px, 1024px, and 1440px without horizontal overflow.

## Accessibility
Screens use semantic headings, landmarks, keyboard-reachable buttons and links, visible focus styles, descriptive labels, live status text for language selection, and a help dialog with an accessible name. The complaint input is labeled by the same question text, and the anatomy selector uses button semantics with `aria-pressed` for area activation. Essential meaning is not conveyed by color alone. Motion respects `prefers-reduced-motion`.

The interview page uses:
- Semantic headings for questions
- Role="group" for choice controls
- aria-live="polite" for answer recording status
- Screen-reader-only labels for free-text and numeric inputs
- Disabled states during submission
- Optional microphone and speaker controls for voice interaction
- Accessible status announcements for listening, transcript ready, and speaking states

The documents page uses:
- Semantic file input with accessible label
- File preview showing name, type, and size
- Remove/retry controls before submission
- Accessible error announcements
- Responsive layout for kiosk/tablet/mobile/desktop

## Phase 6B OCR UI patterns
The documents page now includes OCR status and results display:
- Each document shows its current `processingStatus` and `ocrStatus`.
- Documents in `RECEIVED`, `READY_FOR_OCR`, or `FAILED` states show a "Process with OCR" button.
- Documents in `FAILED` state show a "Retry OCR" button that calls the retry endpoint.
- Documents in `OCR_PROCESSING` state show a "Refresh status" button.
- Completed OCR results display page-level provenance with page numbers, extracted text, optional confidence scores, and provider metadata.
- Handwriting detection results are shown honestly. The Tesseract provider does not claim handwriting support, so the UI never labels ordinary OCR output as handwriting-recognized.
- OCR output is presented as candidate information only. The UI never treats OCR text as confirmed clinical facts.
- The six-language architecture is preserved. OCR language selection is explicit and mapped from the selected application language.

## Phase 6C evidence review UI patterns
The documents page now includes structured evidence extraction and review:
- After OCR completes, a "Extract medical information" button runs extraction (POST extraction).
- Extracted items are grouped by category with accessible headings.
- Each item shows its normalized value, the verbatim original OCR wording, source page and optional confidence score, extraction method ("Automated review" / "AI-assisted review"), and verification status.
- Per-item Accept / Reject buttons move an item to `ACCEPTED` / `REJECTED`; a Reset button returns it to `UNVERIFIED`. All actions persist via PATCH.
- Items in a contradiction group are visually marked, and the uncertainty note preserves the conflict rather than resolving it.
- Failed or malformed extraction shows an honest failure message and a "Retry extraction" button (a separate route from OCR retry).
- AI status is shown honestly: when AI-assisted extraction is unavailable, the UI says so rather than claiming AI output exists.
- The UI frames extracted evidence as a doctor-review draft ("Nothing is confirmed automatically"). It never presents OCR/AI output as confirmed clinical facts.

## Voice design decisions
Voice controls are optional and additive. The patient can always use typed or touch input. Voice transcripts are shown for review before acceptance. The UI never mentions STT, TTS, API, provider, or backend. Controls use semantic buttons with accessible names, visible focus, and 44px+ touch targets.

## Design decisions
The visual language is restrained and public-service inspired: navy text, warm white surfaces, neutral borders, and limited indigo, saffron, and green accents. MediKiosk is an original product identity and does not use government marks or implied certifications. The responsive QA script checks all six languages at 320px, 390px, 768px, 1024px, and 1440px for overflow, clipping, language synchronization, and touch target size.
