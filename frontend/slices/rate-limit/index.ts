// Rate-limit slice — Convex-backed per-key request counter. Replaces any
// single-replica in-memory Map so the project can run multiple Next replicas
// without buckets diverging.
//
// Consumer wraps the Convex `consume` mutation in their own server-side
// helper (e.g. frontend/shared/lib/rate-limit.ts) so the fail-open fallback
// applies. Do not import the slice directly from API routes.

export { rateLimitFeature } from "./config";

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};
export { rateLimitTools, type RateLimitCtx } from "./lib/tools";
