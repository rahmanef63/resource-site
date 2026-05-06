"use client"

/**
 * useFeatureSettings Hook
 *
 * Automatically registers feature settings when component mounts
 * and unregisters when unmounts
 */

import { useEffect } from "react"
import { useSettingsRegistry } from "../SettingsProvider"
import type { SettingsCategory } from "../types"

/**
 * Hook to automatically register and manage feature settings
 *
 * @param featureSlug - The slug of the feature registering settings
 * @param categories - Array of settings categories to register
 * @param options - Additional options
 *
 * @example
 * ```tsx
 * // In your feature component
 * useFeatureSettings('wa-chat', [
 *   {
 *     id: 'chat-general',
 *     label: 'General',
 *     icon: Settings,
 *     order: 100,
 *     component: ChatGeneralSettings,
 *   },
 *   {
 *     id: 'chat-notifications',
 *     label: 'Notifications',
 *     icon: Bell,
 *     order: 101,
 *     component: ChatNotificationSettings,
 *   }
 * ])
 * ```
 */
export function useFeatureSettings(
  featureSlug: string,
  categories: Omit<SettingsCategory, "featureSlug">[],
  options?: {
    /** Whether to register settings (useful for conditional registration) */
    enabled?: boolean
  }
) {
  const { registerSettings, unregisterSettings, hasSettings, getFeatureSettings } =
    useSettingsRegistry()

  const enabled = options?.enabled !== false

  useEffect(() => {
    if (enabled && categories.length > 0) {
      registerSettings({
        featureSlug,
        categories,
      })
    }

    return () => {
      if (enabled) {
        unregisterSettings(featureSlug)
      }
    }
  }, [enabled, featureSlug, categories, registerSettings, unregisterSettings])

  return {
    /** Whether this feature has settings registered */
    hasSettings: hasSettings(featureSlug),
    /** Get all settings for this feature */
    settings: getFeatureSettings(featureSlug),
    /** Manually register more settings */
    register: (newCategories: Omit<SettingsCategory, "featureSlug">[]) => {
      registerSettings({
        featureSlug,
        categories: [...categories, ...newCategories],
      })
    },
  }
}
