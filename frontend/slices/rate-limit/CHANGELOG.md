# Changelog — rate-limit

## 0.4.0 — 2026-09-13

- Added explicit same-source Svelte/SvelteKit distribution metadata for this backend-only slice without introducing UI or a Svelte runtime dependency.
- Removed React-typed `defineFeature` and React-exporting agentic barrel coupling from copied runtime source.
- Corrected canonical Convex paths to `convex/features/rate_limit`, documented the real singular `mutation` API path, and declared optional `RATE_LIMIT_SERVER_KEY` metadata.

## 0.3.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `rateLimitTools` — check (read) + admin-gated reset over injectable `RateLimitCtx`. Careful: this slice backs rr's LIVE admin limiter.
