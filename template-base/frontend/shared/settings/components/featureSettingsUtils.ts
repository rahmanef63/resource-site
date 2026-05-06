/**
 * Feature Settings Utilities
 *
 * Shared utilities for building feature settings categories and placeholders
 */

import { createElement } from "react"
import type { LucideIcon } from "lucide-react"
import type { SettingsCategory } from "../types"
import { FeatureSettingsPlaceholder } from "./FeatureSettingsPlaceholder"

/**
 * Default category IDs for common features
 * Used for consistent category naming across features
 */
export const FEATURE_SETTINGS_DEFAULT_CATEGORY: Record<string, string> = {
  chats: "chats-settings",
  chat: "chat-general",
  calls: "calls-quality",
  ai: "ai-settings",
  status: "status-settings",
  documents: "documents-settings",
  calendar: "calendar-settings",
  reports: "reports-settings",
  tasks: "tasks-settings",
  wiki: "wiki-settings",
}

/**
 * Build a placeholder settings category for features without full implementation
 *
 * @param id - Unique category ID
 * @param icon - Lucide icon component
 * @param order - Sort order (lower = higher priority)
 * @param featureName - Display name of the feature
 * @param description - Optional description of future settings
 * @returns Settings category configuration
 *
 * @example
 * ```ts
 * const category = buildPlaceholderCategory(
 *   "tasks-settings",
 *   ClipboardList,
 *   500,
 *   "Tasks",
 *   "Customize task states and notifications"
 * )
 * ```
 */
export function buildPlaceholderCategory(
  id: string,
  icon: LucideIcon,
  order: number,
  featureName: string,
  description?: string
): Omit<SettingsCategory, "featureSlug"> {
  return {
    id,
    label: featureName,
    icon,
    order,
    component: () =>
      createElement(FeatureSettingsPlaceholder, {
        featureName,
        description,
      }),
  }
}

/**
 * Get default category ID for a feature slug
 *
 * @example
 * ```ts
 * getFeatureDefaultCategory("chat") // "chat-general"
 * getFeatureDefaultCategory("tasks") // "tasks-settings"
 * ```
 */
export function getFeatureDefaultCategory(slug: string): string | undefined {
  return FEATURE_SETTINGS_DEFAULT_CATEGORY[slug]
}
