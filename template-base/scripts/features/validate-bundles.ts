#!/usr/bin/env tsx
/**
 * Bundle Validation Script
 *
 * Validates that all feature bundle configurations are correct and consistent.
 * This ensures the dynamic bundle system works properly.
 *
 * Usage: pnpm run validate:bundles
 *
 * Checks:
 * 1. All features have bundle configuration (except system features)
 * 2. Bundle IDs are valid
 * 3. No duplicate bundles across categories
 * 4. All bundles have at least some features
 * 5. Bundle membership is consistent with feature type
 */

import { getAllFeatures } from '../../frontend/shared/lib/features/registry.server'

// Bundle IDs (must match lib/features/defineFeature.ts)
const BUNDLE_IDS = [
  'startup',
  'business-pro',
  'sales-crm',
  'project-management',
  'knowledge-base',
  'personal-minimal',
  'personal-productivity',
  'family',
  'content-creator',
  'digital-agency',
  'education',
  'community',
  'custom',
] as const

type BundleId = typeof BUNDLE_IDS[number]

// Bundle metadata for validation
const BUNDLE_METADATA: Record<BundleId, { name: string; category: string; minFeatures: number }> = {
  'startup': { name: 'Startup Essentials', category: 'business', minFeatures: 5 },
  'business-pro': { name: 'Business Pro', category: 'business', minFeatures: 8 },
  'sales-crm': { name: 'Sales CRM', category: 'business', minFeatures: 5 },
  'project-management': { name: 'Project Management', category: 'productivity', minFeatures: 5 },
  'knowledge-base': { name: 'Knowledge Base', category: 'productivity', minFeatures: 4 },
  'personal-minimal': { name: 'Personal Minimal', category: 'personal', minFeatures: 3 },
  'personal-productivity': { name: 'Personal Productivity', category: 'personal', minFeatures: 5 },
  'family': { name: 'Family Hub', category: 'personal', minFeatures: 4 },
  'content-creator': { name: 'Content Creator', category: 'creative', minFeatures: 5 },
  'digital-agency': { name: 'Digital Agency', category: 'creative', minFeatures: 6 },
  'education': { name: 'Education', category: 'education', minFeatures: 4 },
  'community': { name: 'Community', category: 'community', minFeatures: 5 },
  'custom': { name: 'Custom', category: 'special', minFeatures: 0 },
}

interface ValidationError {
  type: 'error' | 'warning'
  featureId?: string
  bundleId?: string
  message: string
}

interface ValidationResult {
  errors: ValidationError[]
  warnings: ValidationError[]
  stats: {
    totalFeatures: number
    featuresWithBundles: number
    featuresWithoutBundles: number
    systemFeatures: number
    bundleCoverage: Record<string, number>
  }
}

function flattenFeatures(features: any[]): any[] {
  return features.flatMap(f => [f, ...(f.children ? flattenFeatures(f.children) : [])])
}

