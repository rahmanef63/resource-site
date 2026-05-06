#!/usr/bin/env node
/**
 * Feature Pages Validation Script
 *
 * Validates that all auto-discovered feature configs have corresponding page files.
 * This helps catch missing pages early during development.
 *
 * Usage: pnpm run validate:pages
 */

import { existsSync } from "fs"
import { join } from "path"
import { getAllFeatures } from "../../frontend/shared/lib/features/registry.server"

const FEATURES_REGISTRY = getAllFeatures()

const rootDir = process.cwd()

interface ValidationResult {
  slug: string
  name: string
  component: string
  expectedPath: string
  exists: boolean
  featureType: string
  isReady?: boolean
}

/**
 * ✅ 100% DYNAMIC - Auto-resolves expected page path from feature slug
 * NO hardcoding! All paths derived from feature folder structure
 */
function getExpectedPagePath(slug: string, component: string): string {
  // slug is the actual folder name (e.g., 'menu-store', not 'menus')
  // Check multiple possible locations (priority order)
  const possiblePaths = [
    `frontend/slices/${slug}/page.tsx`, // Next.js page component (MOST COMMON)
    `frontend/slices/${slug}/views/${component}.tsx`,
    `frontend/slices/${slug}/index.ts`,
    `frontend/views/static/${slug}/page.tsx`,
    `frontend/views/dynamic/${slug}/page.tsx`,
  ]

  // Return first existing path, or default to recommended structure
  for (const path of possiblePaths) {
    if (existsSync(join(rootDir, path))) {
      return path
    }
  }

  // Default: Recommended structure (views/{Component}.tsx)
  return `frontend/slices/${slug}/views/${component}.tsx`
}

function validateFeaturePages(): ValidationResult[] {
  const results: ValidationResult[] = []

  for (const feature of FEATURES_REGISTRY) {
    // Access metadata attached by registry.server.ts
    const meta = (feature as any).__meta
    const slug = meta?.slug || feature.id // Fallback to id if no slug
    const component = feature.ui.component

    const expectedPath = getExpectedPagePath(slug, component)
    const fullPath = join(rootDir, expectedPath)
    const exists = existsSync(fullPath)

    results.push({
      slug,
      name: feature.name,
      component,
      expectedPath,
      exists,
      featureType: feature.technical.featureType, // Fixed: was feature.featureType
      isReady: feature.status.isReady, // Fixed: was feature.isReady
    })
  }

  return results
}

function generateReport(results: ValidationResult[]) {


  const missing = results.filter(r => !r.exists)
  const existing = results.filter(r => r.exists)
  const missingOptional = missing.filter(r => r.featureType === "optional")
  const missingDefault = missing.filter(r => r.featureType === "default" || r.featureType === "system")



  if (missingDefault.length > 0) {

    missingDefault.forEach(r => {

    })
  }

  if (missingOptional.length > 0) {

    missingOptional.forEach(r => {
      const status = r.isReady ? "❌ READY but missing" : "⚠️  In development"

    })
  }

  if (missing.length === 0) {

  }

  // Group by feature type

  const byType = results.reduce((acc, r) => {
    if (!acc[r.featureType]) acc[r.featureType] = { total: 0, existing: 0 }
    acc[r.featureType].total++
    if (r.exists) acc[r.featureType].existing++
    return acc
  }, {} as Record<string, { total: number; existing: number }>)

  Object.entries(byType).forEach(([type, stats]) => {
    const emoji = stats.existing === stats.total ? "✅" : "⚠️ "

  })

  return missing.length === 0
}

function main() {


  const results = validateFeaturePages()
  const allValid = generateReport(results)



  if (!allValid) {

    process.exit(1)
  }


}

main()
