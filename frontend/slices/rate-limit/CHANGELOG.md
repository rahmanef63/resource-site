# Changelog — rate-limit

## 0.3.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `rateLimitTools` — check (read) + admin-gated reset over injectable `RateLimitCtx`. Careful: this slice backs rr's LIVE admin limiter.
