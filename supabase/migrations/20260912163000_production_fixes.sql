-- Missing column additions and table creations that were applied to the production DB

ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS ocr_status text,
  ADD COLUMN IF NOT EXISTS received_at timestamptz;

CREATE TABLE IF NOT EXISTS clinical_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES patient_sessions(id) ON DELETE CASCADE,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  fact_extracted text NOT NULL,
  confidence numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS safety_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES patient_sessions(id) ON DELETE CASCADE,
  signal_type text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

-- Also drop the restrictive completed consistency check that prevents cases from closing if missing data
ALTER TABLE patient_sessions DROP CONSTRAINT IF EXISTS patient_sessions_completed_consistency;
