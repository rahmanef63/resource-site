import { PAGE_MANIFEST_MAP, RESOURCE_TO_FEATURE_MAP } from "@/frontend/shared/foundation/manifest/registry"

/**
 * Navigation Utilities
 * 
 * Centralized helper for generating routes.
 * Used to eliminate hardcoded paths across the application.
 */

/**
 * Get route for a specific feature by resource type
 * Uses the Feature Registry to dynamically resolve paths
 * 
 * @param type Feature type or resource alias (e.g. 'document', 'doc', 'task')
 * @param id Optional resource ID
 * @returns Full path or undefined if feature not found
 */
export function getFeatureRoute(type: string, id?: string): string | undefined {
    // 1. Resolve feature ID from type/alias
    const featureId = RESOURCE_TO_FEATURE_MAP[type] || type
    const feature = PAGE_MANIFEST_MAP[featureId]

    if (!feature) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[getFeatureRoute] Unknown resource type: "${type}"`)
        }
        return undefined
    }

    // 2. Check for specific sub-route pattern (e.g. 'invoice' -> 'invoices/:id')
    if (id && feature.patterns?.[type]) {
        const subPattern = feature.patterns[type]
        const subPath = subPattern.replace(':id', id)
        // Avoid double slashes if path ends with /
        const basePath = feature.path.endsWith('/') ? feature.path.slice(0, -1) : feature.path
        return `${basePath}/${subPath}`
    }

    // 3. Fallback to standard REST-like path (feature/id)
    if (id) {
        const basePath = feature.path.endsWith('/') ? feature.path.slice(0, -1) : feature.path
        return `${basePath}/${id}`
    }

    return feature.path
}
