/**
 * Workspace Types - SINGLE SOURCE OF TRUTH
 *
 * These types are derived from the Convex schema.
 * See: convex/features/core/api/schema.ts
 *
 * @module frontend/shared/constants/workspace-types
 */

// ============================================================================
// Workspace Type Definition (matches Convex schema)
// ============================================================================

/**
 * Workspace type - matches the Convex schema definition
 * 
 * NOTE: This MUST stay in sync with convex/features/core/api/schema.ts
 * The schema defines: v.union(
 *   v.literal("organization"),
 *   v.literal("institution"),
 *   v.literal("group"),
 *   v.literal("family"),
 *   v.literal("personal"),
 * )
 */
export type WorkspaceType = 
  | "personal" 
  | "organization" 
  | "institution" 
  | "group" 
  | "family"

// ============================================================================
// Workspace Type Metadata
// ============================================================================

export interface WorkspaceTypeConfig {
  value: WorkspaceType
  label: string
  description: string
  icon: string
}

export const WORKSPACE_TYPES: WorkspaceTypeConfig[] = [
  { 
    value: "personal", 
    label: "Personal", 
    description: "Your private workspace",
    icon: "User"
  },
  { 
    value: "organization", 
    label: "Organization", 
    description: "Company or business workspace",
    icon: "Building2"
  },
  { 
    value: "institution", 
    label: "Institution", 
    description: "Educational or governmental institution",
    icon: "Landmark"
  },
  { 
    value: "group", 
    label: "Group", 
    description: "Team or department workspace",
    icon: "Users"
  },
  { 
    value: "family", 
    label: "Family", 
    description: "Family shared workspace",
    icon: "Heart"
  },
]

// Alias for backward compatibility
export const WORKSPACE_TYPE_OPTIONS = WORKSPACE_TYPES

// ============================================================================
// Lookup Maps
// ============================================================================

export const WORKSPACE_TYPE_LABELS: Record<WorkspaceType, string> = {
  personal: "Personal",
  organization: "Organization",
  institution: "Institution",
  group: "Group",
  family: "Family",
}

export const WORKSPACE_TYPE_ICONS: Record<WorkspaceType, string> = {
  personal: "User",
  organization: "Building2",
  institution: "Landmark",
  group: "Users",
  family: "Heart",
}

export const WORKSPACE_TYPE_DESCRIPTIONS: Record<WorkspaceType, string> = {
  personal: "Your private workspace",
  organization: "Company or business workspace",
  institution: "Educational or governmental institution",
  group: "Team or department workspace",
  family: "Family shared workspace",
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a string is a valid WorkspaceType
 */
export function isValidWorkspaceType(value: string): value is WorkspaceType {
  return ["personal", "organization", "institution", "group", "family"].includes(value)
}

/**
 * Get workspace type config by value
 */
export function getWorkspaceTypeConfig(type: WorkspaceType): WorkspaceTypeConfig {
  return WORKSPACE_TYPES.find(t => t.value === type) || WORKSPACE_TYPES[0]
}
