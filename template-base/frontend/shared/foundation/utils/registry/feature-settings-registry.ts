// Feature settings registry - works on both client and server

/**
 * Feature Settings Registry
 * Allows features to register their settings components dynamically
 * No hardcoded imports - truly shared!
 */

import type { SettingsCategory, FeatureSettingsBuilder } from "@/frontend/shared/settings/types"
import type { Id } from "@/convex/_generated/dataModel"

// ============================================================================
// Registry
// ============================================================================

const featureSettingsBuilders = new Map<string, FeatureSettingsBuilder>()

// ============================================================================
// Registration API
// ============================================================================

/**
 * Register feature settings builder
 * Features call this at initialization to register their settings
 *
 * @example
 * ```ts
 * // In frontend/slices/chat/init.ts
 * import { registerFeatureSettings } from "@/frontend/shared/settings"
 *
 * registerFeatureSettings("chat", () => [
 *   { id: "chat-general", label: "Chat", component: ChatGeneralSettings },
 *   { id: "chat-notifications", label: "Notifications", component: ChatNotificationsSettings },
 * ])
 * ```
 */
export function registerFeatureSettings(
  featureSlug: string,
  builder: FeatureSettingsBuilder
): void {
  if (featureSettingsBuilders.has(featureSlug)) {
    console.warn(`?? Feature settings for "${featureSlug}" already registered, overwriting...`)
  }

  featureSettingsBuilders.set(featureSlug, builder)

  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    (window as any).__FEATURE_SETTINGS_REGISTRY__ = {
      builders: featureSettingsBuilders,
      register: registerFeatureSettings,
      get: getFeatureSettingsBuilder,
      getAll: getAllRegisteredFeatures,
      has: hasFeatureSettings,
      clear: clearFeatureSettingsRegistry,
    }
  }
}

/**
 * Unregister feature settings builder
 */
export function unregisterFeatureSettings(featureSlug: string): void {
  featureSettingsBuilders.delete(featureSlug)
}

/**
 * Get feature settings builder
 */
export function getFeatureSettingsBuilder(featureSlug: string): FeatureSettingsBuilder | undefined {
  return featureSettingsBuilders.get(featureSlug)
}

/**
 * Get all registered features
 */
export function getAllRegisteredFeatures(): string[] {
  return Array.from(featureSettingsBuilders.keys())
}

/**
 * Check if feature has settings
 */
export function hasFeatureSettings(featureSlug: string): boolean {
  return featureSettingsBuilders.has(featureSlug)
}

/**
 * Clear all registered features (for testing/cleanup)
 */
export function clearFeatureSettingsRegistry(): void {
  featureSettingsBuilders.clear()
}
