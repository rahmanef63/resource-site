/**
 * Example: Reports Feature Registration
 *
 * This is a reference implementation showing how to structure
 * a feature using the feature package pattern.
 *
 * Use this as a template when creating new features.
 */

import { createFeatureRegistration, type FeatureMetadata } from "../registerFeature"
import { getFeatureById, toLegacyFormat } from "../registry"

// ============================================================================
// FEATURE METADATA
// ============================================================================

// Fetch from the canonical auto-discovery registry and convert to legacy shape
const reportsConfig = getFeatureById("reports")
const reportsMetadata: FeatureMetadata | undefined = reportsConfig
  ? toLegacyFormat().find((f) => f.slug === "reports") as FeatureMetadata | undefined
  : undefined

if (!reportsMetadata) {
  throw new Error("Reports feature not found in the feature registry")
}

// ============================================================================
// CONVEX HANDLERS (if applicable)
// ============================================================================

// These would be imported from convex/features/reports
// import * as queries from "@/convex/features/reports/queries"
// import * as mutations from "@/convex/features/reports/mutations"

const convexHandlers = {
  // queries,
  // mutations,
}

// ============================================================================
// FEATURE REGISTRATION
// ============================================================================

/**
 * Register the Reports feature
 *
 * This function should be called during app initialization to:
 * - Register the feature with the menu system
 * - Make it available in the Menu Store catalog (if optional)
 * - Set up any necessary Convex handlers
 *
 * Usage:
 * ```ts
 * import { registerReportsFeature } from '@/lib/features/examples/reports-feature-example'
 *
 * // In app initialization
 * registerReportsFeature()
 * ```
 */
export const registerReportsFeature = createFeatureRegistration({
  slug: "reports",
  metadata: reportsMetadata,
  convexHandlers,
})

// ============================================================================
// EXPORTS
// ============================================================================

// Export everything needed by the feature
export { default as ReportsPage } from "@/frontend/slices/reports/views/ReportsPage"
export { useReports } from "@/frontend/slices/reports/hooks/useReports"
export * from "@/frontend/slices/reports/types"

// Default export for convenience
export default registerReportsFeature
