/**
 * Test New Feature Registry System
 *
 * This script tests the new auto-discovery feature registry
 * and contrasts it with the legacy compatibility layer that still exists for old imports.
 * Also validates bundle configurations.
 */

import {
  getAllFeatures,
  getFeatureById,
  getFeaturesByCategory,
  getFeaturesByType,
  validateRegistry,
  DISCOVERED_FEATURES,
} from '../../frontend/shared/lib/features/registry.server'

// Bundle IDs (should match lib/features/defineFeature.ts)
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

console.log('🧪 Testing New Feature Registry System\n')
console.log('='.repeat(60))

// ============================================================================
// TEST 1: Auto-Discovery
// ============================================================================

console.log('\n📦 TEST 1: Auto-Discovery')
console.log('-'.repeat(60))

const allFeatures = getAllFeatures()
console.log(`✅ Discovered ${allFeatures.length} features:`)
allFeatures.forEach(f => {
  console.log(`   - ${f.id} (${f.name})`)
  if (f.children) {
    f.children.forEach(c => {
      console.log(`     └─ ${c.id} (${c.name})`)
    })
  }
})

// ============================================================================
// TEST 2: Validation
// ============================================================================

console.log('\n✅ TEST 2: Validation')
console.log('-'.repeat(60))

const validation = validateRegistry()
if (validation.valid) {
  console.log('✅ All features valid - no duplicates or conflicts')
} else {
  console.log('❌ Validation errors:')
  validation.errors.forEach(err => console.log(`   - ${err}`))
}

// ============================================================================
// TEST 3: Query API
// ============================================================================

console.log('\n🔍 TEST 3: Query API')
console.log('-'.repeat(60))

// Get by ID
const database = getFeatureById('database')
console.log(`Get by ID ('database'): ${database ? '✅ Found' : '❌ Not found'}`)
if (database) {
  console.log(`   Name: ${database.name}`)
  console.log(`   Path: ${database.ui.path}`)
  console.log(`   Children: ${database.children?.length || 0}`)
}

// Get by category
const creativityFeatures = getFeaturesByCategory('creativity')
console.log(`\nGet by category ('creativity'): Found ${creativityFeatures.length}`)
creativityFeatures.forEach(f => {
  console.log(`   - ${f.name}`)
})

// Get by type
const optionalFeatures = getFeaturesByType('optional')
console.log(`\nGet by type ('optional'): Found ${optionalFeatures.length}`)

// ============================================================================
// TEST 4: Feature Type Breakdown
// ============================================================================

console.log('\n TEST 4: Feature Type Breakdown')
console.log('-'.repeat(60))

const allDefault = getFeaturesByType('default')
const allSystem = getFeaturesByType('system')
const allOptional = getFeaturesByType('optional')
const allExperimental = getFeaturesByType('experimental')

console.log(`✅ Default: ${allDefault.length}`)
console.log(`✅ System: ${allSystem.length}`)
console.log(`✅ Optional: ${allOptional.length}`)
console.log(`✅ Experimental: ${allExperimental.length}`)
console.log(`✅ Total: ${allFeatures.length}`)

// ============================================================================
// TEST 5: Feature Details
// ============================================================================

console.log('\n📝 TEST 5: Feature Details')
console.log('-'.repeat(60))

DISCOVERED_FEATURES.forEach(feature => {
  console.log(`\n${feature.name} (${feature.id})`)
  console.log(`  Category: ${feature.ui.category}`)
  console.log(`  Type: ${feature.technical.featureType}`)
  console.log(`  Status: ${feature.status.state} (ready: ${feature.status.isReady})`)
  console.log(`  Path: ${feature.ui.path}`)
  console.log(`  Permissions: ${feature.permissions?.length || 0}`)
  console.log(`  Tags: ${feature.tags?.join(', ') || 'none'}`)

  // Show bundle membership
  if (feature.bundles) {
    const totalBundles = (feature.bundles.core?.length || 0) +
      (feature.bundles.recommended?.length || 0) +
      (feature.bundles.optional?.length || 0)
    console.log(`  Bundles: ${totalBundles} total`)
    if (feature.bundles.core?.length) {
      console.log(`    Core: ${feature.bundles.core.join(', ')}`)
    }
    if (feature.bundles.recommended?.length) {
      console.log(`    Recommended: ${feature.bundles.recommended.join(', ')}`)
    }
    if (feature.bundles.optional?.length) {
      console.log(`    Optional: ${feature.bundles.optional.join(', ')}`)
    }
  } else {
    console.log(`  Bundles: none configured`)
  }
})

// ============================================================================
// TEST 6: Bundle Configuration
// ============================================================================

console.log('\n🎯 TEST 6: Bundle Configuration')
console.log('-'.repeat(60))

// Collect features per bundle
const bundleFeatures: Record<string, { core: string[], recommended: string[], optional: string[] }> = {}
BUNDLE_IDS.forEach(id => {
  bundleFeatures[id] = { core: [], recommended: [], optional: [] }
})

