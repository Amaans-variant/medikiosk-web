# production readiness scope

Implemented code-owned scope: patient kiosk, Medi assistant voice/text, doctor review, hospital operations, Supabase/PostgreSQL persistence, forced RLS design, 10-part Dashavidha, optional ABHA capture, document/OCR pipeline hooks, clinical evidence provenance, deterministic safety signals, FHIR preview, audit and accessibility/security hardening.

External validation still required before claiming a production hospital deployment: target Supabase migration/preflight, real provider keys, live OCR/STT/TTS tests, full browser matrix, deployment smoke and legal/compliance review.
