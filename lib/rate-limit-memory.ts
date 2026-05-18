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
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}
