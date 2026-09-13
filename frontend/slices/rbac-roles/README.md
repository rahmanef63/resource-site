# RBAC — Roles & Permissions

Reusable role and permission engine with six system presets, dot-namespaced
permissions, `*` / `feature.*` wildcard matching, props-driven UI, and a
tenant-scoped Convex authorization backend.

## Install

```bash
npx rr add rbac-roles
# Svelte 5 / SvelteKit
npx rr add rbac-roles --framework sveltekit
```

React/Next remains the default distribution. The SvelteKit distribution replaces
only the UI adapter (`PermissionGate`, `RoleBadge`, `PermissionMatrix`) and reuses
the canonical permission matcher, role presets, permission catalog,
`createPermissionsApi`, agent tools, and Convex backend.

The host owns the current actor's permission list. `PermissionGate` and the
permissions API are intentionally props-driven; backend authorization must still
be enforced by `checkPermission` / `requirePermission` in the Convex feature.

`PLATFORM_ADMIN_EMAILS` is optional and grants configured platform admins `*`
inside the server-side RBAC feature. Pair with `convex-auth` for identity and
`user-management` when you need member/invite administration UI.
