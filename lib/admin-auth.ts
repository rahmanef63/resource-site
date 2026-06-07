import { createHmac, scryptSync, timingSafeEqual } from "crypto";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export const SESSION_COOKIE = "kitab_admin";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(plain, salt, 64).toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(test, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function checkLogin(email: string, password: string): boolean {
  if (email.trim().toLowerCase() !== env("ADMIN_EMAIL").toLowerCase()) return false;
  return verifyPassword(password, env("ADMIN_PASSWORD_HASH"));
}

/** Session token = base64url(payload).hmacSha256(payload). The payload
 *  (email + expiry) is SIGNED, not encrypted — anyone holding the token
 *  can read it. Accepted trade-off: the payload carries nothing beyond
 *  what the holder already knows, and forgery still requires
 *  ADMIN_SESSION_SECRET. Switch to an opaque server-side session id if
 *  the payload ever grows beyond {email, exp}. */
export function makeSession(email: string): string {
  const payload = JSON.stringify({ e: email, exp: Date.now() + SESSION_TTL_MS });
  const b64 = Buffer.from(payload).toString("base64url");
  const sig = createHmac("sha256", env("ADMIN_SESSION_SECRET")).update(b64).digest("hex");
  return `${b64}.${sig}`;
}

export function readSession(token: string | undefined): string | null {
  if (!token) return null;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  let secret: string;
  try {
    secret = env("ADMIN_SESSION_SECRET");
  } catch {
    return null;
  }
  const expected = createHmac("sha256", secret).update(b64).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString());
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return typeof payload.e === "string" ? payload.e : null;
  } catch {
    return null;
  }
}
