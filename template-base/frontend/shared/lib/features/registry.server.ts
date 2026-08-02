/**
 * Feature Registry - Server-Side Loader
 *
 * This file provides feature discovery for Node.js scripts
 * (sync-features.ts, generate-manifest.ts, etc.)
 *
 * Uses fs to read config files instead of Vite's import.meta.glob
 */

import { glob } from 'glob'
import path from 'path'
import type { FeatureConfig } from './defineFeature'

interface FeatureMeta {
  slug: string
  featureDir: string
  configPath: string
}

function attachFeatureMeta(
  feature: FeatureConfig,
  meta: FeatureMeta,
  metaMap: Map<string, FeatureMeta>,
): void {
  Object.defineProperty(feature, '__meta', {
    value: meta,
    enumerable: false,
    configurable: true,
  })
  metaMap.set(feature.id, meta)
  if (feature.children && feature.children.length > 0) {
    feature.children.forEach(child => attachFeatureMeta(child, meta, metaMap))
  }
}

// ============================================================================
// SERVER-SIDE DISCOVERY
// ============================================================================

let cachedFeatures: FeatureConfig[] | null = null

function replaceLoadedFeatures(features: FeatureConfig[], metaMap: Map<string, FeatureMeta>): FeatureConfig[] {
  FEATURES.splice(0, FEATURES.length, ...features)
  FEATURE_META_MAP = metaMap
  cachedFeatures = FEATURES
  return FEATURES
}

/**
 * Load all feature configs from filesystem
 */
export async function loadFeatures(): Promise<FeatureConfig[]> {
  if (cachedFeatures) {
    return cachedFeatures
  }

  const rootDir = process.cwd()
  // Support both config.ts and config/index.ts patterns
  const configFilesRoot = glob.sync('frontend/slices/*/config.ts', {
    cwd: rootDir,
    absolute: true,
  })
  const configFilesNested = glob.sync('frontend/slices/*/config/index.ts', {
    cwd: rootDir,
    absolute: true,
  })
  // Combine and dedupe (prefer root config.ts if both exist)
  const seenDirs = new Set<string>()
  const configFiles: string[] = []
  for (const f of configFilesRoot) {
    const featureDir = path.dirname(f)
    seenDirs.add(featureDir)
    configFiles.push(f)
  }
  for (const f of configFilesNested) {
    const featureDir = path.dirname(path.dirname(f)) // config/index.ts -> feature dir
    if (!seenDirs.has(featureDir)) {
      configFiles.push(f)
    }
  }

  const features: FeatureConfig[] = []
  const metaMap = new Map<string, FeatureMeta>()

  for (const configPath of configFiles) {
    try {
      // Dynamic import for ESM/TS files
      const loadedModule = await import(configPath)
      if (loadedModule.default) {
        const feature = loadedModule.default as FeatureConfig
        // Handle both config.ts and config/index.ts paths
        const featureDir = configPath.endsWith('config/index.ts') 
          ? path.dirname(path.dirname(configPath))
          : path.dirname(configPath)
        const meta: FeatureMeta = {
          slug: path.basename(featureDir),
          featureDir,
          configPath,
        }
        attachFeatureMeta(feature, meta, metaMap)
        features.push(feature)
      } else {
        console.warn(`No default export in ${configPath}`)
      }
    } catch (error) {
      console.error(`Error loading ${configPath}:`, error)
    }
  }

  // Sort by order
  features.sort((a, b) => a.ui.order - b.ui.order)

  return replaceLoadedFeatures(features, metaMap)
}

/**
 * Synchronous version for scripts
 */
