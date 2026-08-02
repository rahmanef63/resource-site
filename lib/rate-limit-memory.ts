// In-memory sliding-window rate limiter. Single-instance Dokploy only; if
// Convex Dokploy ever scales to >1 replica, swap for a Convex-backed bucket
// (frontend/slices/rate-limit/ has the schema + table).
//
// Keyed by IP. Lockout fires when N attempts land in `windowMs`. Lockout
// duration equals the remaining window. Manual unlock = process restart.

type Bucket = { attempts: number[]; lockedUntil: number };

const STORE = new Map<string, Bucket>();

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number };

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const bucket = STORE.get(key) ?? { attempts: [], lockedUntil: 0 };

  if (bucket.lockedUntil > now) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.lockedUntil - now) / 1000) };
  }

  bucket.attempts = bucket.attempts.filter((t) => now - t < opts.windowMs);

  if (bucket.attempts.length >= opts.limit) {
    bucket.lockedUntil = now + opts.windowMs;
    STORE.set(key, bucket);
    return { ok: false, retryAfterSec: Math.ceil(opts.windowMs / 1000) };
  }

  bucket.attempts.push(now);
  STORE.set(key, bucket);
  return { ok: true, remaining: opts.limit - bucket.attempts.length };
}

export function resetRateLimit(key: string): void {
  STORE.delete(key);
}

export function extractIp(req: Request): string {
  // Traefik sets X-Real-IP and APPENDS the connecting peer to X-Forwarded-For.
  // The leftmost XFF entry is client-supplied and forgeable (rotate it per
  // request → lockout never trips), so trust X-Real-IP first, else the
  // RIGHTMOST XFF hop — the one our proxy wrote.
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",");
    return parts[parts.length - 1]?.trim() || "unknown";
  }
  return "unknown";
}
