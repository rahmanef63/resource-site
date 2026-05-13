"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export type AdminAccessLevel =
  | "platform_admin" // env-listed superadmin
  | "workspace_owner" // owns the workspace row
  | "workspace_admin" // owner/admin slug role
  | "delegated_admin" // additionalPermissions includes PLATFORM_ADMIN
  | "denied";

export interface AdminAccess {
  isLoading: boolean;
  level: AdminAccessLevel;
  /** Convenience: any non-denied level. */
  canSeeAdmin: boolean;
  /** Permissions effectively granted in the current workspace. */
  permissions: readonly string[];
  email: string | null;
}

/**
 * Single source of truth for "can this user see /admin?".
 *
 * Resolution order matches the backend:
 *   1. Platform admin (env email match)
 *   2. Workspace owner row
 *   3. Workspace admin role
 *   4. Delegated admin via additionalPermissions
 */
export function useAdminAccess(workspaceId?: string): AdminAccess {
  const result = useQuery(
    (api as any).admin?.access?.getMyAdminAccess,
    workspaceId ? ({ workspaceId } as any) : "skip",
  );

  if (result === undefined) {
    return {
      isLoading: true,
      level: "denied",
      canSeeAdmin: false,
      permissions: [],
      email: null,
    };
  }

  return {
    isLoading: false,
    level: (result?.level ?? "denied") as AdminAccessLevel,
    canSeeAdmin: result?.level !== "denied",
    permissions: (result?.permissions ?? []) as readonly string[],
    email: result?.email ?? null,
  };
}
