# Clinical Architecture

## Safety principles
- The AI does not become the final clinical authority.
- Deterministic safety review is preferred for red flags and escalation logic.
- Clinical facts keep explicit state and provenance metadata.
- Missing information is never treated as a negative fact.
- UNKNOWN or DECLINED responses do not trigger negative branch assumptions.
- AI-generated clinical facts must carry explicit `AI` provenance.

## Fact model
Values should use a constrained set:
- NOT_ASKED
- KNOWN
- UNKNOWN
- DECLINED
- DENIED

Blank complaint text is valid as an explicit state of `NOT_ASKED`; it is never interpreted as a negative fact or as “no complaint.” The complaint question retains its textual prompt and provenance metadata in the patient workflow, and the patient source remains `PATIENT` unless a derived source is explicitly added.

Provenance should use:
- PATIENT
- VOICE
- TOUCH
- OCR
- AI
- DOCTOR
- SYSTEM

## Document and OCR provenance
Medical documents are input artifacts, not confirmed clinical facts. Any candidate fact extracted from OCR or AI normalization must carry `OCR` or `AI` provenance respectively and must remain unverified until the patient or doctor explicitly verifies it. The processing state machine tracks documents through: RECEIVED → READY_FOR_OCR → OCR_PROCESSING → OCR_COMPLETE or FAILED.

Candidate facts from OCR/AI must never silently become `KNOWN` clinical facts without verification. Missing document information must remain missing; never convert missing to "No" or any negative finding.

## OCR review boundary
OCR output is presented as extracted text and candidate information only. The patient and physician verification steps remain separate operations. The system never automatically creates `KNOWN` clinical facts from OCR results. All OCR results carry `OCR` provenance and remain in `UNVERIFIED` state.

Page-level provenance is preserved for every OCR result. Each page result includes:
- `pageNumber`: 1-based page index
- `extractedText`: the text extracted from that page
- `confidence`: optional confidence score when returned by the OCR engine
- `language`: the OCR language used
- `providerMetadata`: provider name, model, and processing timestamp

Handwriting recognition is not claimed. The Tesseract provider returns `supportsHandwriting: false` honestly. If handwriting support is unavailable, the system exposes that state explicitly.

OCR failures are represented with explicit error states (`PROVIDER_UNAVAILABLE`, `PROVIDER_TIMEOUT`, `OCR_FAILED`, `OCR_NOT_CONFIGURED`). Failed jobs can be retried safely without duplicating or corrupting existing results.

## Phase 6C evidence extraction boundary
Structured evidence extraction (`lib/extraction/`) turns OCR page text into candidate evidence items across seven categories: DIAGNOSIS, MEDICATION, INVESTIGATION, PROCEDURE, ALLERGY, MEDICAL_HISTORY, and CHRONOLOGY.

Safety properties (enforced by the engine and routes):
- Every extracted item starts `UNVERIFIED`; only an explicit review action (`ACCEPTED` / `REJECTED` / back to `UNVERIFIED`) changes that state. The system never auto-verifies.
- The deterministic engine extracts only from explicit markers. Diagnosis and medical history are never inferred from symptoms, lab values, or absent text.
- No treatment-recommendation category or rule exists. The AI prompt forbids it and the output schema cannot express it.
- Contradictions (e.g., two doses for the same drug, differing values for the same investigation) are detected and preserved via a shared `contradictionGroupId` plus uncertainty notes. They are surfaced for review, never resolved.
- AI-assisted extraction is optional and fail-closed: absent `GEMINI_API_KEY` → `NOT_CONFIGURED`; malformed output → `MALFORMED_RESPONSE` with no accepted evidence.
- Full provenance is retained per item: verbatim `originalOcrWording`, page number, OCR span, method (`DETERMINISTIC`/`AI`), provider metadata, and uncertainty notes.
- Extraction retry is separated from OCR retry. Retrying extraction never re-runs OCR and never re-verifies existing decisions. The `failureStage` field disambiguates `OCR` from `EXTRACTION` failures: a document whose extraction failed cannot be re-OCRed (409), and vice versa.

Review decisions (Accept/Reject/Reset) are applied through `PATCH /api/patient/documents/[id]/extraction` and persisted in the in-memory repository for the current server process; `document_extractions` on `patient_sessions` is the durable boundary.

## Voice provenance
Voice input is an alternative input modality, not a separate diagnostic system. Voice-derived facts must carry `VOICE` provenance and must never be silently relabeled as `PATIENT` or `AI`. The patient reviews and edits every transcript before it becomes a clinical fact. If the transcript is unclear or confidence is insufficient, the engine preserves `UNKNOWN`, `NOT_ASKED`, or `DECLINED` semantics; it never infers or fabricates symptoms.

## Interview engine
The Phase 4 interview engine provides a deterministic, typed question bank with branching logic.

### Question domains
- presenting_complaint
- past_history
- surgery_history
- medication_history
- allergy_history
- family_history
- personal_social_history
- review_of_systems

### Branching rules
- Surgery yes → surgery follow-up (surgery_details)
- Medication yes → medication details
- Allergy yes → allergen/reaction details
- Tobacco yes → usage follow-up
- Explicit symptom present → relevant follow-up
- UNKNOWN or DECLINED must not trigger a negative branch; the same question is re-presented.

### Answer states
- KNOWN: patient provided a substantive answer
- DENIED: patient explicitly answered "no" or equivalent
- UNKNOWN: patient indicated they do not know
- DECLINED: patient preferred not to answer

### Persistence
Interview facts are stored in `patient_sessions.interview_data` as JSONB. Each fact includes:
- questionId
- value (optional string)
- state (ClinicalAnswerState)
- provenance (ClinicalProvenance)

Facts are persisted through the existing session PATCH API using the `interviewData` field.

## Core workflow
1. patient provides or confirms symptoms
2. system stores fact with provenance
3. deterministic safety rules check red flags
4. doctor reviews summary and verifies facts
5. AI-generated content is labeled as review-required

## Red flag boundary
A red flag is a structured signal, not a diagnosis. It should trigger review, escalation, or re-interview logic but never autonomous treatment.
