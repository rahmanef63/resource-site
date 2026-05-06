/**
 * @deprecated This manual feature registration layer is superseded by the auto-discovery
 * system in `registry.ts`. New features should use `defineFeature()` in `config.ts` and
 * rely on automatic discovery via `getAllFeatures()`. This file is kept for backward
 * compatibility only and will be removed once all legacy consumers are migrated.
 *
 * @see frontend/shared/lib/features/registry.ts
 * @see frontend/shared/lib/features/defineFeature.ts
 */

// Local re-declaration so this file no longer depends on the legacy features.config.ts
export type FeatureMenuType = "route" | "folder" | "divider" | "action" | "chat" | "document"
export type FeatureType = "default" | "system" | "optional" | "experimental"

export interface FeatureMetadata {
  slug: string
  name: string
  description: string
  icon: string
  path: string
  component: string
  order: number
  type: FeatureMenuType
  version: string
  category: string
  featureType: FeatureType
  tags?: string[]
  requiresPermission?: string
  hasUI?: boolean
  hasConvex?: boolean
  hasTests?: boolean
  generationMode?: "full-json" | "hybrid-json" | "engine-owned"
  sharedEngineId?: string
  status?: string
  isReady?: boolean
  children?: FeatureMetadata[]
}

// ============================================================================
// TYPES
// ============================================================================

export interface FeatureManifest {
  slug: string
  name: string
  description: string
  icon: string
  path: string
  component: string
  order: number
  type: "route" | "folder" | "divider" | "action" | "chat" | "document"
  requiresPermission?: string
  children?: FeatureManifest[]
}

export interface FeatureConvexHandlers {
  queries?: Record<string, any>
  mutations?: Record<string, any>
  actions?: Record<string, any>
}

export interface FeatureCatalogEntry {
  slug: string
  name: string
  description: string
  icon: string
  version: string
  category: string
  tags?: string[]
  requiresPermission?: string
}

export interface FeatureRegistrationOptions {
  slug: string
  metadata: FeatureMetadata
  manifest?: FeatureManifest
  convexHandlers?: FeatureConvexHandlers
  catalog?: FeatureCatalogEntry
}

// ============================================================================
// FEATURE REGISTRY
// ============================================================================

class FeatureRegistry {
  private features = new Map<string, FeatureRegistrationOptions>()

  register(options: FeatureRegistrationOptions) {
    if (this.features.has(options.slug)) {
      console.warn(`Feature '${options.slug}' is already registered. Overwriting...`)
    }

    this.features.set(options.slug, options)
    return this
  }

  get(slug: string): FeatureRegistrationOptions | undefined {
    return this.features.get(slug)
  }

  getAll(): FeatureRegistrationOptions[] {
    return Array.from(this.features.values())
  }

  getAllByType(type: "default" | "system" | "optional" | "experimental"): FeatureRegistrationOptions[] {
    return this.getAll().filter(f => f.metadata.featureType === type)
  }

  getManifests(): FeatureManifest[] {
    return this.getAll()
      .filter(f => f.manifest)
      .map(f => f.manifest!)
      .sort((a, b) => a.order - b.order)
  }

  getCatalog(): FeatureCatalogEntry[] {
    return this.getAll()
      .filter(f => f.catalog)
      .map(f => f.catalog!)
  }

  has(slug: string): boolean {
    return this.features.has(slug)
  }

  clear() {
    this.features.clear()
  }
}

// Global registry instance
const registry = new FeatureRegistry()

// ============================================================================
// REGISTRATION FUNCTIONS
// ============================================================================

/**
 * Register a feature with the system
 *
 * This is the main entry point for feature registration.
 * It handles:
 * - Adding the feature to the registry
 * - Validating the feature metadata
 * - Setting up default values
 */
export function registerFeature(options: FeatureRegistrationOptions) {
  // Validate slug
  if (!options.slug || !/^[a-z0-9-]+$/.test(options.slug)) {
    throw new Error(`Invalid feature slug: ${options.slug}`)
  }

  // Set defaults
  const defaultManifest: FeatureManifest = {
    slug: options.slug,
    name: options.metadata.name,
    description: options.metadata.description,
    icon: options.metadata.icon,
    path: options.metadata.path,
    component: options.metadata.component,
    order: options.metadata.order,
    type: options.metadata.type,
    requiresPermission: options.metadata.requiresPermission,
  }

  const defaultCatalog: FeatureCatalogEntry = {
    slug: options.slug,
    name: options.metadata.name,
    description: options.metadata.description,
    icon: options.metadata.icon,
    version: options.metadata.version,
    category: options.metadata.category,
    tags: options.metadata.tags,
    requiresPermission: options.metadata.requiresPermission,
  }

  registry.register({
    ...options,
    manifest: options.manifest || defaultManifest,
    catalog: options.catalog || (options.metadata.featureType === "optional" ? defaultCatalog : undefined),
  })

  return registry
}

/**
 * Get the global feature registry
 */
export function getFeatureRegistry(): FeatureRegistry {
  return registry
}

/**
 * Helper to register multiple features at once
 */
export function registerFeatures(features: FeatureRegistrationOptions[]) {
  features.forEach(feature => registerFeature(feature))
  return registry
}

/**
 * Create a feature registration helper for a specific feature
 *
 * This creates a scoped registration function that includes
 * all the necessary metadata for a single feature.
 *
 * Example:
 * ```ts
 * // In frontend/slices/reports/index.ts
 * export const registerReportsFeature = createFeatureRegistration({
 *   slug: 'reports',
 *   metadata: { ... },
 * })
 *
 * // Then in app initialization:
 * registerReportsFeature()
 * ```
 */
export function createFeatureRegistration(options: FeatureRegistrationOptions) {
  return () => registerFeature(options)
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get all registered manifests (for menu rendering)
 */
export function getRegisteredManifests(): FeatureManifest[] {
  return registry.getManifests()
}

/**
 * Get all registered catalog entries (for Menu Store)
 */
export function getRegisteredCatalog(): FeatureCatalogEntry[] {
  return registry.getCatalog()
}

/**
 * Get default features (included by default)
 */
export function getDefaultFeatures(): FeatureRegistrationOptions[] {
  return registry.getAllByType("default")
}

/**
 * Get optional features (available in catalog)
 */
export function getOptionalFeatures(): FeatureRegistrationOptions[] {
  return registry.getAllByType("optional")
}

/**
 * Get system features
 */
export function getSystemFeatures(): FeatureRegistrationOptions[] {
  return registry.getAllByType("system")
}

/**
 * Check if a feature is registered
 */
export function isFeatureRegistered(slug: string): boolean {
  return registry.has(slug)
}

/**
 * Get a registered feature by slug
 */
export function getRegisteredFeature(slug: string): FeatureRegistrationOptions | undefined {
  return registry.get(slug)
}
