"use client";

// Conditionally render children when the actor's permissions satisfy the
// requirement. Props-driven: pass the resolved permission list.

import type { ReactNode } from "react";
import { hasPermission } from "../lib/check";
import type { Permission } from "../lib/permissions";

interface PermissionGateProps {
  permissions: readonly Permission[];
  /** One permission, or several. */
  require: string | string[];
  /** `all` (default) requires every permission; `any` requires one. */
  mode?: "all" | "any";
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permissions, require, mode = "all", fallback = null, children,
}: PermissionGateProps) {
  const wanted = Array.isArray(require) ? require : [require];
  const ok = mode === "any"
    ? wanted.some((p) => hasPermission(permissions, p))
    : wanted.every((p) => hasPermission(permissions, p));
  return <>{ok ? children : fallback}</>;
}
