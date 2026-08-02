/**
 * Dynamic Workspace Bundle System
 *
 * 100% DYNAMIC - All bundle configurations are derived from feature configs.
 * NO HARDCODING! Features declare their bundle membership in their config.ts
 *
 * @see lib/features/defineFeature.ts for bundle schema
 * @see frontend/slices/[feature]/config.ts for feature bundle declarations
 */

import { getAllFeatures } from "@/frontend/shared/lib/features/registry"
import type { FeatureConfig } from "@/frontend/shared/lib/features/defineFeature"
import {
  FEATURE_BUNDLE_IDS,
  type FeatureBundleId as BundleId,
} from "@/lib/features/constants"
import type { WorkspaceType } from "../types"

// Re-export types
export type { BundleId }
export const BUNDLE_IDS = FEATURE_BUNDLE_IDS

/**
 * Available Feature ID type - any valid feature ID
 */
export type AvailableFeatureId = string

/**
 * Core features that are always enabled and cannot be disabled
 * These are features essential for workspace functionality
 */
export const CORE_FEATURES: readonly string[] = [
  'overview',
  'workspace-settings',
  'user-settings',
] as const

/**
 * Bundle Template Definition (Generated from feature configs)
 */
export interface WorkspaceBundleTemplate {
  id: BundleId
  name: string
  description: string
  icon: string
  category: 'productivity' | 'business' | 'personal' | 'creative' | 'education' | 'community'
  recommendedFor: WorkspaceType[]
  features: {
    core: string[]      // Always enabled, cannot be disabled
    recommended: string[] // Enabled by default, can be disabled
    optional: string[]    // Disabled by default, can be enabled
  }
  theme?: {
    primaryColor?: string
    accentColor?: string
  }
  tags: string[]
}

/**
 * Bundle metadata - static configuration for each bundle
 * This is the only static config - just metadata about bundles themselves
 */
const BUNDLE_METADATA: Record<BundleId, Omit<WorkspaceBundleTemplate, 'id' | 'features'>> = {
  // Business
  startup: {
    name: 'Startup',
    description: 'Everything you need to build and grow your startup',
    icon: 'Rocket',
    category: 'business',
    recommendedFor: ['organization', 'group'],
    theme: { primaryColor: '#6366f1' },
    tags: ['startup', 'team', 'agile', 'collaboration'],
  },
  'business-pro': {
    name: 'Business Pro',
    description: 'Complete business management suite for organizations',
    icon: 'Building2',
    category: 'business',
    recommendedFor: ['organization', 'institution'],
    theme: { primaryColor: '#0891b2' },
    tags: ['business', 'enterprise', 'management', 'crm'],
  },
  'sales-crm': {
    name: 'Sales & CRM',
    description: 'Customer relationship management and sales pipeline',
    icon: 'TrendingUp',
    category: 'business',
    recommendedFor: ['organization', 'group'],
    theme: { primaryColor: '#059669' },
    tags: ['sales', 'crm', 'pipeline', 'leads'],
  },

  // Productivity
  'project-management': {
    name: 'Project Management',
    description: 'Organize and track projects with your team',
    icon: 'Kanban',
    category: 'productivity',
    recommendedFor: ['organization', 'group', 'institution'],
    theme: { primaryColor: '#8b5cf6' },
    tags: ['projects', 'tasks', 'kanban', 'agile'],
  },
  'knowledge-base': {
    name: 'Knowledge Base',
    description: 'Document and share knowledge with your team',
    icon: 'BookOpen',
    category: 'productivity',
    recommendedFor: ['organization', 'institution', 'group'],
    theme: { primaryColor: '#f59e0b' },
    tags: ['wiki', 'docs', 'knowledge', 'documentation'],
  },

  // Personal
  'personal-minimal': {
    name: 'Personal Minimal',
    description: 'Clean and simple workspace for personal use',
    icon: 'User',
    category: 'personal',
    recommendedFor: ['personal'],
    theme: { primaryColor: '#64748b' },
    tags: ['personal', 'minimal', 'simple'],
  },
  'personal-productivity': {
    name: 'Personal Productivity',
    description: 'Full-featured personal productivity workspace',
    icon: 'Target',
    category: 'personal',
    recommendedFor: ['personal'],
    theme: { primaryColor: '#ec4899' },
    tags: ['personal', 'productivity', 'gtd'],
  },
  family: {
    name: 'Family Hub',
    description: 'Organize and connect with your family',
    icon: 'Heart',
    category: 'personal',
    recommendedFor: ['family'],
    theme: { primaryColor: '#f43f5e' },
    tags: ['family', 'home', 'shared'],
  },

  // Creative
  'content-creator': {
    name: 'Content Creator',
    description: 'Create and manage content with CMS and builder tools',
    icon: 'Palette',
    category: 'creative',
    recommendedFor: ['personal', 'organization', 'group'],
    theme: { primaryColor: '#a855f7' },
    tags: ['content', 'cms', 'blog', 'creative'],
  },
  'digital-agency': {
    name: 'Digital Agency',
    description: 'Manage clients, projects, and creative work',
    icon: 'Zap',
    category: 'creative',
    recommendedFor: ['organization', 'group'],
    theme: { primaryColor: '#06b6d4' },
    tags: ['agency', 'clients', 'creative', 'projects'],
  },

  // Education
  education: {
    name: 'Education',
    description: 'Learning management for schools and institutions',
    icon: 'GraduationCap',
    category: 'education',
    recommendedFor: ['institution', 'organization'],
    theme: { primaryColor: '#0ea5e9' },
    tags: ['education', 'learning', 'school', 'students'],
  },

  // Community
  community: {
    name: 'Community',
    description: 'Build and engage with your community',
    icon: 'Users',
    category: 'community',
    recommendedFor: ['group', 'organization'],
    theme: { primaryColor: '#22c55e' },
    tags: ['community', 'social', 'members', 'engagement'],
  },

  // Special
  custom: {
    name: 'Custom',
    description: 'Start from scratch and choose your own features',
    icon: 'Settings2',
    category: 'productivity',
    recommendedFor: ['personal', 'family', 'group', 'organization', 'institution'],
    tags: ['custom', 'flexible'],
  },
}

