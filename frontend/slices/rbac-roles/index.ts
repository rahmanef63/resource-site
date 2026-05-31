// rbac-roles — RBAC engine (roles, permissions, checks + UI primitives).
// Pure + props-driven. Pair with the `user-management` slice for the
// members / invites / roles-admin surface.

export { PERMS, matchPermission, type Permission, type CorePermission } from "./lib/permissions";
export {
  ROLE_PRESETS, ROLE_MAP, ROLE_SLUGS, DEFAULT_ROLE_SLUG,
  type RolePreset, type RoleSlug,
} from "./lib/roles";
export {
  resolvePermissions, hasPermission, roleHasPermission, roleLevel, isAtLeast,
} from "./lib/check";
export {
  PERMISSION_GROUPS, type PermissionDef, type PermissionGroup,
} from "./lib/permission-catalog";
export { usePermissions, type PermissionsApi } from "./hooks/usePermissions";
export { PermissionGate } from "./components/PermissionGate";
export { RoleBadge } from "./components/RoleBadge";
export { PermissionMatrix } from "./components/PermissionMatrix";
export type { MemberStatus } from "./types";
