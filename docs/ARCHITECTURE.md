# MediKiosk release architecture

## One case, three role-specific surfaces

`Patient Console → Supabase PostgreSQL → Doctor Console → Hospital Operations`

The patient creates a server-scoped kiosk session. Clinical writes use that session as the PostgreSQL RLS scope. After submission, the case becomes read-only to patient clinical APIs while remaining visible to authorised doctors. Hospital operations uses aggregate operational views and audit/kiosk telemetry rather than doctor-level clinical detail.

## Trust boundaries

- **Patient browser:** untrusted UI; never supplies an authoritative database identity.
- **Next.js server:** establishes the patient/staff/kiosk transaction scope and performs validation.
- **PostgreSQL/RLS:** final row-isolation boundary for PHI.
- **OCR/extraction:** evidence-generation assistance only; provenance/confidence stay visible and physician verification is separate.
- **Medi:** deterministic reference retrieval plus safety screening; no diagnosis/prescribing.
- **Sarvam:** optional STT/TTS provider; failure leaves text/touch workflow available.
- **ABDM/FHIR:** export preview only. No live ABDM verification/certification is represented.

## Console responsibilities

### Patient
Consent, optional identity, chief complaint/severity, body location, additional symptoms, adaptive history, voice/touch, documents/OCR/extraction, Medi assistance, submission and secure handoff.

### Doctor
Urgent-first queue, complete case bundle, safety review, evidence verification/rejection, exact 10-part Dashavidha, notes, consultation lifecycle and FHIR R4 export.

### Hospital
OPD/pre-consultation operational counts, urgent load, document pipeline, kiosk health, staff workload and audit events. It intentionally does not inherit Doctor-role PHI access.
