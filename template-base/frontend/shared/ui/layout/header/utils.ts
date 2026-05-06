/**
 * Header Utilities
 * 
 * Shared utility functions for the header system.
 * These are extracted to avoid duplication across header components.
 */

import { getDashboardRouteInfo } from "@/frontend/shared/ui/layout/dashboard/dashboard-routes";

// ============================================================================
// Feature Detection
// ============================================================================

/**
 * Slugs that should NOT be treated as features
 * (e.g., workspace settings, payment pages)
 */
export const EXCLUDED_FEATURE_SLUGS = ["workspace", "payment-gated", "home"] as const

/**
 * Extract active feature slug from pathname
 * 
 * @example
 * getActiveFeatureSlug("/dashboard/documents") // "documents"
 * getActiveFeatureSlug("/dashboard/workspace") // null (excluded)
 * getActiveFeatureSlug("/dashboard") // null
 */
export function getActiveFeatureSlug(pathname: string | null): string | null {
  const routeInfo = getDashboardRouteInfo(pathname)
  const slug = routeInfo.slug

  if (slug) {
    if (EXCLUDED_FEATURE_SLUGS.includes(slug as typeof EXCLUDED_FEATURE_SLUGS[number])) {
      return null
    }

    return slug
  }

  return null
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Convert a slug to a human-readable display name
 * 
 * @example
 * slugToDisplayName("my-feature") // "My Feature"
 * slugToDisplayName("documents") // "Documents"
 */
export function slugToDisplayName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Get page title from pathname
 */
export function getPageTitle(pathname: string | null): string {
  const routeInfo = getDashboardRouteInfo(pathname)

  if (routeInfo.base && routeInfo.isOverview) {
    return "Overview"
  }

  const safePathname = pathname ?? ""
  switch (safePathname) {
    case "/dashboard":
    case "/mock-dashboard":
      return "Overview"
    case "/dashboard/payment-gated":
      return "Payment gated"
    default:
      return "Overview"
  }
}