export function loadFeaturesSync(): FeatureConfig[] {
  const rootDir = process.cwd()
  // Support both config.ts and config/index.ts patterns
  const configFilesRoot = glob.sync('frontend/slices/*/config.ts', {
    cwd: rootDir,
    absolute: true,
  })
  const configFilesNested = glob.sync('frontend/slices/*/config/index.ts', {
    cwd: rootDir,
    absolute: true,
  })
  // Combine and dedupe (prefer root config.ts if both exist)
  const seenDirs = new Set<string>()
  const configFiles: string[] = []
  for (const f of configFilesRoot) {
    const featureDir = path.dirname(f)
    seenDirs.add(featureDir)
    configFiles.push(f)
  }
  for (const f of configFilesNested) {
    const featureDir = path.dirname(path.dirname(f)) // config/index.ts -> feature dir
    if (!seenDirs.has(featureDir)) {
      configFiles.push(f)
    }
  }

  const features: FeatureConfig[] = []
  const metaMap = new Map<string, FeatureMeta>()

  for (const configPath of configFiles) {
    try {
      // Use require for sync loading
      delete require.cache[configPath] // Clear cache
      const loadedModule = require(configPath)
      if (loadedModule.default) {
        const feature = loadedModule.default as FeatureConfig
        // Handle both config.ts and config/index.ts paths
        const featureDir = configPath.endsWith('config/index.ts') || configPath.endsWith('config\\index.ts')
          ? path.dirname(path.dirname(configPath))
          : path.dirname(configPath)
        const meta: FeatureMeta = {
          slug: path.basename(featureDir),
          featureDir,
          configPath,
        }
        attachFeatureMeta(feature, meta, metaMap)
        features.push(feature)
      } else {
        console.warn(`No default export in ${configPath}`)
      }
    } catch (error) {
      console.error(`Error loading ${configPath}:`, error)
    }
  }

  // Sort by order
  features.sort((a, b) => a.ui.order - b.ui.order)

  return replaceLoadedFeatures(features, metaMap)
}

// ============================================================================
// REGISTRY API (same as client version)
// ============================================================================

const FEATURES: FeatureConfig[] = []
let FEATURE_META_MAP: Map<string, FeatureMeta> = new Map()

function ensureLoaded() {
  if (FEATURES.length === 0) {
    loadFeaturesSync()
  }
}

export function getFeatureMeta(id: string): FeatureMeta | undefined {
  ensureLoaded()
  return FEATURE_META_MAP.get(id)
}

export function getFeatureSourceDir(id: string): string | undefined {
  return getFeatureMeta(id)?.featureDir
}

export function getFeatureSlug(id: string): string | undefined {
  return getFeatureMeta(id)?.slug
}

export function getAllFeatures(): FeatureConfig[] {
  ensureLoaded()
  return FEATURES
}

export function getFeatureById(id: string): FeatureConfig | undefined {
  ensureLoaded()
  const findFeature = (features: FeatureConfig[]): FeatureConfig | undefined => {
    for (const feature of features) {
      if (feature.id === id) return feature
      if (feature.children) {
        const found = findFeature(feature.children)
        if (found) return found
      }
    }
    return undefined
  }
  return findFeature(FEATURES)
}

export function getFeaturesByCategory(category: string): FeatureConfig[] {
  ensureLoaded()
  return FEATURES.filter(f => f.ui.category === category)
}

export function getFeaturesByType(
  type: 'default' | 'system' | 'optional' | 'experimental'
): FeatureConfig[] {
  ensureLoaded()
  return FEATURES.filter(f => f.technical.featureType === type)
}

export function getFeaturesByStatus(
  status: 'stable' | 'beta' | 'development' | 'experimental' | 'deprecated'
): FeatureConfig[] {
  ensureLoaded()
  return FEATURES.filter(f => f.status.state === status)
}

export function getReadyFeatures(): FeatureConfig[] {
  ensureLoaded()
  return FEATURES.filter(f => f.status.isReady)
}

export function getAllFeatureIds(): string[] {
  ensureLoaded()
  const collectIds = (features: FeatureConfig[]): string[] => {
    return features.flatMap(f => [f.id, ...(f.children ? collectIds(f.children) : [])])
  }
  return collectIds(FEATURES)
}

export function validateRegistry(): { valid: boolean; errors: string[] } {
  ensureLoaded()
  const errors: string[] = []
  const ids = getAllFeatureIds()
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)

  if (duplicates.length > 0) {
    errors.push(`Duplicate feature IDs found: ${duplicates.join(', ')}`)
  }

  const paths = FEATURES.map(f => f.ui.path)
  const duplicatePaths = paths.filter((path, index) => paths.indexOf(path) !== index)
  if (duplicatePaths.length > 0) {
    errors.push(`Duplicate paths found: ${duplicatePaths.join(', ')}`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Backward compatibility
export const FEATURES_REGISTRY = FEATURES
export const DISCOVERED_FEATURES = FEATURES

export type { FeatureMeta }
