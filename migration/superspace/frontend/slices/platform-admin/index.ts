/**
 * Platform Admin Feature
 * 
 * Exports for the platform-admin feature module.
 */

// Main page component (Three Column Layout)
export { default as PlatformAdminPage } from "./views/PlatformAdminPageNew"

// Components
export {
  AdminNavigation,
  StatCard,
} from "./components"

export type {
  AdminSection,
  AdminNavItem,
  AdminInspectorProps,
  BundleOption,
  SelectedBundle,
  BundleRole,
} from "./components"

// Types
export type {
  PlatformAdminUser,
  CustomFeature,
  FeatureAccess,
  Workspace,
  FeatureStatus,
  AccessLevel,
  SystemFeatureTag,
} from "./types"

// Config
export { default as config } from "./config"
