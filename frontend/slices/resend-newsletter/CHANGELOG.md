# Changelog — resend-newsletter

## 0.3.1 — 2026-09-14

- Removed the hidden dependency on this repository's Convex Auth/userProfiles/super-admin schema.
- Subscriber listing and campaign sending are now explicit host-authorized adapters; the bundled Convex campaign entrypoint is internal-only.
- Updated manifests, preview, docs, and agent-tool wording so the shipped contract matches the portable runtime.

## 0.3.0 — 2026-09-14

- Replaced fake frontend success with an explicit adapter-backed real subscribe flow.
- Subscribe is now truthful single opt-in and creates active subscribers; added public unsubscribe.
- Added admin-gated subscriber listing and `sendCampaignPublic(subject, body)` over the real Resend worker.
- Corrected contract/schema metadata to the actual three Convex tables.
- Added native Svelte 5/SvelteKit SubscribeForm over shared core/host code with no React/shadcn runtime leakage.

## 0.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `resendNewsletterTools` — subscribe/unsubscribe + server-gated list/send_campaign over injectable `ResendNewsletterCtx`.