/**
 * Build bundle templates dynamically from feature configs
 */
function buildBundleFromFeatures(bundleId: BundleId, features: FeatureConfig[]): WorkspaceBundleTemplate {
  const metadata = BUNDLE_METADATA[bundleId]

  const coreFeatures: string[] = []
  const recommendedFeatures: string[] = []
  const optionalFeatures: string[] = []

  // Scan all features and categorize by their bundle membership
  features.forEach(feature => {
    if (!feature.bundles) return

    if (feature.bundles.core?.includes(bundleId)) {
      coreFeatures.push(feature.id)
    } else if (feature.bundles.recommended?.includes(bundleId)) {
      recommendedFeatures.push(feature.id)
    } else if (feature.bundles.optional?.includes(bundleId)) {
      optionalFeatures.push(feature.id)
    }
  })

  // For 'custom' bundle, all features with any bundle membership are optional
  if (bundleId === 'custom') {
    features.forEach(feature => {
      if (!feature.bundles) return
      if (coreFeatures.includes(feature.id)) return
      if (optionalFeatures.includes(feature.id)) return

      // Check if feature has any bundle membership
      const hasAnyBundleMembership =
        (feature.bundles.core?.length || 0) > 0 ||
        (feature.bundles.recommended?.length || 0) > 0 ||
        (feature.bundles.optional?.length || 0) > 0

      if (hasAnyBundleMembership) {
        optionalFeatures.push(feature.id)
      }
    })
  }

  return {
    id: bundleId,
    ...metadata,
    features: {
      core: coreFeatures,
      recommended: recommendedFeatures,
      optional: optionalFeatures,
    },
  }
}

/**
 * Get all workspace bundle templates (DYNAMIC)
 * Generated from feature configs at runtime
 */
export function getWorkspaceBundles(): WorkspaceBundleTemplate[] {
  const features = getAllFeatures()
  return BUNDLE_IDS.map(bundleId => buildBundleFromFeatures(bundleId, features))
}

/**
 * Cached bundles for performance
 */
let _cachedBundles: WorkspaceBundleTemplate[] | null = null

