import pg from "pg";
import crypto from "node:crypto";

function hashPassword(password, saltHex) {
  const salt = saltHex ? Buffer.from(saltHex, "hex") : crypto.randomBytes(16);
  return `scrypt:${salt.toString("hex")}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
}

function verifyPassword(password, stored) {
  try {
    const [scheme, saltHex, hashHex] = stored.split(":");
    if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, "hex");
    const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

// Emulate login logic from lib/staff-auth.ts directly against the DB client
async function testDbLogin(c, email, password) {
  const normalized = email.trim().toLowerCase();
  const hash = crypto.createHash("sha256").update(normalized).digest("hex");

  // Brute force rate check
  const limited = await c.query(
    `WITH purge AS (DELETE FROM staff_login_attempts WHERE window_started < now()-interval '10 minutes'),
          ins AS (INSERT INTO staff_login_attempts(email_hash,attempts,window_started) VALUES($1,1,now())
                  ON CONFLICT(email_hash) DO UPDATE SET
                    attempts=CASE WHEN staff_login_attempts.window_started < now()-interval '5 minutes' THEN 1 ELSE staff_login_attempts.attempts+1 END,
                    window_started=CASE WHEN staff_login_attempts.window_started < now()-interval '5 minutes' THEN now() ELSE staff_login_attempts.window_started END
                  RETURNING attempts,window_started)
     SELECT attempts,window_started FROM ins`,
    [hash]
  );
  if (Number(limited.rows[0]?.attempts) > 8) return { kind: "limited" };

  const r = await c.query(
    `SELECT id,email,display_name,title,role,active,password_hash FROM staff WHERE email=$1`,
    [normalized]
  );
  const candidate = r.rows[0];

  const ok = verifyPassword(password, candidate?.password_hash ?? "");
  if (!candidate || !candidate.active || !ok) return { kind: "invalid" };

  await c.query(`DELETE FROM staff_login_attempts WHERE email_hash=$1`, [hash]);
  const token = crypto.randomBytes(32).toString("hex");
  await c.query(
    `INSERT INTO staff_sessions(staff_id,token_hash,expires_at) VALUES($1,$2,now()+interval '10 hours')`,
    [candidate.id, crypto.createHash("sha256").update(token).digest("hex")]
  );

  return {
    kind: "ok",
    staff: {
      id: candidate.id,
      email: candidate.email,
      displayName: candidate.display_name,
      title: candidate.title ?? null,
      role: candidate.role,
    },
    token,
  };
}

const poolerUrl = process.env.DATABASE_URL || "postgresql://postgres.pmxuxxcgvukepufhowwz:pp47M5sNoOa5BG1q12@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";
const pool = new pg.Pool({
  connectionString: poolerUrl,
  ssl: { rejectUnauthorized: false },
});

async function runVerification() {
  console.log("=== STARTING AUTHENTICATION SELF-VERIFICATION ===");
  const client = await pool.connect();

  try {
    // 1. Verify rows directly in the Postgres database
    console.log("\n[Test 1] Inspecting 'staff' table records in Supabase...");
    const docQuery = await client.query(
      "SELECT id, email, display_name, role, active, password_hash, updated_at FROM staff WHERE email = 'doc1'"
    );
    if (docQuery.rows.length === 0) {
      throw new Error("FAIL: 'doc1' not found in staff table!");
    }
    const docRow = docQuery.rows[0];
    console.log("✓ Found doc1 in database:", { id: docRow.id, email: docRow.email, role: docRow.role, active: docRow.active });
    const isDocPwOk = verifyPassword("1234", docRow.password_hash);
    if (!isDocPwOk) throw new Error("FAIL: Password '1234' does not verify against doc1 password_hash!");
    console.log("✓ Password '1234' matches scrypt hash for 'doc1'");

    const hospQuery = await client.query(
      "SELECT id, email, display_name, role, active, password_hash, updated_at FROM staff WHERE email = 'hs1'"
    );
    if (hospQuery.rows.length === 0) {
      throw new Error("FAIL: 'hs1' not found in staff table!");
    }
    const hospRow = hospQuery.rows[0];
    console.log("✓ Found hs1 in database:", { id: hospRow.id, email: hospRow.email, role: hospRow.role, active: hospRow.active });
    const isHospPwOk = verifyPassword("h1234", hospRow.password_hash);
    if (!isHospPwOk) throw new Error("FAIL: Password 'h1234' does not verify against hs1 password_hash!");
    console.log("✓ Password 'h1234' matches scrypt hash for 'hs1'");

    // 2. Test database login transaction logic
    console.log("\n[Test 2] Testing database login flow & session token generation...");

    // Test Doc1 login (case insensitive "Doc1")
    await client.query("BEGIN");
    const docLoginRes = await testDbLogin(client, "Doc1", "1234");
    await client.query("COMMIT");
    if (docLoginRes.kind !== "ok" || docLoginRes.staff.role !== "DOCTOR") {
      throw new Error("FAIL: login('Doc1', '1234') failed: " + JSON.stringify(docLoginRes));
    }
    console.log("✓ login('Doc1', '1234') succeeded:", {
      email: docLoginRes.staff.email,
      displayName: docLoginRes.staff.displayName,
      role: docLoginRes.staff.role,
      tokenIssued: Boolean(docLoginRes.token),
    });

    // Test Hs1 login (case insensitive "Hs1")
    await client.query("BEGIN");
    const hospLoginRes = await testDbLogin(client, "Hs1", "h1234");
    await client.query("COMMIT");
    if (hospLoginRes.kind !== "ok" || hospLoginRes.staff.role !== "HOSPITAL") {
      throw new Error("FAIL: login('Hs1', 'h1234') failed: " + JSON.stringify(hospLoginRes));
    }
    console.log("✓ login('Hs1', 'h1234') succeeded:", {
      email: hospLoginRes.staff.email,
      displayName: hospLoginRes.staff.displayName,
      role: hospLoginRes.staff.role,
      tokenIssued: Boolean(hospLoginRes.token),
    });

    // 3. Test negative cases (invalid password)
    console.log("\n[Test 3] Testing rejection of invalid passwords...");
    await client.query("BEGIN");
    const badDocLogin = await testDbLogin(client, "Doc1", "wrong_pw");
    await client.query("COMMIT");
    if (badDocLogin.kind !== "invalid") {
      throw new Error("FAIL: Bad password should return 'invalid', got: " + JSON.stringify(badDocLogin));
    }
    console.log("✓ login('Doc1', 'wrong_pw') correctly rejected with { kind: 'invalid' }");

    await client.query("BEGIN");
    const badHospLogin = await testDbLogin(client, "Hs1", "wrong_pw");
    await client.query("COMMIT");
    if (badHospLogin.kind !== "invalid") {
      throw new Error("FAIL: Bad password should return 'invalid', got: " + JSON.stringify(badHospLogin));
    }
    console.log("✓ login('Hs1', 'wrong_pw') correctly rejected with { kind: 'invalid' }");

    // 4. Verify session stored in database
    console.log("\n[Test 4] Verifying staff session record in database...");
    const tokenHash = crypto.createHash("sha256").update(docLoginRes.token).digest("hex");
    const sessionCheck = await client.query(
      "SELECT staff_id, expires_at FROM staff_sessions WHERE token_hash = $1",
      [tokenHash]
    );
    if (sessionCheck.rows.length === 0) {
      throw new Error("FAIL: Session token hash not found in staff_sessions table!");
    }
    console.log("✓ Verified active session stored in staff_sessions table, expires:", sessionCheck.rows[0].expires_at);

    // Clean up test session
    await client.query("DELETE FROM staff_sessions WHERE token_hash = $1", [tokenHash]);

    console.log("\n🎉 ALL SELF-VERIFICATION CHECKS PASSED SUCCESSFULLY!");
  } finally {
    client.release();
    await pool.end();
  }
}

runVerification().catch((err) => {
  console.error("\n❌ VERIFICATION FAILED:", err);
  process.exit(1);
});
