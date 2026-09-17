-- MediKiosk release hardening migration.
-- For a fresh Supabase project, apply db/schema.sql using the controlled owner/admin connection.
-- For an existing project, this migration is intentionally conservative and only creates additive hardening objects.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS staff_login_attempts(email_hash text PRIMARY KEY,attempts integer NOT NULL DEFAULT 0,window_started timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS idx_staff_login_window ON staff_login_attempts(window_started);
CREATE TABLE IF NOT EXISTS patient_identity_status(session_id uuid PRIMARY KEY REFERENCES patient_sessions(id) ON DELETE CASCADE,status text NOT NULL DEFAULT 'NOT_PROVIDED' CHECK(status IN('NOT_PROVIDED','SELF_DECLARED','VERIFIED')),abha_last4 text,abha_address_masked text,verification_source text,verified_at timestamptz,updated_at timestamptz NOT NULL DEFAULT now());
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='patient_sessions') THEN
   BEGIN ALTER TABLE patient_sessions DROP CONSTRAINT IF EXISTS patient_sessions_workflow_step_check; EXCEPTION WHEN undefined_object THEN NULL; END;
   ALTER TABLE patient_sessions ADD CONSTRAINT patient_sessions_workflow_step_check CHECK(workflow_step IN('welcome','language','consent','identity','start','complaint','anatomy','symptoms','interview','documents','complete')) NOT VALID;
 END IF;
END $$;
-- Dashavidha conversion is data-sensitive. Do not reinterpret legacy clinical concepts. db-preflight will require owner-run canonical reconciliation before production.
