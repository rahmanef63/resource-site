// Pure permission resolution + checks. Used by both the frontend
// (usePermissions, PermissionGate) and as the reference logic the convex
// helper template mirrors.

import { matchPermission, type Permission } from "./permissions";
import { ROLE_MAP, type RoleSlug } from "./roles";

/** Preset permissions for a role, unioned with any per-member extras. */
export function resolvePermissions(
  roleSlug: RoleSlug,
  additional: readonly Permission[] = [],
): Permission[] {
  const base = ROLE_MAP.get(roleSlug)?.permissions ?? [];
  return [...new Set<Permission>([...base, ...additional])];
}

/** Does this permission set satisfy the wanted permission? */
export function hasPermission(perms: readonly string[], wanted: string): boolean {
  return perms.some((p) => matchPermission(p, wanted));
}

export function roleHasPermission(
  roleSlug: RoleSlug,
  wanted: string,
  additional: readonly Permission[] = [],
): boolean {
  return hasPermission(resolvePermissions(roleSlug, additional), wanted);
}

export function roleLevel(roleSlug: RoleSlug): number {
  return ROLE_MAP.get(roleSlug)?.level ?? 99;
}

/** True when `roleSlug` ranks at or above `minSlug` (lower level = higher). */
export function isAtLeast(roleSlug: RoleSlug, minSlug: RoleSlug): boolean {
  return roleLevel(roleSlug) <= roleLevel(minSlug);
}
