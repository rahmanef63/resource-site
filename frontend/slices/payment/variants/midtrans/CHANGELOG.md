# Changelog — midtrans-payment

## 0.5.0 — 2026-09-14

- React/Next remains default; native Svelte 5/SvelteKit provider UI is now available.
- CLI 1.18 installs only this provider's runtime dependencies/env/action plus shared payment backend support.
- Frontend contracts/tools are framework-neutral; payment secrets and webhook verification remain server-side.

## 0.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `midtransPaymentTools` — server-gated create_invoice/status/refund over injectable `MidtransPaymentCtx` (payment.* RBAC + server key stay server-side).
