# Changelog — resend-newsletter

## 0.3.0 — 2026-09-14

- Replaced fake frontend success with an explicit adapter-backed real subscribe flow.
- Subscribe is now truthful single opt-in and creates active subscribers; added public unsubscribe.
- Added admin-gated subscriber listing and `sendCampaignPublic(subject, body)` over the real Resend worker.
- Corrected contract/schema metadata to the actual three Convex tables.
- Added native Svelte 5/SvelteKit SubscribeForm over shared core/host code with no React/shadcn runtime leakage.

## 0.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `resendNewsletterTools` — subscribe/unsubscribe + server-gated list/send_campaign over injectable `ResendNewsletterCtx`.
