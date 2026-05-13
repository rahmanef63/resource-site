"use client";

import * as React from "react";
import { useAdminAccess, type AdminAccessLevel } from "../hooks/useAdminAccess";

interface AccessGateProps {
  workspaceId?: string;
  /** Minimum level required. Defaults to any admin level. */
  minLevel?: AdminAccessLevel;
  /** Required permission (overrides minLevel if provided). */
  permission?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const LEVEL_ORDER: AdminAccessLevel[] = [
  "platform_admin",
  "workspace_owner",
  "workspace_admin",
  "delegated_admin",
  "denied",
];

function meetsLevel(actual: AdminAccessLevel, required: AdminAccessLevel) {
  return LEVEL_ORDER.indexOf(actual) <= LEVEL_ORDER.indexOf(required);
}

function hasPermission(perms: readonly string[], wanted: string) {
  return perms.some((p) => {
    if (p === wanted) return true;
    if (p === "*") return true;
    if (p.endsWith(".*") && wanted.startsWith(p.slice(0, -2) + ".")) return true;
    return false;
  });
}

/**
 * Renders children only when the user meets the access requirement.
 * Use at the top of every /admin/* page.
 */
export function AccessGate({
  workspaceId,
  minLevel = "delegated_admin",
  permission,
  fallback = null,
  children,
}: AccessGateProps) {
  const access = useAdminAccess(workspaceId);

  if (access.isLoading) return null;

  const ok = permission
    ? hasPermission(access.permissions, permission) || access.level === "platform_admin"
    : meetsLevel(access.level, minLevel);

  if (!ok) return <>{fallback}</>;
  return <>{children}</>;
}
