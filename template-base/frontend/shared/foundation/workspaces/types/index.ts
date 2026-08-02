/**
 * Workspace Types and Interfaces
 *
 * 100% DYNAMIC - ViewType is now a flexible string type
 * NO HARDCODED feature IDs
 *
 * The actual feature IDs come from frontend/slices/config.ts (auto-discovered)
 */

export type WorkspaceType = "organization" | "institution" | "group" | "family" | "personal"

/**
 * ViewType - Generic string type for feature IDs
 *
 * This used to be a hardcoded union type with all feature IDs.
 * Now it's a flexible string type that accepts any feature ID from the registry.
 *
 * The actual valid feature IDs are determined at runtime from:
 * - frontend/slices/config.ts (auto-discovered)
 * - lib/features/registry.ts (auto-discovery system)
 *
 * For type safety with specific features, use the FeatureConfig type from
 * @/lib/features/defineFeature instead.
 */
export type ViewType = string

/**
 * Workspace Navigation Item
 *
 * Represents a single navigation item in the workspace sidebar.
 * These are auto-generated from feature configs in WORKSPACE_NAVIGATION_ITEMS.
 */
export interface WorkspaceNavigationItem {
  key: ViewType
  label: string
  icon: any // Lucide React icon component
  description: string
  path?: string
}

/**
 * Onboarding Data
 *
 * Data structure for workspace creation onboarding flow.
 */
export interface OnboardingData {
  name: string
  type: WorkspaceType
  description: string
}

import { Id } from "@convex/_generated/dataModel"

export interface WorkspaceMemberRoleSummary {
  name: string
  color?: string | null
  level?: number | null
}

export interface WorkspaceMemberSummary {
  membershipId: Id<"workspaceMemberships">
  userId: Id<"users">
  name?: string | null
  email?: string | null
  image?: string | null
  status: "active" | "inactive" | "pending"
  role?: WorkspaceMemberRoleSummary | null
}

/**
 * Workspace Layout State
 *
 * Tracks the current view and selected items in the workspace.
 */
export interface WorkspaceLayoutState {
  currentView: ViewType
  currentMenuItemId?: Id<"menuItems">
  selectedDocumentId?: Id<"documents">
}

/**
 * Onboarding Step Metadata
 *
 * Metadata for each step in the onboarding flow.
 */
export interface OnboardingStepMeta {
  title: string
  description: string
}
