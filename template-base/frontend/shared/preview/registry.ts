/**
 * Feature Preview Registry
 * 
 * Central registry for all feature previews.
 * Features register their preview components and mock data here.
 */

import type { ComponentType } from 'react'
import type { 
  FeaturePreviewConfig, 
  FeaturePreviewProps,
  FeaturePreviewMockData,
  FeaturePreviewCategory 
} from './types'

// Registry storage
const previewRegistry = new Map<string, FeaturePreviewConfig>()

/**
 * Register a feature preview
 */
export function registerFeaturePreview(config: FeaturePreviewConfig): void {
  if (previewRegistry.has(config.featureId)) {
    console.warn(`[FeaturePreviewRegistry] Preview for "${config.featureId}" already registered, overwriting...`)
  }
  previewRegistry.set(config.featureId, config)
}

/**
 * Get a feature preview config by ID
 */
export function getFeaturePreview(featureId: string): FeaturePreviewConfig | undefined {
  return previewRegistry.get(featureId)
}

/**
 * Get all registered feature previews
 */
export function getAllFeaturePreviews(): FeaturePreviewConfig[] {
  return Array.from(previewRegistry.values())
}

/**
 * Get feature previews by category
 */
export function getFeaturePreviewsByCategory(category: FeaturePreviewCategory): FeaturePreviewConfig[] {
  return getAllFeaturePreviews().filter(p => p.category === category)
}

/**
 * Check if a feature has a preview
 */
export function hasFeaturePreview(featureId: string): boolean {
  return previewRegistry.has(featureId)
}

/**
 * Get feature IDs that have previews
 */
export function getFeatureIdsWithPreviews(): string[] {
  return Array.from(previewRegistry.keys())
}

/**
 * Helper to define a feature preview (for use in feature modules)
 */
export function defineFeaturePreview(config: {
  featureId: string
  name: string
  description: string
  component: ComponentType<FeaturePreviewProps>
  mockDataSets: FeaturePreviewMockData[]
  defaultMockDataId?: string
  thumbnailUrl?: string
  category: FeaturePreviewCategory
  tags?: string[]
}): FeaturePreviewConfig {
  const previewConfig: FeaturePreviewConfig = {
    ...config,
    defaultMockDataId: config.defaultMockDataId || config.mockDataSets[0]?.id,
  }
  
  // Auto-register on definition
  registerFeaturePreview(previewConfig)
  
  return previewConfig
}

/**
 * Unregister a feature preview (for testing/cleanup)
 */
export function unregisterFeaturePreview(featureId: string): boolean {
  return previewRegistry.delete(featureId)
}

/**
 * Clear all registered previews (for testing)
 */
export function clearPreviewRegistry(): void {
  previewRegistry.clear()
}
