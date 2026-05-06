"use client"

import { useState, useEffect, useCallback, useMemo } from "react"

// Storage key prefix for all feature settings
const STORAGE_PREFIX = "superspace:settings:"

/**
 * Get the full storage key for a feature
 */
function getStorageKey(featureSlug: string): string {
  return `${STORAGE_PREFIX}${featureSlug}`
}

/**
 * Type constraint for settings objects - allows any object with string keys
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SettingsObject = { [key: string]: any }

/**
 * Type-safe settings storage hook with localStorage persistence
 * 
 * @param featureSlug - Unique identifier for the feature (e.g., "chat", "tasks")
 * @param defaultSettings - Default values for all settings
 * @returns Object with settings state and update functions
 * 
 * @example
 * const { settings, updateSetting, resetSettings } = useSettingsStorage("chat", {
 *   enterToSend: true,
 *   showTimestamps: true,
 *   notificationSound: "default",
 * })
 * 
 * // Update a single setting
 * updateSetting("enterToSend", false)
 * 
 * // Update multiple settings
 * updateSettings({ enterToSend: false, showTimestamps: false })
 * 
 * // Reset to defaults
 * resetSettings()
 */
export function useSettingsStorage<T extends SettingsObject>(
  featureSlug: string,
  defaultSettings: T
): {
  settings: T
  updateSetting: <K extends keyof T>(key: K, value: T[K]) => void
  updateSettings: (partial: Partial<T>) => void
  resetSettings: () => void
  isLoaded: boolean
  isLoading: boolean
} {
  const [settings, setSettings] = useState<T>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem(getStorageKey(featureSlug))
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<T>
        // Merge with defaults to ensure new settings are included
        setSettings((prev) => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.warn(`Failed to load settings for ${featureSlug}:`, error)
    } finally {
      setIsLoaded(true)
    }
  }, [featureSlug])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return

    try {
      localStorage.setItem(getStorageKey(featureSlug), JSON.stringify(settings))
    } catch (error) {
      console.warn(`Failed to save settings for ${featureSlug}:`, error)
    }
  }, [settings, featureSlug, isLoaded])

  // Update a single setting
  const updateSetting = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Update multiple settings at once
  const updateSettings = useCallback((partial: Partial<T>) => {
    setSettings((prev) => ({ ...prev, ...partial }))
  }, [])

  // Reset to default settings
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings)
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(getStorageKey(featureSlug))
      } catch (error) {
        console.warn(`Failed to clear settings for ${featureSlug}:`, error)
      }
    }
  }, [featureSlug, defaultSettings])

  return useMemo(
    () => ({
      settings,
      updateSetting,
      updateSettings,
      resetSettings,
      isLoaded,
      isLoading: !isLoaded, // Alias for convenience
    }),
    [settings, updateSetting, updateSettings, resetSettings, isLoaded]
  )
}

/**
 * Create a typed settings hook for a specific feature
 * 
 * @param featureSlug - Unique identifier for the feature
 * @param defaultSettings - Default values for all settings
 * @returns A custom hook that provides settings for this feature
 * 
 * @example
 * // In chat/settings/useChatSettings.ts
 * export const useChatSettings = createFeatureSettingsHook("chat", {
 *   enterToSend: true,
 *   showTimestamps: true,
 * })
 * 
 * // In a component
 * const { settings, updateSetting } = useChatSettings()
 */
export function createFeatureSettingsHook<T extends SettingsObject>(
  featureSlug: string,
  defaultSettings: T
) {
  return function useFeatureSettings() {
    return useSettingsStorage(featureSlug, defaultSettings)
  }
}
