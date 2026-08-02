/**
 * Admin Console — pure access-gate logic.
 *
 * Mirrors the server gate: platform_admin sees everything; otherwise a section
 * is visible when the user holds its `required` permission (with `*` and
 * `domain.*` wildcards) or the special OWNER / PLATFORM_ADMIN tokens resolve.
 *
 * Pure module — no React, no Convex. Unit-tested in access.test.ts.
 */
import type {
  AdminAccess,
  AdminAccessLevel,
  AdminConsoleSection,
  AdminTier,
} from "./sections"

const LEVEL_ORDER: readonly AdminAccessLevel[] = [
  "platform_admin",
  "workspace_owner",
  "workspace_admin",
  "delegated_admin",
  "denied",
]

/** Is `actual` at least as privileged as `required`? */
export function meetsLevel(actual: AdminAccessLevel, required: AdminAccessLevel): boolean {
  return LEVEL_ORDER.indexOf(actual) <= LEVEL_ORDER.indexOf(required)
}

/** Permission match with `*` (all) and `domain.*` (prefix) wildcards. */
export function hasPermission(perms: readonly string[], wanted: string): boolean {
  return perms.some((p) => {
    if (p === wanted || p === "*") return true
    if (p.endsWith(".*") && wanted.startsWith(p.slice(0, -2) + ".")) return true
    return false
  })
}

/** Can this access level see this section? */
export function canSeeSection(section: AdminConsoleSection, access: AdminAccess): boolean {
  if (access.level === "denied") return false
  if (access.level === "platform_admin") return true
  if (section.required === "OWNER") return access.level === "workspace_owner"
  if (section.required === "PLATFORM_ADMIN") return access.level === "workspace_owner"
  return hasPermission(access.permissions, section.required)
}

/** Sections visible for a given access + tier, in registry order. */
export function filterSections(
  sections: readonly AdminConsoleSection[],
  access: AdminAccess,
  tier: AdminTier,
): AdminConsoleSection[] {
  return sections.filter((s) => s.tiers.includes(tier)).filter((s) => canSeeSection(s, access))
}

/** Any non-denied level. */
export function canSeeAdmin(access: AdminAccess): boolean {
  return access.level !== "denied"
}
