"use client"

import * as React from "react"
import type { AdminAccess, AdminAccessLevel } from "../lib/sections"
import { hasPermission, meetsLevel } from "../lib/access"

interface AccessGateProps {
  access: AdminAccess
  /** Minimum level required. Defaults to any admin level. */
  minLevel?: AdminAccessLevel
  /** Required permission (overrides minLevel when provided). */
  permission?: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * Renders children only when the injected `access` meets the requirement.
 * Portable: access is passed in (consumer's own useAdminAccess or a mock), so
 * this never imports Convex and stays unit-testable.
 */
export function AccessGate({
  access,
  minLevel = "delegated_admin",
  permission,
  fallback = null,
  children,
}: AccessGateProps) {
  if (access.isLoading) return null
  const ok = permission
    ? hasPermission(access.permissions, permission) || access.level === "platform_admin"
    : meetsLevel(access.level, minLevel)
  return <>{ok ? children : fallback}</>
}
