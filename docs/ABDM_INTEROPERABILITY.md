# ABDM / ABHA / FHIR boundary

This build intentionally separates *interoperability readiness* from *live ABDM integration*.

- ABHA capture is optional and never gates care.
- Self-declared ABHA is `SELF_DECLARED`; it is not verification.
- Full self-declared ABHA number/address is not retained in application tables; only last-four/masked hints are retained.
- FHIR export is R4 document Bundle output for authenticated doctors.
- Live HIE-CM exchange, production ABHA verification, facility/practitioner registry binding, consent-manager callbacks and official profile validation require external ABDM sandbox/production credentials and are not fabricated here.