/**
 * Get all bundles (cached)
 */
export function getAllBundles(): WorkspaceBundleTemplate[] {
  if (!_cachedBundles) {
    _cachedBundles = getWorkspaceBundles()
  }
  return _cachedBundles
}

/**
 * Clear bundle cache (call after feature config changes)
 */
export function clearBundleCache(): void {
  _cachedBundles = null
}

/**
 * Get bundle by ID
 */
export function getBundleById(id: BundleId | string): WorkspaceBundleTemplate | undefined {
  return getAllBundles().find(b => b.id === id)
}

/**
 * Get bundles recommended for a workspace type
 */
export function getBundlesForWorkspaceType(type: WorkspaceType): WorkspaceBundleTemplate[] {
  return getAllBundles().filter(b => b.recommendedFor.includes(type))
}

/**
 * Get bundles by category
 */
export function getBundlesByCategory(category: WorkspaceBundleTemplate['category']): WorkspaceBundleTemplate[] {
  return getAllBundles().filter(b => b.category === category)
}

/**
 * Get all enabled features for a bundle (core + recommended)
 */
export function getBundleEnabledFeatures(bundle: WorkspaceBundleTemplate): string[] {
  return [...bundle.features.core, ...bundle.features.recommended]
}

/**
 * Get all available features for a bundle (core + recommended + optional)
 */
export function getBundleAllFeatures(bundle: WorkspaceBundleTemplate): string[] {
  return [...bundle.features.core, ...bundle.features.recommended, ...bundle.features.optional]
}

/**
 * Check if a feature is available in a bundle
 */
export function isFeatureInBundle(featureId: string, bundleId: BundleId | string): boolean {
  const bundle = getBundleById(bundleId)
  if (!bundle) return false
  return getBundleAllFeatures(bundle).includes(featureId)
}

/**
 * Get the role of a feature in a bundle
 */
export function getFeatureRoleInBundle(
  featureId: string,
  bundleId: BundleId | string
): 'core' | 'recommended' | 'optional' | null {
  const bundle = getBundleById(bundleId)
  if (!bundle) return null

  if (bundle.features.core.includes(featureId)) return 'core'
  if (bundle.features.recommended.includes(featureId)) return 'recommended'
  if (bundle.features.optional.includes(featureId)) return 'optional'
  return null
}

/**
 * Validate bundle configuration
 * Returns validation results for all bundles and features
 */
export function validateBundles(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  const bundles = getAllBundles()
  const features = getAllFeatures()
  const featureIds = new Set(features.map(f => f.id))

  bundles.forEach(bundle => {
    // Check for empty bundles (except custom)
    if (bundle.id !== 'custom') {
      const totalFeatures = getBundleAllFeatures(bundle).length
      if (totalFeatures === 0) {
        warnings.push(`Bundle "${bundle.id}" has no features`)
      }
    }

    // Check for invalid feature references
    getBundleAllFeatures(bundle).forEach(featureId => {
      if (!featureIds.has(featureId)) {
        errors.push(`Bundle "${bundle.id}" references unknown feature "${featureId}"`)
      }
    })
  })

  // Check for features without bundle membership
  features.forEach(feature => {
    if (feature.technical.featureType === 'system') return // System features are exempt

    const hasBundle = feature.bundles && (
      (feature.bundles.core?.length || 0) > 0 ||
      (feature.bundles.recommended?.length || 0) > 0 ||
      (feature.bundles.optional?.length || 0) > 0
    )

    if (!hasBundle) {
      warnings.push(`Feature "${feature.id}" has no bundle membership - won't appear in workspace templates`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// Backwards compatibility - export as WORKSPACE_BUNDLES for existing code
export const WORKSPACE_BUNDLES = getAllBundles()

// Log validation in development
if (process.env.NODE_ENV !== 'production') {
  const validation = validateBundles()
  if (!validation.valid) {
    console.error('Bundle Validation Errors:')
    validation.errors.forEach(err => console.error(`  ❌ ${err}`))
  }
  if (validation.warnings.length > 0) {
    console.warn('Bundle Validation Warnings:')
    validation.warnings.forEach(warn => console.warn(`  ⚠️ ${warn}`))
  }
}
