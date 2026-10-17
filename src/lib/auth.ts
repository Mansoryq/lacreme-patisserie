import { cookies } from "next/headers";
import crypto from "crypto";
import getDb from "./db";

const COOKIE_NAME = "lacreme_admin_session";
const SECRET = process.env.ADMIN_SESSION_SECRET || "lacreme_astana_luxury_key_2026";
const SALT = "lacreme_astana_salt";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + SALT).digest("hex");
}

export function createSessionToken(username: string, role: string): string {
  const payload = JSON.stringify({
    username,
    role,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  });
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64") + "." + signature;
}

export function verifySessionToken(token: string): { username: string; role: string } | null {
  try {
    const [b64, signature] = token.split(".");
    if (!b64 || !signature) return null;

    const payload = Buffer.from(b64, "base64").toString("utf-8");
    const expectedSig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");

    if (signature !== expectedSig) return null;

    const data = JSON.parse(payload);
    if (data.expires < Date.now()) return null;

    return { username: data.username, role: data.role };
  } catch {
    return null;
  }
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = verifySessionToken(token);
  if (!session) return null;

  const db = getDb();
  const user = db.prepare(`
    SELECT id, username, name, role, created_at
    FROM admin_users
    WHERE username = ?
  `).get(session.username) as any;

  return user || null;
}

export { COOKIE_NAME };
