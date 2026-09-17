# Patient Console — New UI Retest Report

**Retest date:** 2026-09-12
**Scope:** Patient Console after approved green reference-UI redesign.

## Executive result

**SOURCE-LOCAL RESULT: PASS**

- Patient-focused regression: **67/67 passed**
- Full project regression: **77/77 passed**
- Quality/security gate: **53/53 passed**
- Full TypeScript/TSX syntax/transpile sweep: **passed**
- Local import resolution: **passed**
- Secret-pattern scan: **passed**
- Government-affiliation guard: **passed**

No code regression was found in the executable source-local tests after the new Patient UI was applied.

## Patient journey verified

The new UI contract verifies the intended route/experience:

1. Welcome + six-language selection
2. Consent / privacy-first disclosure
3. Optional ABHA with privacy-minimized handling
4. Chief complaint with large voice interaction and Medi helper
5. Severity + affected body area combined screen
6. Other symptoms / quick selections
7. Medi-guided adaptive interview
8. Document upload / OCR / extraction states
9. Completion / next steps / new-patient handoff

## UI/reference checks passed

- Branded Welcome + Language screen
- Privacy-first consent structure
- ABHA clearly optional
- Large complaint microphone interaction
- Severity and body-area combined like approved reference
- Quick symptom choices
- Visual document drop zone and processing cards
- Female Medi assistant identity
- Successful-submission completion state
- Phone/tablet/laptop responsive-contract coverage
- Prominent patient progress + assistant entry point

## Resilience/data-loss checks passed

- Encrypted IndexedDB recovery; no plaintext localStorage PHI
- Non-extractable WebCrypto key
- Text draft survives reload/recovery
- Full ABHA values excluded from offline cache
- File/blob/document binaries excluded from offline cache
- Ordered reconnect replay
- Idempotent complaint replay
- Queue capacity fails closed rather than dropping patient work
- Expired local PHI physically removed
- Submission purges local recovery state
- New Patient reset is fail-closed offline
- Older offline mutations flush before newer online writes
- Upload retry deduplication after response loss
- Medi chat retry deduplication after response loss

## Clinical/privacy checks passed

- UNKNOWN is not converted to NO
- Exact canonical ten Dashavidha concepts remain intact
- ABHA self-declared identifier remains minimized
- Completion blocks in-flight documents
- Completion remains idempotent
- Hospital operations does not receive chief-complaint PHI
- Doctor clinical queue remains doctor-only
- Kiosk heartbeat authentication remains production fail-closed

## Responsive checks covered by contracts

The source-level responsive suite confirms rules for phone/tablet/laptop layouts, including:

- 320–414 px phone support
- 768 px tablet support
- 1024+ px laptop/desktop layout
- no required horizontal layout dependency for Patient reference screens
- safe-area support
- reduced-motion support
- mobile-safe inputs/composer

## Browser QA status

**NOT EXECUTED IN THIS SANDBOX.**

The real Playwright responsive and accessibility scripts were invoked, but Node stopped before browser launch because `playwright` is not installed in this execution environment (`ERR_MODULE_NOT_FOUND`). This is an environment limitation, not a Patient Console test failure.

Before final GitHub/Vercel release, run after `npm ci`:

```bash
npm run qa:responsive
npm run qa:accessibility
npm run test:e2e
```

Required visual sign-off should include at least:

- 320x568
- 360x800
- 390x844
- 414x896
- 768x1024
- 1024x768
- 1366x768
- 1440x900

Compare the Patient Console visually against `docs/reference/patient-console-approved-reference.png`.

## Final retest verdict

**The new Patient Console passes every source-local and automated contract test that can run in this sandbox. No new code defect was found during this retest.**

The remaining release gate is real-browser visual/accessibility/E2E execution with installed npm dependencies and the live Supabase/Sarvam environment.
