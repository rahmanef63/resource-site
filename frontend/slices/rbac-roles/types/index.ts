// Public slice types — re-exported through the barrel.

export type { Permission, CorePermission } from "../lib/permissions";
export type { RoleSlug, RolePreset } from "../lib/roles";
export type { PermissionDef, PermissionGroup } from "../lib/permission-catalog";

/** Membership lifecycle — shared with the user-management slice. */
export type MemberStatus = "active" | "inactive" | "pending";
