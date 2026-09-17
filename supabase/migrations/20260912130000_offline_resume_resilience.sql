-- MediKiosk offline/resume resilience hardening. Safe to apply after canonical schema.
BEGIN;
ALTER TABLE patient_sessions ADD COLUMN IF NOT EXISTS resume_token_hash text;
ALTER TABLE patient_sessions ADD COLUMN IF NOT EXISTS resume_expires_at timestamptz NOT NULL DEFAULT(now()+interval '8 hours');
ALTER TABLE patient_sessions ADD COLUMN IF NOT EXISTS last_patient_activity_at timestamptz NOT NULL DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_sessions_resume_token_hash ON patient_sessions(resume_token_hash) WHERE resume_token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_sessions_resume_expiry ON patient_sessions(resume_expires_at);

ALTER TABLE complaints ADD COLUMN IF NOT EXISTS client_mutation_id text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_complaints_client_mutation ON complaints(session_id,client_mutation_id) WHERE client_mutation_id IS NOT NULL;

ALTER TABLE documents ADD COLUMN IF NOT EXISTS content_sha256 text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_content_hash ON documents(session_id,content_sha256) WHERE content_sha256 IS NOT NULL;

ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS client_mutation_id text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_mutation_role ON chat_messages(session_id,role,client_mutation_id) WHERE client_mutation_id IS NOT NULL;

DROP FUNCTION IF EXISTS find_resumable_session(text);
CREATE FUNCTION find_resumable_session(p_hash text) RETURNS SETOF patient_sessions
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT * FROM patient_sessions
 WHERE resume_token_hash=p_hash AND status='ACTIVE' AND case_status IN('NEW','IN_PROGRESS')
   AND resume_expires_at>now()
 LIMIT 1
$$;
REVOKE EXECUTE ON FUNCTION find_resumable_session(text) FROM PUBLIC;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='medikiosk_app') THEN
   GRANT EXECUTE ON FUNCTION find_resumable_session(text) TO medikiosk_app;
 END IF;
END $$;
COMMIT;
