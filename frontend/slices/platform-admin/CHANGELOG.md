# Changelog — platform-admin

## 0.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `platformAdminTools` — metrics/feature_flag.set/tier.set over injectable server-gated `PlatformAdminCtx` (platform.* RBAC in the binding).

## 0.3.0 — 2026-09-14

- Added explicit Svelte/SvelteKit distribution using the same framework-neutral TypeScript source.
- Removed false Convex/UI/hook/route/table/env dependency claims and React-coupled config/agentic barrel imports.
- Removed the synthetic tenant/MRR preview; the shipped surface is now the real `PlatformAdminCtx` tool adapter contract.
