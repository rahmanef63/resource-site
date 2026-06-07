# convex/features/rbac-roles

Backend half of the `rbac-roles` slice — the RBAC engine.

## Files
- `_schema.ts` — `rbacRolesTables` (the `rbac_roles` table). Spread into your root schema.
- `lib/permissions.ts` — `getActorPermissions` / `checkPermission` / `requirePermission`. Resolve the authed user (`getAuthUserId`) → `um_members` row → `rbac_roles` role → permissions, with a `PLATFORM_ADMIN_EMAILS` superadmin bypass.
- `query.ts` — `listRoles` (soft-denies to `[]` without `roles.view`/`roles.manage`).
- `mutation.ts` — `seedSystemRoles` (idempotent 6-preset seed), `upsertRole`, `removeRole` — all gated on `roles.manage`; system roles are immutable.

## Wiring
1. `import { rbacRolesTables } from "./features/rbac-roles/_schema"` and spread into `defineSchema`.
2. Add the `user-management` slice (provides `um_members` with the `by_tenant_user` index) — `requirePermission` reads it.
3. Gate your own privileged functions: `await requirePermission(ctx, tenantId, "members.manage")`.
4. Set `PLATFORM_ADMIN_EMAILS` (comma-separated) for cross-tenant superadmins.

`tenantId` is a generic string (workspace/org/team id) or `null` for single-tenant apps. Requires `@convex-dev/auth`. No Clerk.

Keep `SYSTEM_ROLES` in `mutation.ts` in sync with `frontend/slices/rbac-roles/lib/roles.ts`.
