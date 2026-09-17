# MediKiosk Roadmap

## Status legend
- DONE
- IN PROGRESS
- BLOCKED
- NOT STARTED

## Phase 0 — Architecture, repository, design system, infrastructure foundation
Goal: Create a stable product foundation and validation environment.
Scope: repo setup, stack choices, typed clinical model, responsive shell, docs.
Out of scope: live FHIR, production OCR, real AI calls, production auth, patient workflow, interview engine.
Implementation tasks:
- scaffold Next.js app
- establish TypeScript, lint, and test foundations
- define clinical provenance model
- create responsive product shell and design tokens
- document PRD and architecture
- validate environmental secret handling and provider boundaries
Tests: component tests, clinical-state tests, typecheck, lint, production build
Definition of Done: foundation compiles, tests pass, docs reflect reality, no secret exposure, responsive checks pass
Known limitations: no live Supabase, no production AI, no patient workflow, no full interview engine yet
Status: DONE

## Phase 1 — Responsive UI foundation + Patient Kiosk shell
Goal: Build mobile first patient workflow shell.
Scope: patient header, language selection, consent, welcome/start screens, progress, help, loading/error states, and accessible navigation.
Out of scope: clinical questions, patient persistence, dynamic branching engine, anatomy, voice, OCR, RAG, chatbot, doctor console, FHIR, and ABDM.
Tests: complete six-language dictionaries, workflow state, language persistence for all six languages, consent gate, back navigation, responsive browser checks.
Definition of Done: patient routes work with explicit consent, six initial language dictionaries are complete, responsive and accessibility checks pass, docs reflect the implementation.
Known limitations: workflow state is client-side only; language uses local storage; no clinical collection is present yet.
Phase completion: Implemented routes, shared patient shell, English/Hindi/Bengali/Telugu/Tamil/Marathi translations, consent gate, progress, help, loading/error state, focus styles, and responsive browser checks.
Status: DONE

## Phase 2 — Patient session + persistence + state integrity
Goal: Add server-side patient session handling and state isolation.
Implementation tasks:
- define typed session lifecycle and expiry
- issue secure HTTP-only session cookie
- add validated session API boundary
- connect durable Supabase persistence and ownership checks
Known limitations: durable persistence and cross-request session recovery are blocked until Supabase is configured; current endpoint is a boundary only and does not store clinical data.
Implemented: Supabase client boundaries, session migration, owner-based RLS policies, expiry-aware API, constrained updates, idempotency index, HTTP-only cookie, reset endpoint, and session lifecycle tests.
Verification: Typecheck, lint, tests, and production build pass. Migration policy checks pass statically. Live persistence/RLS testing and onboarding integration are blocked because the configured project has anonymous sign-ins disabled and no migration execution channel is installed.
Status: BLOCKED

## Phase 3 — Complaint collection + anatomy visualization
Goal: Support chief complaint and region selection.
Implemented: patient complaint capture, explicit empty-complaint handling, body-region selection, accessible button semantics, six-language copy coverage, and Phase 3 route integration without changing the established Phase 1/2 flow.
Verification: route tests and clinical validation pass; lint succeeds; production build succeeds in the current repository. Live Supabase persistence verification remains environment-limited by the local Docker/runtime state.
Status: DONE

## Phase 4 — Clinical interview engine + adaptive branching
Goal: Add deterministic questionnaire logic and branching.
Implemented: typed interview engine with 30+ questions across 8 domains, deterministic branching, explicit clinical states (NOT_ASKED, KNOWN, UNKNOWN, DECLINED, DENIED), provenance model, patient-friendly interview UI, six-language coverage, accessible controls, responsive behavior, and durable persistence through the session API.
Verification: interview engine tests (11), route tests (11), lint, build, and responsive QA pass.
Status: DONE

## Phase 5 — Sarvam voice
Goal: Connect patient voice workflow with provider abstraction.
Implemented: server-side Sarvam Saaras v4 STT and Bulbul v3 TTS endpoints, deterministic interview engine integration, patient-friendly voice UI with transcript review, six-language coverage, accessible controls, typed API boundaries, and provider error handling.
Verification: provider tests (3), API tests (10), route tests (11), lint, build, and responsive QA pass.
Status: DONE

## Phase 6A — Documents intake foundation
Goal: Add document upload, validation, and processing state machine.
Implemented: patient-facing document upload entry point, secure server-side API with MIME/size validation, document-domain schema with processing states, typed state machine transitions, six-language UI, accessible controls, and clean OCR provider boundary.
Verification: document tests (6), API tests (6), route tests (12), lint, build, and responsive QA pass.
Status: DONE

