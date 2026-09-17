import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const c = await pool.connect();
try {
  await c.query("BEGIN");
  await c.query("SELECT set_config('app.access_role','staff',true)");
  
  const sessions = await c.query(
    `SELECT id, case_id, case_status, created_at, completed_at, complaint_text FROM patient_sessions ORDER BY created_at DESC LIMIT 20`
  );
  const staff = await c.query(`SELECT id, email, display_name, role, active FROM staff`);
  const queueQuery = await c.query(`SELECT s.id AS session_id,s.case_id,s.case_status,s.language,s.created_at,s.completed_at,coalesce((SELECT complaint_text FROM complaints WHERE session_id=s.id AND status='ACTIVE' ORDER BY position LIMIT 1),s.complaint_text) AS primary_complaint,(SELECT count(*)::int FROM complaints WHERE session_id=s.id AND status='ACTIVE') AS complaint_count,(SELECT severity FROM complaints WHERE session_id=s.id AND severity IS NOT NULL ORDER BY CASE severity WHEN 'MILD' THEN 1 WHEN 'MODERATE' THEN 2 WHEN 'SEVERE' THEN 3 ELSE 4 END DESC LIMIT 1) AS top_severity,(SELECT count(*)::int FROM safety_signals WHERE session_id=s.id AND status='UNREVIEWED') AS unreviewed_signals,(SELECT count(*)::int FROM documents WHERE session_id=s.id) AS document_count,(SELECT count(*)::int FROM documents WHERE session_id=s.id AND (ocr_status IN('PENDING','PROCESSING') OR extraction_status='PROCESSING')) AS documents_processing,(SELECT display_name FROM staff WHERE id=(SELECT doctor_id FROM consultations WHERE session_id=s.id AND status='IN_PROGRESS' ORDER BY started_at DESC LIMIT 1)) AS doctor_name FROM patient_sessions s WHERE s.case_status IN('AWAITING_REVIEW','URGENT_REVIEW','IN_CONSULTATION','IN_PROGRESS') ORDER BY CASE s.case_status WHEN 'URGENT_REVIEW' THEN 0 WHEN 'AWAITING_REVIEW' THEN 1 ELSE 2 END,s.created_at`);
  
  const statusCounts = await c.query(`SELECT case_status, count(*) FROM patient_sessions GROUP BY case_status`);
  
  console.log("Status distribution:", statusCounts.rows);
  console.log("Sessions count:", sessions.rows.length);
  console.log("Recent sessions:", sessions.rows);
  console.log("Staff members:", staff.rows);
  console.log("Queue rows count:", queueQuery.rows.length);
  console.log("Queue rows:", queueQuery.rows);
} finally {
  await c.query("ROLLBACK");
  c.release();
  await pool.end();
}
