# Changelog — rbac-roles


## 0.4.0 — 2026-09-13

- Added a native Svelte 5/SvelteKit UI distribution for permission gates, role badges, and permission matrices while React/Next remains the default.
- Extracted `createPermissionsApi` so `can`, `canAny`, and `canAll` share the canonical wildcard permission semantics across framework adapters.
- Svelte reuses the canonical role presets, permission catalog, check helpers, agent tools, and tenant-scoped Convex backend; the public preview route now hosts the canonical `preview.tsx` matrix module.

## 0.3.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `rbacRolesTools` — pure preset/catalog/check tools + server-gated grant/revoke over injectable `RbacRolesCtx` (roles.manage in the binding).
