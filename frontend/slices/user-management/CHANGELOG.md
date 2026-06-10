# Changelog — user-management

## 0.7.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `userManagementTools` — 5 admin tools (list/invite/set_role/disable/remove) over an injectable server-gated `UserManagementCtx` (RBAC members.* enforced in the binding, never in the tool layer).
