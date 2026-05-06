#!/usr/bin/env node
/**
 * Feature Validation Script
 *
 * Validates feature configs to ensure:
 * - All features follow the correct schema
 * - No duplicate slugs exist
 * - All required fields are present
 * - Feature versions are valid semver
 * - Icon names are valid (if strict mode)
 * - No circular dependencies
 *
 * Usage: pnpm run validate:features
 */

import { existsSync, readFileSync } from "fs"
import { join } from "path"
import { getAllFeatures, getFeatureMeta, validateRegistry } from "../../frontend/shared/lib/features/registry.server"
import { FEATURE_UI_CATEGORIES } from "../../lib/features/constants"

const FEATURES_REGISTRY = getAllFeatures()

// ============================================================================
// VALIDATION
// ============================================================================

interface ValidationError {
  feature: string
  field?: string
  message: string
  severity: "error" | "warning"
}

const errors: ValidationError[] = []

function addError(error: ValidationError) {
  errors.push(error)
}

function validateSchema() {


  const flattenFeatures = (features: any[], parent?: string): any[] => {
    return features.flatMap(f => {
      const current = { ...f, parent }
      const children = f.children ? flattenFeatures(f.children, f.id) : []
      return [current, ...children]
    })
  }

  const allFeatures = flattenFeatures(FEATURES_REGISTRY)

  // Use the registry's built-in validation
  const validation = validateRegistry()
  if (!validation.valid) {
    validation.errors.forEach(error => {
      addError({
        feature: "registry",
        message: error,
        severity: "error",
      })
    })
  }


}

function validateDuplicateSlugs() {


  const slugs = new Map<string, number>()
  const flattenFeatures = (features: any[]): any[] => {
    return features.flatMap(f => [f, ...(f.children ? flattenFeatures(f.children) : [])])
  }

  flattenFeatures(FEATURES_REGISTRY).forEach(feature => {
    const count = slugs.get(feature.id) || 0
    slugs.set(feature.id, count + 1)
  })

  slugs.forEach((count, slug) => {
    if (count > 1) {
      addError({
        feature: slug,
        message: `Duplicate slug found ${count} times`,
        severity: "error",
      })
    }
  })


}

function validateVersions() {


  const semverRegex = /^\d+\.\d+\.\d+$/

  FEATURES_REGISTRY.forEach(feature => {
    if (!semverRegex.test(feature.technical.version)) {
      addError({
        feature: feature.id,
        field: "version",
        message: `Invalid version format: ${feature.technical.version}. Must be semver (e.g., 1.0.0)`,
        severity: "error",
      })
    }
  })


}

function validatePaths() {


  const paths = new Map<string, string>()

  FEATURES_REGISTRY.forEach(feature => {
    if (!feature.ui.path.startsWith("/dashboard/")) {
      addError({
        feature: feature.id,
        field: "path",
        message: `Path must start with /dashboard/: ${feature.ui.path}`,
        severity: "warning",
      })
    }

    const existing = paths.get(feature.ui.path)
    if (existing) {
      addError({
        feature: feature.id,
        field: "path",
        message: `Duplicate path ${feature.ui.path} shared with ${existing}`,
        severity: "error",
      })
    }

    paths.set(feature.ui.path, feature.id)
  })


}

function validateComponents() {


  const components = new Map<string, string[]>()

  FEATURES_REGISTRY.forEach(feature => {
    if (!feature.ui.component) {
      addError({
        feature: feature.id,
        field: "component",
        message: "Component is required",
        severity: "error",
      })
      return
    }

    if (!feature.ui.component.endsWith("Page")) {
      addError({
        feature: feature.id,
        field: "component",
        message: `Component should end with 'Page': ${feature.ui.component}`,
        severity: "warning",
      })
    }

    const slugs = components.get(feature.ui.component) || []
    slugs.push(feature.id)
    components.set(feature.ui.component, slugs)
  })

  // Warn about component reuse (not necessarily an error)
  components.forEach((slugs, component) => {
    if (slugs.length > 1) {
      addError({
        feature: slugs.join(", "),
        field: "component",
        message: `Component ${component} is reused by multiple features`,
        severity: "warning",
      })
    }
  })


}

