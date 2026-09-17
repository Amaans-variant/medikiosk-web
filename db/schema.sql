-- MediKiosk release-candidate canonical schema (PostgreSQL 14+ / Supabase-hosted Postgres)
-- Idempotent and non-destructive. Production application traffic MUST use the medikiosk_app role.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION app_session_id() RETURNS uuid AS $$ SELECT nullif(current_setting('app.current_session',true),'')::uuid $$ LANGUAGE sql STABLE;
CREATE OR REPLACE FUNCTION app_owner_id() RETURNS uuid AS $$ SELECT nullif(current_setting('app.current_owner',true),'')::uuid $$ LANGUAGE sql STABLE;
CREATE OR REPLACE FUNCTION app_access_role() RETURNS text AS $$ SELECT current_setting('app.access_role',true) $$ LANGUAGE sql STABLE;
CREATE OR REPLACE FUNCTION app_kiosk_id() RETURNS text AS $$ SELECT nullif(current_setting('app.kiosk_id',true),'') $$ LANGUAGE sql STABLE;

CREATE SEQUENCE IF NOT EXISTS medikiosk_case_no_seq START 1;
CREATE TABLE IF NOT EXISTS patient_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_no integer UNIQUE,
  case_id text GENERATED ALWAYS AS ('CASE-'||(1000+case_no)) STORED,
  owner_id uuid NOT NULL,
  idempotency_key text UNIQUE,
  resume_token_hash text UNIQUE,
  resume_expires_at timestamptz NOT NULL DEFAULT(now()+interval '8 hours'),
  last_patient_activity_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK(status IN('ACTIVE','EXPIRED','COMPLETED')),
  case_status text NOT NULL DEFAULT 'NEW' CHECK(case_status IN('NEW','IN_PROGRESS','AWAITING_REVIEW','URGENT_REVIEW','IN_CONSULTATION','COMPLETED','CANCELLED')),
  language text NOT NULL DEFAULT 'en' CHECK(language IN('en','hi','bn','te','ta','mr')),
  consent_status text NOT NULL DEFAULT 'NOT_REVIEWED' CHECK(consent_status IN('NOT_REVIEWED','ACCEPTED','DECLINED')),
  consent_version text, consent_timestamp timestamptz,
  workflow_step text NOT NULL DEFAULT 'welcome' CHECK(workflow_step IN('welcome','language','consent','identity','start','complaint','anatomy','symptoms','interview','documents','complete')),
  complaint_text text, body_region text, body_subregion text, interview_data jsonb,
  demo_flag boolean NOT NULL DEFAULT false,
  cancellation_reason text, summary jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT(now()+interval '30 minutes'), completed_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_sessions_case_id ON patient_sessions(case_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_sessions_resume_token_hash ON patient_sessions(resume_token_hash) WHERE resume_token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_sessions_resume_expiry ON patient_sessions(resume_expires_at);
DROP TRIGGER IF EXISTS trg_patient_sessions_updated ON patient_sessions;
CREATE TRIGGER trg_patient_sessions_updated BEFORE UPDATE ON patient_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP FUNCTION IF EXISTS find_session_by_idempotency(text);
CREATE FUNCTION find_session_by_idempotency(p_key text) RETURNS SETOF patient_sessions LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT * FROM patient_sessions WHERE idempotency_key=p_key LIMIT 1 $$;
REVOKE EXECUTE ON FUNCTION find_session_by_idempotency(text) FROM PUBLIC;

DROP FUNCTION IF EXISTS find_resumable_session(text);
CREATE FUNCTION find_resumable_session(p_hash text) RETURNS SETOF patient_sessions LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT * FROM patient_sessions
 WHERE resume_token_hash=p_hash AND status='ACTIVE' AND case_status IN('NEW','IN_PROGRESS')
   AND resume_expires_at>now()
 LIMIT 1
$$;
REVOKE EXECUTE ON FUNCTION find_resumable_session(text) FROM PUBLIC;

CREATE TABLE IF NOT EXISTS complaints(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES patient_sessions(id) ON DELETE CASCADE,
 position integer NOT NULL, complaint_text text NOT NULL, body_region text, body_subregion text,
 severity text CHECK(severity IN('MILD','MODERATE','SEVERE','VERY_SEVERE')),
 interview_data jsonb, client_mutation_id text, status text NOT NULL DEFAULT 'ACTIVE' CHECK(status IN('ACTIVE','CANCELLED')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(session_id,position)
);
CREATE INDEX IF NOT EXISTS idx_complaints_session ON complaints(session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_complaints_client_mutation ON complaints(session_id,client_mutation_id) WHERE client_mutation_id IS NOT NULL;
DROP TRIGGER IF EXISTS trg_complaints_updated ON complaints;
CREATE TRIGGER trg_complaints_updated BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS patient_identity_status(
 session_id uuid PRIMARY KEY REFERENCES patient_sessions(id) ON DELETE CASCADE,
 status text NOT NULL DEFAULT 'NOT_PROVIDED' CHECK(status IN('NOT_PROVIDED','SELF_DECLARED','VERIFIED')),
 abha_last4 text CHECK(abha_last4 IS NULL OR abha_last4 ~ '^[0-9]{4}$'),
 abha_address_masked text, verification_source text, verified_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_patient_identity_updated ON patient_identity_status;
CREATE TRIGGER trg_patient_identity_updated BEFORE UPDATE ON patient_identity_status FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS documents(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES patient_sessions(id) ON DELETE CASCADE,
 document_type text NOT NULL DEFAULT 'OTHER' CHECK(document_type IN('PRESCRIPTION','LAB_REPORT','IMAGING','DISCHARGE_SUMMARY','VACCINATION','INSURANCE','OTHER')),
 original_filename text NOT NULL, mime_type text NOT NULL, file_size integer, page_count integer, content bytea, content_sha256 text,
 processing_status text NOT NULL DEFAULT 'RECEIVED' CHECK(processing_status IN('RECEIVED','VALIDATING','READY_FOR_OCR','OCR_PROCESSING','OCR_COMPLETE','EXTRACTION_PROCESSING','EXTRACTION_COMPLETE','NEEDS_REVIEW','VERIFIED','FAILED')),
 ocr_status text NOT NULL DEFAULT 'NOT_STARTED' CHECK(ocr_status IN('NOT_STARTED','PENDING','PROCESSING','COMPLETED','FAILED','NOT_CONFIGURED','UNAVAILABLE')),
 extraction_status text NOT NULL DEFAULT 'NOT_STARTED' CHECK(extraction_status IN('NOT_STARTED','PROCESSING','COMPLETED','FAILED','NOT_CONFIGURED','UNAVAILABLE','MALFORMED_RESPONSE')),
 verification_status text NOT NULL DEFAULT 'UNVERIFIED' CHECK(verification_status IN('UNVERIFIED','PENDING_REVIEW','VERIFIED','REJECTED')),
 provenance text NOT NULL DEFAULT 'PATIENT', errors jsonb NOT NULL DEFAULT '[]'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(), received_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_documents_session ON documents(session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_content_hash ON documents(session_id,content_sha256) WHERE content_sha256 IS NOT NULL;
DROP TRIGGER IF EXISTS trg_documents_updated ON documents;
CREATE TRIGGER trg_documents_updated BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS ocr_results(
 id bigserial PRIMARY KEY, document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
 session_id uuid NOT NULL REFERENCES patient_sessions(id) ON DELETE CASCADE, payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ocr_results_document ON ocr_results(document_id);
CREATE TABLE IF NOT EXISTS document_extractions(
 id bigserial PRIMARY KEY, document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
 session_id uuid NOT NULL REFERENCES patient_sessions(id) ON DELETE CASCADE, payload jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clinical_evidence(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES patient_sessions(id) ON DELETE CASCADE,
 document_id uuid REFERENCES documents(id) ON DELETE SET NULL, complaint_id uuid REFERENCES complaints(id) ON DELETE SET NULL,
 category text NOT NULL, normalized_value jsonb NOT NULL DEFAULT '{}'::jsonb, original_wording text, page_number integer,
 confidence numeric CHECK(confidence IS NULL OR (confidence>=0 AND confidence<=1)), extraction_method text NOT NULL DEFAULT 'DETERMINISTIC',
 provenance text NOT NULL DEFAULT 'OCR', provider jsonb, uncertainty_notes text, contradiction_group_id uuid,
 verification_state text NOT NULL DEFAULT 'UNVERIFIED' CHECK(verification_state IN('UNVERIFIED','PENDING_REVIEW','ACCEPTED','VERIFIED','REJECTED')),
 verified_by uuid, verified_at timestamptz, verification_note text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_evidence_session ON clinical_evidence(session_id);
CREATE INDEX IF NOT EXISTS idx_evidence_document ON clinical_evidence(document_id);

CREATE TABLE IF NOT EXISTS safety_signals(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES patient_sessions(id) ON DELETE CASCADE,
 signal_type text NOT NULL, summary text NOT NULL, reason text NOT NULL, evidence_ref text, source text NOT NULL,
 status text NOT NULL DEFAULT 'UNREVIEWED' CHECK(status IN('UNREVIEWED','REVIEWED','ESCALATED','DISMISSED')),
 reviewed_by uuid, reviewed_at timestamptz, review_note text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_signals_session ON safety_signals(session_id);

CREATE TABLE IF NOT EXISTS staff(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE, display_name text NOT NULL, title text,
 role text NOT NULL CHECK(role IN('DOCTOR','HOSPITAL')), password_hash text NOT NULL, active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS staff_sessions(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
 token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_staff_sessions_token ON staff_sessions(token_hash);
CREATE TABLE IF NOT EXISTS staff_login_attempts(
 email_hash text PRIMARY KEY, attempts integer NOT NULL DEFAULT 0, window_started timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_staff_login_window ON staff_login_attempts(window_started);

CREATE TABLE IF NOT EXISTS consultations(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES patient_sessions(id) ON DELETE CASCADE,
 doctor_id uuid NOT NULL REFERENCES staff(id), status text NOT NULL DEFAULT 'IN_PROGRESS' CHECK(status IN('IN_PROGRESS','COMPLETED','CANCELLED')),
 started_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz, note text
);
CREATE INDEX IF NOT EXISTS idx_consultations_session ON consultations(session_id);
CREATE TABLE IF NOT EXISTS doctor_notes(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES patient_sessions(id) ON DELETE CASCADE,
 author_id uuid NOT NULL REFERENCES staff(id), body text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);

-- Exact canonical Dashavidha Atura Pariksha. Missing values remain NOT_ASSESSED; never inferred by AI.
CREATE TABLE IF NOT EXISTS dashavidha_observations(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES patient_sessions(id) ON DELETE CASCADE,
 observation text NOT NULL CHECK(observation IN('prakriti','vikriti','sara','samhanana','pramana','satmya','sattva','ahara_shakti','vyayama_shakti','vaya')),
 value text, state text NOT NULL DEFAULT 'NOT_ASSESSED' CHECK(state IN('NOT_ASSESSED','OBSERVED','NOT_APPLICABLE')),
 provenance text NOT NULL DEFAULT 'DOCTOR' CHECK(provenance='DOCTOR'), recorded_by uuid REFERENCES staff(id), recorded_at timestamptz,
 note text, updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(session_id,observation)
);

CREATE TABLE IF NOT EXISTS kiosk_heartbeats(
 kiosk_id text PRIMARY KEY, label text, last_seen timestamptz NOT NULL DEFAULT now(), active_session_id uuid, last_activity text,
 session_interrupted boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES patient_sessions(id) ON DELETE CASCADE,
 role text NOT NULL CHECK(role IN('PATIENT','ASSISTANT')), content text NOT NULL, intent text, citations jsonb, provider text,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_mutation_role ON chat_messages(session_id,role,client_mutation_id) WHERE client_mutation_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS knowledge_documents(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), corpus text NOT NULL CHECK(corpus IN('AYURVEDA','MODERN_MEDICINE')),
 corpus_version text NOT NULL, title text NOT NULL, source text NOT NULL, author text, section text, year text, license text,
 language text NOT NULL DEFAULT 'en', content text NOT NULL, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, ingested_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS knowledge_chunks(
 id bigserial PRIMARY KEY, document_id uuid NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
 chunk_index integer NOT NULL, heading text, content text NOT NULL,
 search_vector tsvector GENERATED ALWAYS AS(to_tsvector('simple',coalesce(heading,'')||' '||content)) STORED,
 UNIQUE(document_id,chunk_index)
);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_search ON knowledge_chunks USING gin(search_vector);

CREATE TABLE IF NOT EXISTS audit_log(
 id bigserial PRIMARY KEY, actor_type text NOT NULL, actor_id text, action text NOT NULL, target_type text, target_id text,
 detail jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

-- Forced RLS: application code cannot bypass row isolation when connected as the least-privileged app role.
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['patient_sessions','complaints','patient_identity_status','documents','ocr_results','document_extractions','clinical_evidence','safety_signals','chat_messages','staff','staff_sessions','staff_login_attempts','consultations','doctor_notes','dashavidha_observations','kiosk_heartbeats','audit_log'] LOOP EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t); EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',t); END LOOP; END $$;

DROP POLICY IF EXISTS patient_sessions_scope ON patient_sessions;
CREATE POLICY patient_sessions_scope ON patient_sessions USING(id=app_session_id() OR owner_id=app_owner_id() OR app_access_role()='staff') WITH CHECK(id=app_session_id() OR owner_id=app_owner_id() OR app_access_role()='staff');

DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['complaints','patient_identity_status','documents','ocr_results','document_extractions','clinical_evidence','safety_signals','chat_messages'] LOOP
 EXECUTE format('DROP POLICY IF EXISTS session_or_staff ON %I',t);
 EXECUTE format('CREATE POLICY session_or_staff ON %I USING(session_id=app_session_id() OR app_access_role()=''staff'') WITH CHECK(session_id=app_session_id() OR app_access_role()=''staff'')',t);
END LOOP; END $$;

DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['staff','staff_sessions','staff_login_attempts','consultations','doctor_notes','dashavidha_observations','audit_log'] LOOP
 EXECUTE format('DROP POLICY IF EXISTS staff_only ON %I',t);
 EXECUTE format('CREATE POLICY staff_only ON %I USING(app_access_role()=''staff'') WITH CHECK(app_access_role()=''staff'')',t);
END LOOP; END $$;

DROP POLICY IF EXISTS kiosk_heartbeat_scope ON kiosk_heartbeats;
CREATE POLICY kiosk_heartbeat_scope ON kiosk_heartbeats USING(app_access_role()='staff' OR kiosk_id=app_kiosk_id()) WITH CHECK(app_access_role()='staff' OR kiosk_id=app_kiosk_id());

-- Patient workflows also append audit events under their own scoped session.
DROP POLICY IF EXISTS audit_patient_insert ON audit_log;
CREATE POLICY audit_patient_insert ON audit_log FOR INSERT WITH CHECK(actor_type IN('PATIENT','SYSTEM') AND (actor_id=app_session_id()::text OR actor_id IS NULL));

-- Knowledge is curated reference content, not PHI. App role may read it, never write it.
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='medikiosk_app') THEN
   GRANT USAGE ON SCHEMA public TO medikiosk_app;
   REVOKE CREATE ON SCHEMA public FROM PUBLIC;
   GRANT SELECT,INSERT,UPDATE,DELETE ON patient_sessions,complaints,patient_identity_status,documents,ocr_results,document_extractions,clinical_evidence,safety_signals,chat_messages,staff,staff_sessions,staff_login_attempts,consultations,doctor_notes,dashavidha_observations,kiosk_heartbeats,audit_log TO medikiosk_app;
   GRANT SELECT ON knowledge_documents,knowledge_chunks TO medikiosk_app;
   GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO medikiosk_app;
   GRANT EXECUTE ON FUNCTION find_session_by_idempotency(text) TO medikiosk_app;
   GRANT EXECUTE ON FUNCTION find_resumable_session(text) TO medikiosk_app;
 END IF;
END $$;
