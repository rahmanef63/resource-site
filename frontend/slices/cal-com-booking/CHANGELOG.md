# Changelog — cal-com-booking

## 0.3.0 — 2026-09-14

- React placeholder → real `@calcom/embed-react` inline embed with required `calLink` wiring and configurable Cal origin.
- Added native Svelte 5/SvelteKit inline embed over the shared vanilla loader/core.
- Corrected the shipped Convex contract to the real `bookings` table; the webhook mirror only upserts events, while list/cancel/reschedule remain host-injected tool adapters.

## 0.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `calComBookingTools` — list + server-gated cancel/reschedule over injectable `CalComBookingCtx`.
