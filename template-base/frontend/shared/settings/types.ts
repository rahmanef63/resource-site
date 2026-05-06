/**
 * Settings System Types
 *
 * Type definitions for the dynamic settings registry system
 */

import type { LucideIcon } from "lucide-react"
import type { MenuItem } from "@/frontend/shared/foundation/types"

/**
 * Settings category definition
 */
export interface SettingsCategory {
  /** Unique identifier for the category */
  id: string
  /** Display label */
  label: string
  /** Lucide icon component */
  icon: LucideIcon
  /** Order in sidebar (lower = higher priority) */
  order: number
  /** Feature slug this setting belongs to (null = core settings) */
  featureSlug?: string | null
  /** Whether this setting requires specific permission */
  requiredPermission?: string
  /** Component to render for this settings category */
  component: React.ComponentType<any>
  /** Optional badge text (e.g., "New", "Beta") */
  badge?: string
  /** Whether this category is visible */
  isVisible?: boolean
}

/**
 * Settings registration payload
 */
export interface RegisterSettingsPayload {
  /** Feature slug registering these settings */
  featureSlug: string
  /** Array of settings categories to register */
  categories: Omit<SettingsCategory, "featureSlug">[]
}

/**
 * Function type for building feature settings dynamically
 */
export type FeatureSettingsBuilder = (ctx: {
  menuItem: MenuItem
}) => Omit<SettingsCategory, "featureSlug">[]

/**
 * Settings context value
 */
export interface SettingsContextValue {
  /** All registered settings categories */
  categories: SettingsCategory[]
  /** Currently active category ID */
  activeCategory: string | null
  /** Set active category */
  setActiveCategory: (categoryId: string) => void
  /** Register new settings categories */
  registerSettings: (payload: RegisterSettingsPayload) => void
  /** Unregister settings for a feature */
  unregisterSettings: (featureSlug: string) => void
  /** Get settings for a specific feature */
  getFeatureSettings: (featureSlug: string) => SettingsCategory[]
  /** Check if feature has settings */
  hasSettings: (featureSlug: string) => boolean
}
