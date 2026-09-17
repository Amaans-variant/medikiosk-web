# MediKiosk Product Requirements

## Mission
MediKiosk is an AI-assisted pre-consultation clinical history-taking and medical-document digitization platform, designed to support patient intake and doctor review while preserving clinician authority.

## Core workflow
- Patient kiosk collects structured clinical history before consultation.
- Doctor console reviews patient-entered and AI-assisted evidence.
- Clinical facts preserve provenance and explicit state values.
- Safety logic is deterministic and review-oriented rather than autonomous.

## Must-have product scope
- Pre-consultation history collection
- Voice and touch interaction
- Multilingual patient experience
- Medical document upload and OCR
- Consent, privacy, and secure session handling
- Red-flag escalation and doctor review
- Structured summary with review/edit/verify workflow

## Out of scope for this foundation
- Full production FHIR/ABDM rollout
- Full RAG ingestion and corpus management
- Live Sarvam or Gemini provider integrations
- Production document OCR pipeline
- Real patient authentication and database-backed workflows

## Definition of done for current phase
- project scaffolded with Next.js + TypeScript + Tailwind
- responsive shell proves patient and doctor surfaces
- clinical fact model records state and provenance
- architecture and roadmap documented
- validation tests pass