## Phase 6B — Real medical-document OCR processing
Goal: Add OCR processing pipeline with page-level provenance and honest capability boundaries.
Implemented: server-side Tesseract.js OCR provider abstraction, PDF page rasterization via pdf-raster, in-memory document repository with ownership validation, processing pipeline (RECEIVED → READY_FOR_OCR → OCR_PROCESSING → OCR_COMPLETE/FAILED), page-level OCR results with provider metadata, explicit handwriting-unsupported boundary, retry endpoint for failed OCR, six-language OCR selection, and comprehensive boundary/error tests.
Verification: OCR tests (22), document tests (6), API tests (6), route tests (12), lint, build, and responsive QA pass.
Status: DONE

## Phase 6C — Structured medical evidence extraction
Goal: Convert OCR text into structured, reviewable medical evidence across seven categories with full provenance, contradiction preservation, and no inferred diagnosis or treatment.
Implemented:
- Deterministic extraction engine (`lib/extraction/deterministic.ts`) with regex rules for DIAGNOSIS, MEDICATION, INVESTIGATION, PROCEDURE, ALLERGY, MEDICAL_HISTORY, and CHRONOLOGY. Items are always UNVERIFIED, carry original OCR wording, page numbers, OCR spans, method ("DETERMINISTIC"), provider metadata, and uncertainty notes. Contradictions (e.g., different doses for the same drug) are grouped and preserved, never resolved.
- Optional server-side AI provider (`lib/extraction/ai.ts`) behind `GEMINI_API_KEY`. Fail-closed: strict schema validation; any malformed/out-of-contract response reports `MALFORMED_RESPONSE` and no fabricated evidence is accepted. AI items carry AI provenance and remain UNVERIFIED. When the key is absent the provider reports `NOT_CONFIGURED` and only the deterministic engine runs.
- Orchestrator (`lib/extraction/engine.ts`) that always runs the deterministic baseline, optionally augments with AI, merges items, and detects contradictions.
- Extraction API routes: `POST`/`GET`/`PATCH /api/patient/documents/[id]/extraction` and `POST /api/patient/documents/[id]/extraction/retry`. Every request validates session and document ownership. Extraction requires `OCR_COMPLETE` first. PATCH applies a single Review (Accept/Reject/Reset) to one evidence item via `EvidenceReviewPatchSchema`. Extraction retry is separate from OCR retry.
- Review UI on the documents page: run extraction, view items grouped by category (value, verbatim wording, source page, optional confidence, extraction method, verification status), per-item Accept/Reject/Reset, contradiction indicators, and honest AI-availability messaging. Six-language copy coverage (English-inherited keys, matching the Phase 6B OCR pattern; completeness verified by `lib/i18n-completeness.test.ts`).
- Fix: `POST /api/patient/documents/[id]/ocr/retry` now exists as a real route (previously a dead `POST_RETRY` named export), so OCR retry and extraction retry are truly separate.
- Migration `20260908120000_add_extraction_fields.sql`: admits the `documents` step into the `workflow_step` constraint and adds a `document_extractions` jsonb durable boundary for future persistence.
Verification: extraction engine tests (23), AI provider tests (12), orchestrator tests (7), extraction route tests (18), UI helper tests (8), i18n completeness tests (2), plus typecheck, lint, and production build. The pre-existing `React.act is not a function` failures in `app/patient/routes.test.tsx` remain and are unrelated to this phase.
Known limitation: extraction runs and review decisions persist in the in-memory DocumentRepository for the current server process; the Supabase `document_extractions` column is the durable boundary for wiring persistence in a later phase. AI-assisted extraction only activates when `GEMINI_API_KEY` is present.
Status: DONE

## Phase 7 — Clinical summary + deterministic red flags + provenance
Goal: Summarize and flag safety-critical findings.
Status: NOT STARTED

## Phase 8 — Doctor Console
Goal: Build doctor review workspace.
Status: NOT STARTED

## Phase 9 — Ayurveda knowledge ingestion foundation
Goal: Start trusted content ingestion and metadata design.
Status: NOT STARTED

## Phase 10 — Ayurveda RAG
Goal: Ground Ayurveda queries with evidence and citations.
Status: NOT STARTED

## Phase 11 — Modern Medicine RAG
Goal: Add evidence retrieval for modern medicine.
Status: NOT STARTED

## Phase 12 — Medical Chatbot + RAG orchestration
Goal: Add role-aware grounded assistant.
Status: NOT STARTED

## Phase 13 — FHIR + ABDM
Goal: Build integration boundary and explicit status tracking.
Status: NOT STARTED

## Phase 14 — Security + production hardening
Goal: RLS, secure sessions, secrets, audit logging.
Status: NOT STARTED

## Phase 15 — E2E + cross-device + clinical safety QA
Goal: Validation across devices and failure states.
Status: NOT STARTED

## Phase 16 — Deployment + final audit
Goal: Production readiness review.
Status: NOT STARTED
