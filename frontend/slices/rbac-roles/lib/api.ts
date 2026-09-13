import { hasPermission } from "./check";
import type { Permission } from "./permissions";

export interface PermissionsApi {
  can: (perm: string) => boolean;
  canAny: (perms: string[]) => boolean;
  canAll: (perms: string[]) => boolean;
  permissions: readonly Permission[];
}

export function createPermissionsApi(
  permissions: readonly Permission[],
): PermissionsApi {
  return {
    can: (perm) => hasPermission(permissions, perm),
    canAny: (perms) => perms.some((perm) => hasPermission(permissions, perm)),
    canAll: (perms) => perms.every((perm) => hasPermission(permissions, perm)),
    permissions,
  };
}