function validateDependencies() {


  const allSlugs = new Set(
    FEATURES_REGISTRY.flatMap(f => [f.id, ...(f.children?.map(c => c.id) || [])])
  )

  FEATURES_REGISTRY.forEach(feature => {
    if (!feature.dependencies) return

    feature.dependencies.forEach(dep => {
      if (!allSlugs.has(dep)) {
        addError({
          feature: feature.id,
          field: "dependencies",
          message: `Dependency '${dep}' not found in registry`,
          severity: "error",
        })
      }
    })
  })


}

function validateFeatureFolders() {


  const flattenFeatures = (features: any[], parent?: string): any[] => {
    return features.flatMap((f) => {
      const current = { ...f, parent }
      const children = f.children ? flattenFeatures(f.children, f.id) : []
      return [current, ...children]
    })
  }

  const rootDir = process.cwd()
  const allFeatures = flattenFeatures(FEATURES_REGISTRY)

  const toConvexSlug = (slug: string) =>
    slug.includes("-")
      ? slug
        .split("-")
        .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
        .join("")
      : slug

  const toConvexSlugCandidates = (slug: string) => {
    const candidates = [toConvexSlug(slug), slug, slug.replace(/-/g, "_")]
    return [...new Set(candidates)].filter(Boolean)
  }

  for (const feature of allFeatures) {
    const slug = feature.id as string
    const isChildFeature = Boolean(feature.parent)
    const hasUI = Boolean(feature?.technical?.hasUI)
    const hasConvex = Boolean(feature?.technical?.hasConvex)

    if (hasUI && !isChildFeature) {
      const meta = getFeatureMeta(slug)
      const base = meta?.featureDir ?? join(rootDir, "frontend", "slices", slug)
      const frontendDirName = meta?.slug ?? slug
      const settingsDir = join(base, "settings")
      const agentsDir = join(base, "agents")
      const agentDir = join(base, "agent")
      const initFile = join(base, "init.ts")

      if (!existsSync(settingsDir)) {
        addError({
          feature: slug,
          field: "frontend/settings",
          message: `Missing mandatory folder: frontend/slices/${frontendDirName}/settings/`,
          severity: "warning",
        })
      }
      if (!existsSync(agentsDir) && !existsSync(agentDir)) {
        addError({
          feature: slug,
          field: "frontend/agents",
          message: `Missing mandatory folder: frontend/slices/${frontendDirName}/agent/ (or legacy agents/)`,
          severity: "warning",
        })
      }
      if (!existsSync(initFile)) {
        addError({
          feature: slug,
          field: "frontend/init",
          message: `Missing recommended init file: frontend/slices/${frontendDirName}/init.ts (used for settings/agent registration)`,
          severity: "warning",
        })
      }
    }

    if (hasConvex && !isChildFeature) {
      const convexSlug = toConvexSlug(slug)
      const convexSlugs = toConvexSlugCandidates(slug)
      const bases = convexSlugs.map((s) => join(rootDir, "convex", "features", s))
      const agentsDirs = bases.map((b) => join(b, "agents"))

      const legacyAgentFiles = bases.map((b) => join(b, "agent.ts"))
      const definitionPath = feature?.agent?.definitionPath
        ? join(rootDir, String(feature.agent.definitionPath))
        : null

      const hasAnyAgentSurface =
        agentsDirs.some((d) => existsSync(d)) ||
        legacyAgentFiles.some((f) => existsSync(f)) ||
        (definitionPath ? existsSync(definitionPath) : false)

      if (!hasAnyAgentSurface) {
        addError({
          feature: slug,
          field: "convex/agents",
          message: `Missing agent surface: convex/features/${convexSlug}/agents/ (or agent.ts or agent.definitionPath)`,
          severity: "warning",
        })
      }
    }
  }


}

