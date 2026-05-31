# convex/features/user-management

Backend half of the `user-management` slice — members.

## Files
- `_schema.ts` — `userManagementTables` (`um_members` + `um_invites`). Spread into your root schema.
- `query.ts` — `listMembers` (joins `users`; soft-denies without `members.view`), `listInvites` (pending by default; needs `members.invite`/`members.manage`).
- `mutation.ts` — members: `addMember`, `updateMemberRole`, `removeMember` (soft-delete) gated on `members.manage`; invites: `sendInvite` (7-day token, rejects duplicate pending), `cancelInvite`, `resendInvite` gated on `members.invite`, and `acceptInvite(token)` (public — creates/reactivates the membership for the signed-in user).

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
