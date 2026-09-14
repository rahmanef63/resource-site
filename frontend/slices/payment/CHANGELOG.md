# payment changelog

## 0.5.0 — 2026-09-14

- Added native Svelte 5/SvelteKit DOKU + Midtrans distributions while keeping React/Next default.
- Added CLI 1.18-compatible per-variant runtime dependency metadata: DOKU no longer drags `midtrans-client` or Midtrans env; Midtrans still receives its SDK/env; add-all receives the union.
- Added provider-specific Convex file gating so single-provider installs omit the other provider action.
- Closed backend installer closure: payment now uses `getAuthUserId()` directly, installs `@convex-dev/auth`, and copies only the portable `convex/_shared/crypto.ts` helper; it no longer drags the broader shared auth helper with unrelated table assumptions.
- Extracted framework-neutral payment contracts, DOKU channel/format/status core, and self-contained provider tool collections.
- DOKU React/Svelte now handle credential-guard `{ ok:false, notice }` results explicitly.
- Midtrans React/Svelte now accept injected checkout actions and a Snap `onPay` bridge, with `redirectUrl` fallback.
- Backend HMAC/signature verification, webhook idempotency, amount checks, and provider secrets remain server-side and unchanged.
