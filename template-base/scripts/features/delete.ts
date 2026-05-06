#!/usr/bin/env node
/**
 * Feature Delete Script (CRUD - Delete)
 *
 * Safely deletes a feature from the system.
 * Supports lookup by feature id and frontend folder slug.
 *
 * Usage: pnpm run delete:feature <slug|feature-id> [options]
 */

import { rmSync, existsSync, renameSync, mkdirSync } from "fs"
import { dirname, join } from "path"
import { getAllFeatures, getFeatureMeta } from "../../frontend/shared/lib/features/registry.server"

interface DeleteOptions {
  slug: string
  confirm: boolean
  keepData: boolean
  archive: boolean
}

interface ResolvedFeatureTarget {
  featureId: string
  frontendSlug: string
  featureDir: string
  convexDir: string
  testsDir: string
}

function parseArgs(): DeleteOptions {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Feature Delete CLI

Usage: pnpm run delete:feature <slug|feature-id> [options]

Arguments:
  slug                Feature slug or feature id to delete

Options:
  --confirm           Required: Confirm deletion (safety check)
  --keep-data         Keep Convex data (only remove code)
  --archive           Archive feature instead of deleting

Examples:
  pnpm run delete:feature my-feature --confirm
  pnpm run delete:feature my-feature --confirm --keep-data
  pnpm run delete:feature my-feature --archive

WARNING: This will permanently delete the feature code.
Use --archive to move it to archive/ folder instead.
    `)
    process.exit(0)
  }

  const slug = args[0]
  if (!slug || slug.startsWith("--")) {
    console.error("Error: Feature slug is required")
    console.error("Usage: pnpm run delete:feature <slug|feature-id> --confirm")
    process.exit(1)
  }

  const confirm = args.includes("--confirm")
  const keepData = args.includes("--keep-data")
  const archive = args.includes("--archive")

  return { slug, confirm, keepData, archive }
}

function flattenFeatures(features: any[]): any[] {
  return features.flatMap((feature) => [feature, ...(feature.children ? flattenFeatures(feature.children) : [])])
}

function toConvexSlug(slug: string): string {
  return slug.includes("-")
    ? slug
      .split("-")
      .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
      .join("")
    : slug
}

function firstExistingPath(paths: string[]): string | undefined {
  return paths.find((path) => existsSync(path))
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function resolveFeatureTarget(input: string): ResolvedFeatureTarget {
  const rootDir = process.cwd()
  const allFeatures = flattenFeatures(getAllFeatures())

  let featureId = input
  let frontendSlug = input

  const byId = allFeatures.find((feature) => feature.id === input)
  if (byId) {
    featureId = byId.id
    frontendSlug = getFeatureMeta(byId.id)?.slug ?? byId.id
  } else {
    for (const feature of allFeatures) {
      const meta = getFeatureMeta(feature.id)
      if (meta?.slug === input) {
        featureId = feature.id
        frontendSlug = meta.slug
        break
      }
    }
  }

  const meta = getFeatureMeta(featureId)
  if (meta?.slug) {
    frontendSlug = meta.slug
  }

  const featureDir = meta?.featureDir ?? join(rootDir, "frontend", "slices", frontendSlug)

  const convexCandidates = unique([
    join(rootDir, "convex", "features", toConvexSlug(featureId)),
    join(rootDir, "convex", "features", featureId),
    join(rootDir, "convex", "features", featureId.replace(/-/g, "_")),
    join(rootDir, "convex", "features", toConvexSlug(frontendSlug)),
    join(rootDir, "convex", "features", frontendSlug),
  ])

  const testsCandidates = unique([
    join(rootDir, "tests", "features", featureId),
    join(rootDir, "tests", "features", frontendSlug),
    join(rootDir, "tests", "features", input),
  ])

  const convexDir = firstExistingPath(convexCandidates) ?? convexCandidates[0]
  const testsDir = firstExistingPath(testsCandidates) ?? testsCandidates[0]

  return {
    featureId,
    frontendSlug,
    featureDir,
    convexDir,
    testsDir,
  }
}

function archiveFeature(featureId: string, featureDir: string, convexDir: string, testsDir: string): void {
  const rootDir = process.cwd()
  const archiveBase = join(rootDir, "archive", "features", featureId)
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const archivePath = `${archiveBase}-${timestamp}`

  console.log(`Archiving feature to: ${archivePath}`)

  const movedTargets: Array<{ from: string; to: string; label: string }> = []
  if (existsSync(featureDir)) {
    movedTargets.push({ from: featureDir, to: join(archivePath, "frontend"), label: "frontend" })
  }
  if (existsSync(convexDir)) {
    movedTargets.push({ from: convexDir, to: join(archivePath, "convex"), label: "convex" })
  }
  if (existsSync(testsDir)) {
    movedTargets.push({ from: testsDir, to: join(archivePath, "tests"), label: "tests" })
  }

  for (const target of movedTargets) {
    mkdirSync(dirname(target.to), { recursive: true })
    renameSync(target.from, target.to)
    console.log(`Archived ${target.label}: ${target.from}`)
  }

  console.log("\nFeature archived successfully")
  console.log(`Location: ${archivePath}`)
  console.log("Tip: Move folders back to original locations to restore")
}

function deleteFeature(featureDir: string, convexDir: string, testsDir: string, keepData: boolean): void {
  let deleted = 0

  if (existsSync(featureDir)) {
    rmSync(featureDir, { recursive: true, force: true })
    console.log(`Deleted frontend: ${featureDir}`)
    deleted += 1
  }

  if (!keepData && existsSync(convexDir)) {
    rmSync(convexDir, { recursive: true, force: true })
    console.log(`Deleted convex handlers: ${convexDir}`)
    deleted += 1
  } else if (keepData && existsSync(convexDir)) {
    console.log(`Skipped convex handlers (--keep-data): ${convexDir}`)
  }

  if (existsSync(testsDir)) {
    rmSync(testsDir, { recursive: true, force: true })
    console.log(`Deleted tests: ${testsDir}`)
    deleted += 1
  }

  if (deleted === 0) {
    console.log("No files found to delete")
  }
}

function main() {
  console.log("Feature Delete Script\n")

  const options = parseArgs()
  const { slug: input, confirm, keepData, archive } = options

  if (!confirm && !archive) {
    console.error("Error: --confirm flag is required for safety")
    console.error("This will permanently delete the feature")
    console.error(`Usage: pnpm run delete:feature ${input} --confirm`)
    console.error(`Or use: pnpm run delete:feature ${input} --archive`)
    process.exit(1)
  }

  const resolved = resolveFeatureTarget(input)
  const { featureId, frontendSlug, featureDir, convexDir, testsDir } = resolved

  if (!existsSync(featureDir)) {
    console.error(`Error: Feature "${input}" not found`)
    console.error(`Expected frontend folder: ${featureDir}`)
    console.error("Tip: Run 'pnpm run list:features' to see available features")
    process.exit(1)
  }

  console.log(`Feature ID: ${featureId}`)
  if (frontendSlug !== featureId) {
    console.log(`Frontend folder: ${frontendSlug}`)
  }
  console.log(`Frontend: ${existsSync(featureDir) ? "EXISTS" : "NOT FOUND"} (${featureDir})`)
  console.log(`Convex: ${existsSync(convexDir) ? "EXISTS" : "NOT FOUND"} (${convexDir})`)
  console.log(`Tests: ${existsSync(testsDir) ? "EXISTS" : "NOT FOUND"} (${testsDir})`)
  console.log("")

  try {
    const allFeatures = flattenFeatures(getAllFeatures())
    const feature = allFeatures.find((f) => f.id === featureId)

    if (feature) {
      console.log("Warning: This feature is currently registered in the system")
      console.log(`Type: ${feature.technical.featureType}`)
      console.log(`Status: ${feature.status.state} (${feature.status.isReady ? "ready" : "not ready"})`)
      console.log("")
    }
  } catch {
    // Continue even if registry lookup fails.
  }

  if (archive) {
    console.log("ARCHIVE MODE: Feature will be moved to archive/")
  } else {
    console.log("WARNING: This will permanently delete feature code")
    if (keepData) {
      console.log("Convex code/data handling skipped because --keep-data is set")
    }
  }

  console.log("")

  if (archive) {
    archiveFeature(featureId, featureDir, convexDir, testsDir)
  } else {
    console.log(`Deleting feature "${featureId}"...`)
    deleteFeature(featureDir, convexDir, testsDir, keepData)
    console.log("\nFeature deleted successfully")
  }

  console.log("\nNext steps:")
  console.log("1. Run 'pnpm run sync:all' to update manifests")
  console.log("2. Run 'pnpm run validate:features' to validate")

  if (!keepData) {
    console.log("3. Check Convex database for orphaned data")
    console.log(`4. Update any features that depend on "${featureId}"`)
  }

  if (archive) {
    console.log("\nTip: Move archived folders back to restore the feature")
  }

  console.log("")
}

main()