DISCOVERED_FEATURES.forEach(feature => {
  if (!feature.bundles) return

  feature.bundles.core?.forEach(bundleId => {
    if (bundleFeatures[bundleId]) {
      bundleFeatures[bundleId].core.push(feature.id)
    }
  })

  feature.bundles.recommended?.forEach(bundleId => {
    if (bundleFeatures[bundleId]) {
      bundleFeatures[bundleId].recommended.push(feature.id)
    }
  })

  feature.bundles.optional?.forEach(bundleId => {
    if (bundleFeatures[bundleId]) {
      bundleFeatures[bundleId].optional.push(feature.id)
    }
  })
})

// Display bundle breakdown
console.log('\nBundle Feature Breakdown:')
BUNDLE_IDS.forEach(bundleId => {
  const features = bundleFeatures[bundleId]
  const total = features.core.length + features.recommended.length + features.optional.length

  console.log(`\n📦 ${bundleId} (${total} features):`)
  if (features.core.length > 0) {
    console.log(`  🔒 Core (${features.core.length}): ${features.core.join(', ')}`)
  }
  if (features.recommended.length > 0) {
    console.log(`  ✅ Recommended (${features.recommended.length}): ${features.recommended.join(', ')}`)
  }
  if (features.optional.length > 0) {
    console.log(`  ⚙️  Optional (${features.optional.length}): ${features.optional.join(', ')}`)
  }
  if (total === 0) {
    console.log(`  ⚠️  No features configured for this bundle!`)
  }
})

// Validate bundle configurations
console.log('\n\nBundle Validation:')
let bundleErrors = 0

DISCOVERED_FEATURES.forEach(feature => {
  if (feature.technical.featureType === 'system') return

  if (!feature.bundles) {
    console.log(`  ⚠️  ${feature.id}: Missing bundle configuration`)
    bundleErrors++
    return
  }

  const allBundles = [
    ...(feature.bundles.core || []),
    ...(feature.bundles.recommended || []),
    ...(feature.bundles.optional || []),
  ]

  if (allBundles.length === 0) {
    console.log(`  ⚠️  ${feature.id}: No bundles specified`)
    bundleErrors++
    return
  }

  // Check for invalid bundle IDs
  allBundles.forEach(bundleId => {
    if (!BUNDLE_IDS.includes(bundleId as BundleId)) {
      console.log(`  ❌ ${feature.id}: Invalid bundle ID "${bundleId}"`)
      bundleErrors++
    }
  })

  // Check for duplicates across categories
  const seen = new Set<string>()
  allBundles.forEach(bundleId => {
    if (seen.has(bundleId)) {
      console.log(`  ❌ ${feature.id}: Duplicate bundle ID "${bundleId}"`)
      bundleErrors++
    }
    seen.add(bundleId)
  })
})

if (bundleErrors === 0) {
  console.log('  ✅ All bundle configurations are valid!')
} else {
  console.log(`\n  ❌ Found ${bundleErrors} bundle configuration issues`)
}

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(60))
console.log('📊 SUMMARY')
console.log('='.repeat(60))

const readyCount = DISCOVERED_FEATURES.filter(f => f.status.isReady).length
const totalChildren = DISCOVERED_FEATURES.reduce(
  (sum, f) => sum + (f.children?.length || 0),
  0
)
const featuresWithBundles = DISCOVERED_FEATURES.filter(
  f => f.bundles && (
    (f.bundles.core?.length || 0) +
    (f.bundles.recommended?.length || 0) +
    (f.bundles.optional?.length || 0) > 0
  )
).length

console.log(`Total Features: ${DISCOVERED_FEATURES.length}`)
console.log(`Ready Features: ${readyCount}/${DISCOVERED_FEATURES.length}`)
console.log(`Total Child Routes: ${totalChildren}`)
console.log(`Features with Bundles: ${featuresWithBundles}/${DISCOVERED_FEATURES.length}`)
console.log(`Validation: ${validation.valid ? '✅ PASS' : '❌ FAIL'}`)
console.log(`Bundle Config: ${bundleErrors === 0 ? '✅ PASS' : `❌ ${bundleErrors} issues`}`)

// ============================================================================
// COMPARISON WITH LEGACY COMPATIBILITY
// ============================================================================

console.log('\n' + '='.repeat(60))
console.log(' COMPARISON: Registry vs Legacy Compatibility')
console.log('='.repeat(60))

console.log('\n🆕 NEW SYSTEM (Auto-Discovery):')
console.log('   ✅ Zero config outside feature folders')
console.log('   ✅ Type-safe with Zod validation')
console.log('   ✅ Auto-discovers new features')
console.log('   ✅ Single source of truth per feature')
console.log(`   📦 Features discovered: ${DISCOVERED_FEATURES.length}`)

console.log('\n🗄️  LEGACY COMPATIBILITY (features.config.ts):')
console.log('   ⚠️ Read-only wrapper for older imports')
console.log('   ✅ Now hydrated from the registry output')
console.log('   ⚠️ Not a source of truth')
console.log('   ⚠️ Keep changes in frontend/slices/{slug}/config.ts')

console.log('\n' + '='.repeat(60))
console.log('✅ Test Complete!')
console.log('='.repeat(60))
