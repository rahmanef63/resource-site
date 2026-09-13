# Changelog — activity

## 0.4.0 — 2026-09-13

- Added native Svelte 5/SvelteKit ActivityFeed, ActivityItem, and StatsPanel UI.
- Shared canonical config/types/format/grouping/defaults/stats/tools plus the same Convex backend across frameworks.
- Moved stats ordering/hour rounding into framework-neutral `activityStatItems`.
- Added ISO-week boundary/sort tests and restored a public preview route that mounts canonical `preview.tsx`.

## 0.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `activityTools` — READ-ONLY list/stats over injectable `ActivityToolsCtx` bindings.
