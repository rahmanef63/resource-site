# RBAC Roles — Svelte 5 / SvelteKit

Native Svelte rendering for the canonical `rbac-roles` permission engine.
React/Next stays the default distribution; this adapter reuses the exact same
permission matcher, role presets, permission catalog, permissions API, tools,
and Convex backend.

```bash
npx rr add rbac-roles --framework sveltekit
```

Ships `PermissionGate`, `RoleBadge`, and `PermissionMatrix` without React,
Next, Lucide, or shadcn dependencies. `*` and `feature.*` wildcard semantics,
role levels, custom permissions, and tenant-scoped Convex authorization remain
single-source in the canonical slice/backend.
