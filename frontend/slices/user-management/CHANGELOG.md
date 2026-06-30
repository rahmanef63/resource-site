# Changelog — user-management

## 0.8.0 — 2026-06-30

- Member status toggle: optional `onSetStatus` prop (MembersPanel to MembersTable to MemberRowActions) adds a Deactivate (active) / Activate (inactive) item to the row menu, gated on members.manage.
- Invite join-link readback: `InviteDialog` onSubmit (and `MembersPanel` onInvite) widened to resolve an optional link URL string. When the seam returns one, the dialog shows a read-only link row with a copy button; link generation stays in the consumer callback.
- Per-row status pill in the member cell (active / pending / inactive) using theme-token Badge variants (secondary / outline / destructive), replacing the prior dim-only treatment.

## 0.7.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `userManagementTools` — 5 admin tools (list/invite/set_role/disable/remove) over an injectable server-gated `UserManagementCtx` (RBAC members.* enforced in the binding, never in the tool layer).