function validateBundles(): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Only validate top-level features.
  // Child features (feature.children) are treated as UI/route subdivisions that inherit
  // their parent's bundle membership and are not required to declare bundles.
  const allFeatures = getAllFeatures()

  // Track bundle membership
  const bundleFeatures: Record<BundleId, { core: string[], recommended: string[], optional: string[] }> = {} as any
  BUNDLE_IDS.forEach(id => {
    bundleFeatures[id] = { core: [], recommended: [], optional: [] }
  })

  let featuresWithBundles = 0
  let featuresWithoutBundles = 0
  let systemFeatures = 0

  // Validate each feature
  allFeatures.forEach(feature => {
    // System features don't need bundle configuration
    if (feature.technical?.featureType === 'system') {
      systemFeatures++
      return
    }

    const bundles = feature.bundles

    // Check if feature has any bundle configuration
    if (!bundles || (
      (bundles.core?.length || 0) === 0 &&
      (bundles.recommended?.length || 0) === 0 &&
      (bundles.optional?.length || 0) === 0
    )) {
      featuresWithoutBundles++
      warnings.push({
        type: 'warning',
        featureId: feature.id,
        message: `Feature has no bundle configuration - it won't appear in any workspace template`
      })
      return
    }

    featuresWithBundles++

    // Collect all bundle IDs for this feature
    const allBundleIds: string[] = []
    const seenBundles = new Set<string>()

    // Check core bundles
    bundles.core?.forEach((bundleId: string) => {
      allBundleIds.push(bundleId)

      if (!BUNDLE_IDS.includes(bundleId as BundleId)) {
        errors.push({
          type: 'error',
          featureId: feature.id,
          bundleId,
          message: `Invalid bundle ID "${bundleId}" in core bundles`
        })
      } else {
        bundleFeatures[bundleId as BundleId].core.push(feature.id)
      }

      if (seenBundles.has(bundleId)) {
        errors.push({
          type: 'error',
          featureId: feature.id,
          bundleId,
          message: `Bundle "${bundleId}" appears multiple times in different categories`
        })
      }
      seenBundles.add(bundleId)
    })

    // Check recommended bundles
    bundles.recommended?.forEach((bundleId: string) => {
      allBundleIds.push(bundleId)

      if (!BUNDLE_IDS.includes(bundleId as BundleId)) {
        errors.push({
          type: 'error',
          featureId: feature.id,
          bundleId,
          message: `Invalid bundle ID "${bundleId}" in recommended bundles`
        })
      } else {
        bundleFeatures[bundleId as BundleId].recommended.push(feature.id)
      }

      if (seenBundles.has(bundleId)) {
        errors.push({
          type: 'error',
          featureId: feature.id,
          bundleId,
          message: `Bundle "${bundleId}" appears multiple times in different categories`
        })
      }
      seenBundles.add(bundleId)
    })

    // Check optional bundles
    bundles.optional?.forEach((bundleId: string) => {
      allBundleIds.push(bundleId)

      if (!BUNDLE_IDS.includes(bundleId as BundleId)) {
        errors.push({
          type: 'error',
          featureId: feature.id,
          bundleId,
          message: `Invalid bundle ID "${bundleId}" in optional bundles`
        })
      } else {
        bundleFeatures[bundleId as BundleId].optional.push(feature.id)
      }

      if (seenBundles.has(bundleId)) {
        errors.push({
          type: 'error',
          featureId: feature.id,
          bundleId,
          message: `Bundle "${bundleId}" appears multiple times in different categories`
        })
      }
      seenBundles.add(bundleId)
    })

    // Feature type vs bundle membership consistency
    if (feature.technical?.featureType === 'default' && (bundles.optional?.length || 0) > 0 && (bundles.core?.length || 0) === 0 && (bundles.recommended?.length || 0) === 0) {
      warnings.push({
        type: 'warning',
        featureId: feature.id,
        message: `Default feature is only in optional bundles - consider adding to core or recommended bundles`
      })
    }
  })

  // Check bundle coverage
  const bundleCoverage: Record<string, number> = {}

  BUNDLE_IDS.forEach(bundleId => {
    const features = bundleFeatures[bundleId]
    const total = features.core.length + features.recommended.length + features.optional.length
    bundleCoverage[bundleId] = total

    const meta = BUNDLE_METADATA[bundleId]

    if (total < meta.minFeatures && bundleId !== 'custom') {
      warnings.push({
        type: 'warning',
        bundleId,
        message: `Bundle "${meta.name}" has only ${total} features (minimum expected: ${meta.minFeatures})`
      })
    }

    if (features.core.length === 0 && bundleId !== 'custom') {
      warnings.push({
        type: 'warning',
        bundleId,
        message: `Bundle "${meta.name}" has no core features`
      })
    }
  })

  return {
    errors,
    warnings,
    stats: {
      totalFeatures: allFeatures.length,
      featuresWithBundles,
      featuresWithoutBundles,
      systemFeatures,
      bundleCoverage,
    }
  }
}

