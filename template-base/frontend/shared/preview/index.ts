/**
 * Feature Preview System - Public API
 * 
 * @module frontend/shared/features/preview
 */

// Types
export * from './types'

// Registry
export {
  registerFeaturePreview,
  getFeaturePreview,
  getAllFeaturePreviews,
  getFeaturePreviewsByCategory,
  hasFeaturePreview,
  getFeatureIdsWithPreviews,
  defineFeaturePreview,
  unregisterFeaturePreview,
  clearPreviewRegistry,
} from './registry'

// Components
export { FeaturePreviewWrapper } from './FeaturePreviewWrapper'
export { FeatureListPanel } from './FeatureListPanel'
export { PreviewPanel } from './PreviewPanel'

let allPreviewsPromise: Promise<void> | null = null

/**
 * Lazily load and register all feature previews.
 *
 * This keeps the (potentially large) preview graph out of the initial bundle
 * for pages that only need the preview system API.
 */
export function loadAllFeaturePreviews(): Promise<void> {
  if (!allPreviewsPromise) {
    allPreviewsPromise = import('@/frontend/shared/bindings/previews/feature-previews.generated').then(() => undefined)
  }

  return allPreviewsPromise
}
