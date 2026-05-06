"use client"

/**
 * Settings Registry System
 *
 * Central registry for managing dynamic settings from all features
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from "react"
import type {
  SettingsCategory,
  SettingsContextValue,
  RegisterSettingsPayload,
} from "./types"

const SettingsContext = createContext<SettingsContextValue | null>(null)

interface SettingsRegistryProviderProps {
  children: React.ReactNode
  /** Initial core settings (workspace-level) */
  coreSettings?: SettingsCategory[]
  /** Default active category */
  defaultCategory?: string
}

export function SettingsRegistryProvider({
  children,
  coreSettings = [],
  defaultCategory,
}: SettingsRegistryProviderProps) {
  const [categories, setCategories] = useState<SettingsCategory[]>(coreSettings)
  const [activeCategory, setActiveCategory] = useState<string | null>(
    defaultCategory || coreSettings[0]?.id || null
  )

  // Create a stable key based on coreSettings to detect changes
  const coreSettingsKey = useMemo(
    () => coreSettings.map((s) => s.id).join(","),
    [coreSettings]
  )

  // Sync categories with coreSettings when they change
  // This is needed for cases like FeatureSettingsButton where coreSettings
  // are computed at render time and may change
  React.useEffect(() => {
    if (coreSettings.length > 0) {
      setCategories(coreSettings)
      // Set active category if not already set
      setActiveCategory((current) => {
        if (!current && coreSettings[0]?.id) {
          return coreSettings[0].id
        }
        return current
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coreSettingsKey])

  /**
   * Register settings from a feature
   */
  const registerSettings = useCallback((payload: RegisterSettingsPayload) => {
    setCategories((prev) => {
      // Remove existing settings for this feature
      const filtered = prev.filter((cat) => cat.featureSlug !== payload.featureSlug)

      // Add new settings with featureSlug attached
      const newSettings = payload.categories.map((cat) => ({
        ...cat,
        featureSlug: payload.featureSlug,
      }))

      // Combine and sort by order
      return [...filtered, ...newSettings].sort((a, b) => a.order - b.order)
    })
  }, [])

  /**
   * Unregister all settings for a feature
   */
  const unregisterSettings = useCallback((featureSlug: string) => {
    setCategories((prev) => prev.filter((cat) => cat.featureSlug !== featureSlug))
  }, [])

  /**
   * Get settings for a specific feature
   */
  const getFeatureSettings = useCallback(
    (featureSlug: string) => {
      return categories.filter((cat) => cat.featureSlug === featureSlug)
    },
    [categories]
  )

  /**
   * Check if feature has settings registered
   */
  const hasSettings = useCallback(
    (featureSlug: string) => {
      return categories.some((cat) => cat.featureSlug === featureSlug)
    },
    [categories]
  )

  const value: SettingsContextValue = useMemo(
    () => ({
      categories,
      activeCategory,
      setActiveCategory,
      registerSettings,
      unregisterSettings,
      getFeatureSettings,
      hasSettings,
    }),
    [
      categories,
      activeCategory,
      registerSettings,
      unregisterSettings,
      getFeatureSettings,
      hasSettings,
    ]
  )

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  )
}

/**
 * Hook to access settings registry
 */
export function useSettingsRegistry(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error(
      "useSettingsRegistry must be used within SettingsRegistryProvider"
    )
  }
  return context
}

/**
 * Hook for features to register their settings
 *
 * @example
 * ```tsx
 * useRegisterFeatureSettings('wa-chat', [
 *   {
 *     id: 'chat-notifications',
 *     label: 'Chat Notifications',
 *     icon: Bell,
 *     order: 100,
 *     component: ChatNotificationSettings,
 *   }
 * ])
 * ```
 */
export function useRegisterFeatureSettings(
  featureSlug: string,
  categories: Omit<SettingsCategory, "featureSlug">[]
) {
  const { registerSettings, unregisterSettings } = useSettingsRegistry()

  React.useEffect(() => {
    if (categories.length > 0) {
      registerSettings({ featureSlug, categories })
    }

    // Cleanup on unmount
    return () => {
      unregisterSettings(featureSlug)
    }
  }, [featureSlug, categories, registerSettings, unregisterSettings])
}
