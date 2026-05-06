/**
 * Settings Domain Facade
 *
 * Workspace and feature settings system including:
 * - Settings registry and management
 * - Settings UI components (SettingsView, DynamicSettingsView, SettingsPopup)
 * - Settings hooks (useSettings, useSettingsRegistry)
 * - Settings primitives for building feature-specific settings
 * - Feature settings integration
 *
 * NOTE: Feature-specific settings live in frontend/slices/[feature]/settings/
 * This module provides the infrastructure and shared components only.
 *
 * @example
 * import { SettingsView, useSettings, SettingsRegistry } from '@/frontend/shared/settings'
 */

// ============================================================
// Core Components
// ============================================================
export { SettingsView } from './SettingsView'
export { SettingsPopup } from './SettingsPopup'
export { SettingsPageWithTabs } from './SettingsPageWithTabs'
export { SettingsRegistryProvider, useSettingsRegistry, useRegisterFeatureSettings } from './SettingsProvider'
export { default as SettingsPage } from './page'

// ============================================================
// Feature Settings Registry
// ============================================================
export {
  registerFeatureSettings,
  unregisterFeatureSettings,
  getFeatureSettingsBuilder,
  getAllRegisteredFeatures,
  hasFeatureSettings,
  clearFeatureSettingsRegistry
} from '../foundation/utils/registry/feature-settings-registry'

// ============================================================
// Workspace Settings
// ============================================================
export * from './workspace'

// ============================================================
// Personal Settings (user-level preferences)
// ============================================================
export * from './personal'

// ============================================================
// Shared Components (Dynamic views, settings utilities)
// Excluding SettingsToggle/SettingsDropdown to avoid conflicts with primitives
// ============================================================
export { DynamicSettingsSidebar } from './components/DynamicSettingsSidebar'
export { DynamicSettingsView } from './components/DynamicSettingsView'
export { FeatureSettingsPlaceholder } from './components/FeatureSettingsPlaceholder'
export { FeatureSettingsSync } from './components/FeatureSettingsSync'
export type { FeatureSettingsSyncProps } from './components/FeatureSettingsSync'
export {
  FEATURE_SETTINGS_DEFAULT_CATEGORY,
  buildPlaceholderCategory,
  getFeatureDefaultCategory,
} from './components/featureSettingsUtils'
export { FeatureSettingsPanel } from './components/FeatureSettingsPanel'
export type { FeatureSettingsPanelProps } from './components/FeatureSettingsPanel'
export { FeatureSettingsSheet } from './components/FeatureSettingsSheet'
export type { FeatureSettingsSheetProps } from './components/FeatureSettingsSheet'
export { FeatureSettingsButton } from './components/FeatureSettingsButton'
export type { FeatureSettingsButtonProps } from './components/FeatureSettingsButton'

// ============================================================
// Settings Primitives (for building feature settings)
// These are the preferred components for new feature settings
// ============================================================
export * from './primitives'

// ============================================================
// Hooks
// ============================================================
export * from './hooks'

// ============================================================
// Types
// ============================================================
export type * from './types'
