/**
 * Foundation Domain Facade
 *
 * Base layer functionality including:
 * - Authentication & Authorization
 * - Common hooks (useDebounce, useLocalStorage, etc.)
 * - Utility functions
 * - Type definitions
 * - Component manifest system
 * - Registry patterns
 *
 * @example
 * import { useAuth, useDebounce, cn } from '@/frontend/shared/foundation'
 */

// ============================================================
// Authentication & Authorization
// ============================================================
export { useAuthed } from './auth/hooks/useAuthed'
export { SafeSignOutButton } from './auth/components/SafeSignOutButton'
export { AuthModal } from './auth/components/AuthModal'
export { SignInForm } from './auth/components/SignInForm'
export { SafeSignInButton } from './auth/components/SafeSignInButton'
export { SafeSignUpButton } from './auth/components/SafeSignUpButton'
export { SignOutButton } from './auth/components/SignOutButton'

// ============================================================
// Common Hooks
// ============================================================
export * from './hooks'
export { useFeatureNavigation } from './hooks/useFeatureNavigation'
export { useMobileResponsive } from './hooks/useMobileResponsive'
export { useSearchFilter } from './hooks/useSearchFilter'
export { useResponsive } from './hooks/useResponsive'
export { usePerformanceCache } from './hooks/usePerformanceCache'

// ============================================================
// Utility Functions
// ============================================================
// Re-export cn utility from lib
export { cn } from '@/lib/utils'

// TODO: Fix relative imports in utils files before exporting
// export * from './utils'
// export * from './utils/validation'
// export * from './utils/format'

// ============================================================
// Component Manifest System
// ============================================================
export {
  DEFAULT_PAGE_MANIFEST,
  PAGE_MANIFEST_MAP,
  COMPONENT_REGISTRY_MAP,
  getDefaultPages,
  getPageById,
  getComponentById,
  AppContent,
} from './manifest'
export type {
  AppPageComponent,
  PageManifestItem,
} from './manifest'

// ============================================================
// Registry Patterns - SSOT is at utils/registry/
// ============================================================
// Cross-Feature Registry
export {
  useCrossFeatureRegistry,
  crossFeatureRegistry
} from './utils/registry/CrossFeatureRegistry'
export type {
  ComponentConfig,
  InspectorField,
  FeatureTab,
} from './utils/registry/CrossFeatureRegistry'

// ============================================================
// Core Types
// ============================================================
export * from './types'

// ============================================================
// CMS Utilities
// ============================================================
export {
  useCMSCollections,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
  type CMSCollectionDoc,
} from './cms'

export { WorkspaceProvider, useWorkspaceContext } from './provider/WorkspaceProvider'
