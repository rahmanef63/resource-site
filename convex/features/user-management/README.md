# convex/features/user-management

Backend half of the `user-management` slice — members.

## Files
- `_schema.ts` — `userManagementTables` (`um_members`). Spread into your root schema.
- `query.ts` — `listMembers` (joins `users` for name/email/avatar; soft-denies to `[]` without `members.view`).
- `mutation.ts` — `addMember`, `updateMemberRole`, `removeMember` (soft-delete) — all gated on `members.manage`.

## Wiring
1. Install the `rbac-roles` slice — this feature imports its permission
   helpers (`getActorPermissions`, `requirePermission` from
   `convex/features/rbac-roles/lib/permissions`) and reads `rbac_roles`.
2. Spread `userManagementTables` into `defineSchema`.
3. Frontend: feed `<MembersPanel>` the `useQuery(api.../listMembers)` result,
   the role options (rbac-roles `ROLE_PRESETS` or your `listRoles`), the
   actor's resolved permissions, and `useMutation` callbacks for
   `updateMemberRole` / `removeMember`.

`tenantId` is a generic string (workspace/org/team id) or `null` for single-tenant. Requires `@convex-dev/auth`.
