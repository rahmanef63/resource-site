# Changelog — event-tracking

## 0.1.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `eventTrackingTools` — track/query/funnel over injectable `EventTrackingCtx` transport (reads server-gated). New `index.ts` barrel.

## 0.2.0 — 2026-09-14

- Added explicit Svelte/SvelteKit framework distribution using the same framework-neutral TypeScript source.
- Removed false React/Next requirements and React-coupled `defineFeature` / agentic barrel imports.
- Corrected the public catalog to describe the shipped headless transport contract rather than an absent template/Convex SDK, and removed the synthetic event-stream preview route.
