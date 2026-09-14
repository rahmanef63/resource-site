# Changelog — doku-payment

## 0.5.0 — 2026-09-14

- React/Next remains default; native Svelte 5/SvelteKit provider UI is now available.
- CLI 1.18 installs only this provider's runtime dependencies/env/action plus shared payment backend support.
- Frontend contracts/tools are framework-neutral; payment secrets and webhook verification remain server-side.

## 0.3.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `dokuPaymentTools` — pure channels listing + server-gated create_invoice/status/refund over injectable `DokuPaymentCtx` (payment.* RBAC + DOKU secrets stay server-side).
