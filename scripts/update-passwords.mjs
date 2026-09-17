import pg from "pg";
import crypto from "node:crypto";

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  return `scrypt:${salt.toString("hex")}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password, stored) {
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

const poolerUrl = process.env.DATABASE_URL || "postgresql://postgres.pmxuxxcgvukepufhowwz:pp47M5sNoOa5BG1q12@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";
const client = new pg.Client({ connectionString: poolerUrl, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  console.log("Connected to Supabase PostgreSQL database.");

  const accounts = [
    { email: "doc1", display_name: "Dr. Doc1", title: "Consultant Physician", role: "DOCTOR", password: "1234" },
    { email: "doc1@medikiosk.local", display_name: "Dr. Doc1", title: "Consultant Physician", role: "DOCTOR", password: "1234" },
    { email: "doctor@medikiosk.local", display_name: "Dr. Doc1", title: "Consultant Physician", role: "DOCTOR", password: "1234" },
    { email: "hs1", display_name: "Hospital Hs1 Admin", title: "Operations Lead", role: "HOSPITAL", password: "h1234" },
    { email: "hs1@medikiosk.local", display_name: "Hospital Hs1 Admin", title: "Operations Lead", role: "HOSPITAL", password: "h1234" },
    { email: "hospital@medikiosk.local", display_name: "Hospital Hs1 Admin", title: "Operations Lead", role: "HOSPITAL", password: "h1234" },
  ];

  for (const acc of accounts) {
    const pHash = hashPassword(acc.password);
    const res = await client.query(
      `INSERT INTO staff (email, display_name, title, role, password_hash, active, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, now())
       ON CONFLICT (email) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         title = EXCLUDED.title,
         role = EXCLUDED.role,
         password_hash = EXCLUDED.password_hash,
         active = true,
         updated_at = now()
       RETURNING id, email, display_name, role, password_hash`,
      [acc.email, acc.display_name, acc.title, acc.role, pHash]
    );
    const row = res.rows[0];
    const isPwValid = verifyPassword(acc.password, row.password_hash);
    console.log(`[OK] Provisioned: ${row.email} | Role: ${row.role} | Password verified: ${isPwValid}`);
  }

  const allStaff = await client.query("SELECT id, email, display_name, role, active, updated_at FROM staff ORDER BY role, email");
  console.log("\nCurrent staff accounts in Supabase database:");
  console.table(allStaff.rows);

  await client.end();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