function validateFeaturePreviews() {


  const rootDir = process.cwd()

  FEATURES_REGISTRY.forEach(feature => {
    if (!feature.technical?.hasUI) {
      return
    }

    const meta = getFeatureMeta(feature.id)
    const featureDir = meta?.featureDir ?? join(rootDir, "frontend", "slices", feature.id)
    const previewDir = join(featureDir, "features-preview")
    const previewPath = [join(previewDir, "index.tsx"), join(previewDir, "index.ts")].find(existsSync)

    if (!previewPath) {
      addError({
        feature: feature.id,
        field: "frontend/slices-preview",
        message: `Missing required preview definition: ${previewDir}/index.tsx`,
        severity: "error",
      })
      return
    }

    const previewSource = readFileSync(previewPath, "utf8")

    if (!previewSource.includes("defineFeaturePreview(")) {
      addError({
        feature: feature.id,
        field: "frontend/slices-preview",
        message: `Preview must register itself with defineFeaturePreview(): ${previewPath.replace(`${rootDir}/`, "")}`,
        severity: "error",
      })
      return
    }

    const featureIdMatch = previewSource.match(/featureId:\s*['"]([^'"]+)['"]/)

    if (!featureIdMatch) {
      addError({
        feature: feature.id,
        field: "frontend/slices-preview",
        message: `Preview must declare featureId in ${previewPath.replace(`${rootDir}/`, "")}`,
        severity: "error",
      })
      return
    }

    if (featureIdMatch[1] !== feature.id) {
      addError({
        feature: feature.id,
        field: "frontend/slices-preview",
        message: `Preview featureId "${featureIdMatch[1]}" must match config id "${feature.id}"`,
        severity: "error",
      })
    }
  })


}

function validateCategories() {


  const validCategories = [...FEATURE_UI_CATEGORIES]

  FEATURES_REGISTRY.forEach(feature => {
    if (!validCategories.includes(feature.ui.category)) {
      addError({
        feature: feature.id,
        field: "category",
        message: `Invalid category: ${feature.ui.category}. Must be one of: ${validCategories.join(", ")}`,
        severity: "error",
      })
    }
  })


}

function generateReport() {


  const errorCount = errors.filter(e => e.severity === "error").length
  const warningCount = errors.filter(e => e.severity === "warning").length

  if (errors.length === 0) {

    return true
  }



  // Group by severity
  const errorsByFeature = new Map<string, ValidationError[]>()

  errors.forEach(error => {
    const list = errorsByFeature.get(error.feature) || []
    list.push(error)
    errorsByFeature.set(error.feature, list)
  })

  // Display errors
  if (errorCount > 0) {
    errors
      .filter(e => e.severity === "error")
      .forEach(error => {
        const field = error.field ? ` [${error.field}]` : ""
        console.error(`  - ${error.feature}${field}: ${error.message}`)
      })
  }

  // Display warnings
  if (warningCount > 0) {
    errors
      .filter(e => e.severity === "warning")
      .forEach(error => {
        const field = error.field ? ` [${error.field}]` : ""
        console.warn(`  - ${error.feature}${field}: ${error.message}`)
      })
  }

  return errorCount === 0
}

// ============================================================================
// MAIN
// ============================================================================

function main() {


  try {
    validateSchema()
    validateDuplicateSlugs()
    validateVersions()
    validatePaths()
    validateComponents()
    validateDependencies()
    validateFeatureFolders()
    validateFeaturePreviews()
    validateCategories()

    const isValid = generateReport()



    if (!isValid) {
      console.error("❌ Feature validation failed. Please fix the errors above.\n")
      process.exit(1)
    }


    process.exit(0)
  } catch (error) {
    console.error("\n❌ Unexpected error during validation:")
    console.error(error)
    process.exit(1)
  }
}

main()
