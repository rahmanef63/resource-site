# convex/features/user-management

Backend half of the `user-management` slice — members.

## Files
- `_schema.ts` — `userManagementTables` (`um_members`, `um_invites`, `um_teams`, `um_team_members`). Spread into your root schema.
- `query.ts` — `listMembers` (joins `users`; soft-denies without `members.view`), `listInvites` (pending by default; needs `members.invite`/`members.manage`), `listTeams` (each with member ids).
- `mutation.ts` — members: `addMember`, `updateMemberRole`, `removeMember` (soft-delete) gated on `members.manage`; invites: `sendInvite` (7-day token), `cancelInvite`, `resendInvite` gated on `members.invite`, `acceptInvite(token)` (public); teams: `createTeam`, `removeTeam`, `addTeamMember`, `removeTeamMember` gated on `members.manage`.

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
