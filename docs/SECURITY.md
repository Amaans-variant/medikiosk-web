# Security Baseline

## Secret handling
- Use .env.local for local secrets only.
- Never commit API keys.
- Keep Gemini, Sarvam, and Supabase secret values on the server side.
- Never expose secrets to the browser bundle.

## Session isolation
- Patient sessions must have unique identifiers.
- Server-side state is the trusted source of truth.
- No global singleton patient state.
- Session reset and invalidation must be supported.

## Database boundary
- Supabase PostgreSQL is the intended persistence layer.
- RLS is mandatory for all sensitive data.
- Access must be role-aware and ownership-aware.
- `patient_sessions` uses forced RLS with owner-based select, insert, and update policies.
- No policy uses unrestricted `USING (true)` access.

## Phase 6A document security
- Document uploads are validated server-side via magic bytes, not just client-provided MIME type.
- Maximum file size is 20MB.
- Supported formats are restricted to PDF and common image types.
- No permanent object storage is introduced in Phase 6A.
- Raw document bytes are processed in memory and not written to disk.
- Document records contain only metadata; no document content is logged.
- Session ownership/access control follows the existing Phase 2 boundary.

## Phase 6B OCR security
- OCR processing runs entirely server-side. No OCR provider is called from the browser.
- Raw uploaded document bytes are stored in server-side memory (in-memory repository) for the development stage. They are never written to disk or committed to version control.
- OCR results carry `OCR` provenance and remain unverified. No automatic clinical fact creation occurs.
- The OCR API routes validate session ownership and document ownership on every request using the authenticated Supabase identity.
- Tesseract.js is selected because it requires no external API key. No provider secrets are needed or exposed.
- If an OCR provider is unavailable or not configured, the system returns explicit `NOT_CONFIGURED` or `UNAVAILABLE` states rather than fabricating results.
- Document buffers are lost on server restart. This is acceptable for the development stage but must be replaced by durable storage before production.

## Phase 5 voice security
- `SARVAM_API_KEY` is read from the server environment and never sent to the browser.
- Voice API routes (`POST /api/voice/transcribe`, `POST /api/voice/speak`) validate all payloads before forwarding to Sarvam.
- Raw patient audio is processed in memory and never written to disk or committed to the repository.
- Voice transcripts are stored as clinical facts with `VOICE` provenance; they are not treated as `PATIENT` or `AI` facts.
- Browser-native speech synthesis is not used as a fallback; all speech goes through the server-side Sarvam boundary.

## Phase 2 session security
- Browser code can use only the publishable Supabase key.
- `SUPABASE_SECRET_KEY` is isolated in `lib/supabase/admin.ts` behind `server-only` and is not imported by patient components.
- Session IDs are stored in an HTTP-only cookie and are not sufficient without the authenticated Supabase identity.
- The database unique idempotency index prevents duplicate session creation for the same owner and retry key.
- Expiry is enforced by the server, not by a client timer.

## Current verification limitation
The configured Supabase Auth endpoint is reachable, but anonymous sign-ins are disabled in the project. The migration has static policy validation, but live migration and RLS integration tests cannot be claimed until a database migration channel and patient authentication mode are configured.

## Data minimization
- Log only what is needed for operational debugging.
- Never log full medical documents or unnecessary PHI.
- Strip or redact sensitive payloads before external logging.
