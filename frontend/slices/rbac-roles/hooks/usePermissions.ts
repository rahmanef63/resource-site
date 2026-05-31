"use client";

// Props-driven permission hook. Feed it the current actor's resolved
// permission list (from your Convex membership query, or
// resolvePermissions(roleSlug)). No store, no context — the host owns
// where the permissions come from.

import { useMemo } from "react";
import { hasPermission } from "../lib/check";
import type { Permission } from "../lib/permissions";

export interface PermissionsApi {
  can: (perm: string) => boolean;
  canAny: (perms: string[]) => boolean;
  canAll: (perms: string[]) => boolean;
  permissions: readonly Permission[];
}

export function usePermissions(permissions: readonly Permission[]): PermissionsApi {
  return useMemo(
    () => ({
      can: (perm) => hasPermission(permissions, perm),
      canAny: (perms) => perms.some((p) => hasPermission(permissions, p)),
      canAll: (perms) => perms.every((p) => hasPermission(permissions, p)),
      permissions,
    }),
    [permissions],
  );
}
