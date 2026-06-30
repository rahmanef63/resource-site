# Changelog — rbac-roles

## 0.3.1 — 2026-06-30

- Fix: `PermissionMatrix` uncheck now also drops any covering wildcard (e.g. `members.*`), not just the literal key. Because `checked()` treats a box as checked when a covering wildcard is present, unchecking a wildcard-covered permission was previously a no-op for every preset that holds wildcards.

## 0.3.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `rbacRolesTools` — pure preset/catalog/check tools + server-gated grant/revoke over injectable `RbacRolesCtx` (roles.manage in the binding).