function printBundleReport(bundleFeatures: Record<BundleId, { core: string[], recommended: string[], optional: string[] }>) {
  console.log('\n📦 Bundle Feature Report')
  console.log('='.repeat(60))

  const categories = ['business', 'productivity', 'personal', 'creative', 'education', 'community', 'special']

  categories.forEach(category => {
    const bundles = BUNDLE_IDS.filter(id => BUNDLE_METADATA[id].category === category)
    if (bundles.length === 0) return

    console.log(`\n📁 ${category.toUpperCase()}`)
    console.log('-'.repeat(40))

    bundles.forEach(bundleId => {
      const meta = BUNDLE_METADATA[bundleId]
      const features = bundleFeatures[bundleId]
      const total = features.core.length + features.recommended.length + features.optional.length

      console.log(`\n  🏷️  ${meta.name} (${bundleId})`)
      console.log(`      Total: ${total} features`)

      if (features.core.length > 0) {
        console.log(`      🔒 Core (${features.core.length}):`)
        features.core.forEach(id => console.log(`         - ${id}`))
      }

      if (features.recommended.length > 0) {
        console.log(`      ✅ Recommended (${features.recommended.length}):`)
        features.recommended.forEach(id => console.log(`         - ${id}`))
      }

      if (features.optional.length > 0) {
        console.log(`      ⚙️  Optional (${features.optional.length}):`)
        features.optional.forEach(id => console.log(`         - ${id}`))
      }
    })
  })
}

function main() {
  console.log('🔍 Bundle Validation Script')
  console.log('='.repeat(60))
  console.log('Validating feature bundle configurations...\n')

  const result = validateBundles()

  // Print errors
  if (result.errors.length > 0) {
    console.log('\n❌ ERRORS')
    console.log('-'.repeat(40))
    result.errors.forEach(err => {
      const location = err.featureId
        ? `[${err.featureId}]`
        : err.bundleId
          ? `[Bundle: ${err.bundleId}]`
          : ''
      console.log(`  ${location} ${err.message}`)
    })
  }

  // Print warnings
  if (result.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS')
    console.log('-'.repeat(40))
    result.warnings.forEach(warn => {
      const location = warn.featureId
        ? `[${warn.featureId}]`
        : warn.bundleId
          ? `[Bundle: ${warn.bundleId}]`
          : ''
      console.log(`  ${location} ${warn.message}`)
    })
  }

  // Print statistics
  console.log('\n📊 STATISTICS')
  console.log('-'.repeat(40))
  console.log(`  Total features: ${result.stats.totalFeatures}`)
  console.log(`  Features with bundles: ${result.stats.featuresWithBundles}`)
  console.log(`  Features without bundles: ${result.stats.featuresWithoutBundles}`)
  console.log(`  System features (no bundle needed): ${result.stats.systemFeatures}`)

  console.log('\n  Bundle coverage:')
  Object.entries(result.stats.bundleCoverage)
    .sort((a, b) => b[1] - a[1])
    .forEach(([bundleId, count]) => {
      const meta = BUNDLE_METADATA[bundleId as BundleId]
      const status = count >= meta.minFeatures ? '✅' : count > 0 ? '⚠️' : '❌'
      console.log(`    ${status} ${bundleId}: ${count} features (min: ${meta.minFeatures})`)
    })

  // Build bundle features for report
  const allFeatures = getAllFeatures()
  const bundleFeatures: Record<BundleId, { core: string[], recommended: string[], optional: string[] }> = {} as any
  BUNDLE_IDS.forEach(id => {
    bundleFeatures[id] = { core: [], recommended: [], optional: [] }
  })

  allFeatures.forEach(feature => {
    if (!feature.bundles) return
    feature.bundles.core?.forEach((id: string) => {
      if (bundleFeatures[id as BundleId]) bundleFeatures[id as BundleId].core.push(feature.id)
    })
    feature.bundles.recommended?.forEach((id: string) => {
      if (bundleFeatures[id as BundleId]) bundleFeatures[id as BundleId].recommended.push(feature.id)
    })
    feature.bundles.optional?.forEach((id: string) => {
      if (bundleFeatures[id as BundleId]) bundleFeatures[id as BundleId].optional.push(feature.id)
    })
  })

  // Print detailed report
  printBundleReport(bundleFeatures)

  // Final summary
  console.log('\n' + '='.repeat(60))
  if (result.errors.length === 0) {
    console.log('✅ VALIDATION PASSED')
    if (result.warnings.length > 0) {
      console.log(`   (with ${result.warnings.length} warnings)`)
    }
  } else {
    console.log('❌ VALIDATION FAILED')
    console.log(`   ${result.errors.length} errors, ${result.warnings.length} warnings`)
    process.exit(1)
  }
  console.log('='.repeat(60))
}

main()
