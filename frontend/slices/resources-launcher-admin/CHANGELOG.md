# resources-launcher-admin changelog

## 1.1.1 — 2026-09-14

- Svelte best-practice hardening: `ResourceEditor.svelte` now uses keyed icon options and a rune-backed form class instead of copying prop values into `$state` via `$effect`. The official `@sveltejs/mcp svelte-autofixer` reports zero issues and zero suggestions.

## 1.1.0 — 2026-09-13

- Added one framework-neutral `lib/core.ts` for resource models, mock/live adapter state, icon-name catalog, input normalization, sorting and reorder semantics.
- React/Next remains the default Lucide + shadcn renderer and preserves `configureResources`, `useResourcesApi`, `ResourcesAdmin`, `resourcesAdminApp`, and icon resolver APIs.
- Added native Svelte 5/SvelteKit CRUD using the exact same adapter/core with no React, Next, Lucide or shadcn runtime imports.
- Public preview now mounts canonical `preview.tsx`; default Lucide dependency is pinned to `lucide-react@^0.400.0`.

## 1.0.0 — 2026-06-30

- Lifted from os-vps (the rahmanef-com web-OS). Self-contained host seam
  (`lib/host.ts`): injectable `ResourcesAdapter` (list / upsert / remove /
  canManage) with an in-memory mock so add / edit / remove / reorder are all
  interactive with zero backend. Convex `resources.*` mutations were replaced by
  the adapter, the auth/session/sign-in gating was dropped in favour of a simple
  `canManage` flag, and the launcher icon map was brand-stripped to generic
  lucide NAMEs. Renamed from "Resources Admin" to slug `resources-launcher-admin`
  to avoid colliding with the existing `quicklinks` / `files` slices.
