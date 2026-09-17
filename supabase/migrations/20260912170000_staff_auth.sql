-- Fix for missing staff tables
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  title text,
  role text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff_sessions (
  token_hash text PRIMARY KEY,
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff_login_attempts (
  email_hash text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 1,
  window_started timestamptz NOT NULL DEFAULT now()
);

-- Demo seed for staff
INSERT INTO staff (email, display_name, title, role, password_hash)
VALUES 
  ('doctor@demo.com', 'Dr. Demo', 'Senior Physician', 'DOCTOR', 'scrypt:e7f...'),
  ('hospital@demo.com', 'Admin Demo', 'Administrator', 'HOSPITAL', 'scrypt:e7f...')
ON CONFLICT (email) DO NOTHING;
