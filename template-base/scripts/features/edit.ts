#!/usr/bin/env node
/**
 * Feature Edit Script (CRUD - Update)
 *
 * Edits an existing feature configuration with optional maintenance mode.
 * Supports lookup by feature id and frontend folder slug.
 *
 * Usage: pnpm run edit:feature <slug|feature-id> [options]
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from "fs"
import { join } from "path"
import { getAllFeatures, getFeatureMeta } from "../../frontend/shared/lib/features/registry.server"

interface EditOptions {
  slug: string
  maintenance?: boolean
  setReady?: boolean
  status?: "development" | "beta" | "stable" | "deprecated"
  version?: string
  name?: string
  description?: string
  icon?: string
  permissions?: string[]
  rollback?: boolean
}

interface ResolvedFeatureTarget {
  featureId: string
  frontendSlug: string
  configPath: string
}

function parseArgs(): EditOptions {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Feature Edit CLI

Usage: pnpm run edit:feature <slug|feature-id> [options]

Arguments:
  slug                Feature slug or feature id to edit

Options:
  --maintenance       Put feature in maintenance mode (users will see maintenance message)
  --no-maintenance    Remove maintenance mode
  --set-ready         Set isReady status: true|false
  --status            Set development status: development|beta|stable|deprecated
  --version           Update version (semver, e.g., 2.0.0)
  --name              Update display name
  --description       Update description
  --icon              Update icon (Lucide React icon name)
  --permissions       Update permissions (comma-separated)
  --rollback          Rollback to backup version (if exists)
  --backup            Create backup before editing

Examples:
  pnpm run edit:feature analytics --maintenance
  pnpm run edit:feature analytics --set-ready true --status stable
  pnpm run edit:feature analytics --version 2.0.0 --backup
  pnpm run edit:feature analytics --rollback
  pnpm run edit:feature analytics --name "Advanced Analytics" --icon BarChart3
    `)
    process.exit(0)
  }

  const slug = args[0]
  if (!slug || slug.startsWith("--")) {
    console.error("Error: Feature slug is required")
    console.error("Usage: pnpm run edit:feature <slug|feature-id> [options]")
    process.exit(1)
  }

  const getArg = (flag: string): string | undefined => {
    const index = args.indexOf(flag)
    return index !== -1 && args[index + 1] ? args[index + 1] : undefined
  }

  const hasFlag = (flag: string): boolean => args.includes(flag)

  const maintenance = hasFlag("--maintenance")
    ? true
    : hasFlag("--no-maintenance")
      ? false
      : undefined
  const setReadyArg = getArg("--set-ready")
  const setReady = setReadyArg ? setReadyArg === "true" : undefined
  const status = getArg("--status") as EditOptions["status"]
  const version = getArg("--version")
  const name = getArg("--name")
  const description = getArg("--description")
  const icon = getArg("--icon")
  const permissionsArg = getArg("--permissions")
  const permissions = permissionsArg ? permissionsArg.split(",").map((p) => p.trim()) : undefined
  const rollback = hasFlag("--rollback")

  return {
    slug,
    maintenance,
    setReady,
    status,
    version,
    name,
    description,
    icon,
    permissions,
    rollback,
  }
}

function flattenFeatures(features: any[]): any[] {
  return features.flatMap((feature) => [feature, ...(feature.children ? flattenFeatures(feature.children) : [])])
}

function resolveFeatureTarget(input: string): ResolvedFeatureTarget {
  const rootDir = process.cwd()
  const allFeatures = flattenFeatures(getAllFeatures())

  const byId = allFeatures.find((feature) => feature.id === input)
  if (byId) {
    const meta = getFeatureMeta(byId.id)
    const frontendSlug = meta?.slug ?? byId.id
    return {
      featureId: byId.id,
      frontendSlug,
      configPath: join(rootDir, "frontend", "slices", frontendSlug, "config.ts"),
    }
  }

  for (const feature of allFeatures) {
    const meta = getFeatureMeta(feature.id)
    if (meta?.slug === input) {
      return {
        featureId: feature.id,
        frontendSlug: meta.slug,
        configPath: join(rootDir, "frontend", "slices", meta.slug, "config.ts"),
      }
    }
  }

  return {
    featureId: input,
    frontendSlug: input,
    configPath: join(rootDir, "frontend", "slices", input, "config.ts"),
  }
}

function createBackup(configPath: string): string {
  const backupPath = configPath.replace(".ts", ".backup.ts")
  copyFileSync(configPath, backupPath)
  return backupPath
}

function restoreBackup(configPath: string, backupPath: string): void {
  if (!existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`)
  }
  copyFileSync(backupPath, configPath)
}

function updateConfigFile(
  configPath: string,
  updates: Partial<EditOptions>,
  previousVersion?: string
): void {
  let content = readFileSync(configPath, "utf-8")

  if (updates.name) {
    content = content.replace(/name: ['"].*?['"]/, `name: '${updates.name}'`)
  }

  if (updates.description) {
    content = content.replace(/description: ['"].*?['"]/, `description: '${updates.description}'`)
  }

  if (updates.icon) {
    content = content.replace(/icon: ['"].*?['"]/, `icon: '${updates.icon}'`)
  }

  if (updates.version) {
    content = content.replace(/version: ['"].*?['"]/, `version: '${updates.version}'`)

    if (previousVersion && !content.includes("previousVersion:")) {
      content = content.replace(
        /version: ['"].*?['"]/,
        `version: '${updates.version}',\n    previousVersion: '${previousVersion}'`
      )
    } else if (previousVersion) {
      content = content.replace(/previousVersion: ['"].*?['"]/, `previousVersion: '${previousVersion}'`)
    }
  }

  if (updates.status) {
    content = content.replace(/state: ['"].*?['"]/, `state: '${updates.status}'`)
  }

  if (updates.setReady !== undefined) {
    content = content.replace(/isReady: (true|false)/, `isReady: ${updates.setReady}`)
  }

  if (updates.maintenance !== undefined) {
    if (content.includes("inMaintenance:")) {
      content = content.replace(/inMaintenance: (true|false)/, `inMaintenance: ${updates.maintenance}`)
    } else {
      content = content.replace(
        /status: \{/,
        `status: {\n    inMaintenance: ${updates.maintenance},`
      )
    }

    if (updates.maintenance && !content.includes("maintenanceMessage:")) {
      const maintenanceMsg = "This feature is currently undergoing maintenance. Please check back later."
      content = content.replace(
        /inMaintenance: true,/,
        `inMaintenance: true,\n    maintenanceMessage: '${maintenanceMsg}',`
      )
    }
  }

  if (updates.permissions) {
    const permStr = JSON.stringify(updates.permissions, null, 4)
    if (content.includes("permissions:")) {
      content = content.replace(/permissions: \[[\s\S]*?\]/, `permissions: ${permStr}`)
    } else {
      content = content.replace(/tags: \[[\s\S]*?\]/, (match) => `${match},\n\n  permissions: ${permStr}`)
    }
  }

  writeFileSync(configPath, content)
}

function main() {
  console.log("Feature Edit Script\n")

  const options = parseArgs()
  const { slug: input, rollback } = options

  const resolved = resolveFeatureTarget(input)
  const { featureId, frontendSlug, configPath } = resolved
  const backupPath = configPath.replace(".ts", ".backup.ts")

  if (!existsSync(configPath)) {
    console.error(`Error: Feature "${input}" not found`)
    console.error(`Expected: ${configPath}`)
    console.error("Tip: Run 'pnpm run list:features' to see available features")
    process.exit(1)
  }

  if (rollback) {
    console.log(`Rolling back feature "${featureId}" to backup version...`)

    if (!existsSync(backupPath)) {
      console.error(`Error: No backup found for "${featureId}"`)
      console.error(`Expected: ${backupPath}`)
      process.exit(1)
    }

    restoreBackup(configPath, backupPath)
    console.log("Rolled back to backup successfully")
    console.log("\nNext steps:")
    console.log("1. Run 'pnpm run sync:all' to sync changes")
    console.log("2. Run 'pnpm run validate:features' to validate\n")
    return
  }

  const currentContent = readFileSync(configPath, "utf-8")
  const versionMatch = currentContent.match(/version: ['"]([^'"]+)['"]/) 
  const currentVersion = versionMatch ? versionMatch[1] : undefined

  if (process.argv.includes("--backup") || options.version) {
    console.log("Creating backup...")
    const backup = createBackup(configPath)
    console.log(`Backup created: ${backup}`)
  }

  console.log(`Editing feature: ${featureId}`)
  if (featureId !== frontendSlug) {
    console.log(`Frontend folder: ${frontendSlug}`)
  }
  console.log(`Location: ${configPath}\n`)

  const updates: Partial<EditOptions> = {}
  const changes: string[] = []

  if (options.maintenance !== undefined) {
    updates.maintenance = options.maintenance
    changes.push(`Maintenance mode: ${options.maintenance ? "ENABLED" : "DISABLED"}`)
  }
  if (options.setReady !== undefined) {
    updates.setReady = options.setReady
    changes.push(`Ready status: ${options.setReady ? "READY" : "NOT READY"}`)
  }
  if (options.status) {
    updates.status = options.status
    changes.push(`Status: ${options.status}`)
  }
  if (options.version) {
    updates.version = options.version
    changes.push(`Version: ${currentVersion} -> ${options.version}`)
  }
  if (options.name) {
    updates.name = options.name
    changes.push(`Name: ${options.name}`)
  }
  if (options.description) {
    updates.description = options.description
    changes.push(`Description: ${options.description}`)
  }
  if (options.icon) {
    updates.icon = options.icon
    changes.push(`Icon: ${options.icon}`)
  }
  if (options.permissions) {
    updates.permissions = options.permissions
    changes.push(`Permissions: ${options.permissions.join(", ")}`)
  }

  if (changes.length === 0) {
    console.log("No changes specified. Use --help to see available options.")
    process.exit(0)
  }

  console.log("Changes to apply:")
  changes.forEach((change) => console.log(`- ${change}`))
  console.log("")

  updateConfigFile(configPath, updates, currentVersion)

  console.log("Feature updated successfully\n")

  if (options.maintenance) {
    console.log("Maintenance Mode ENABLED")
    console.log("Users will see a maintenance message when accessing this feature")
    console.log("Previous version will be used until maintenance is disabled\n")
  }

  console.log("Next steps:")
  console.log(`1. Review changes in: ${configPath}`)
  console.log("2. Run 'pnpm run sync:all' to sync changes")
  console.log("3. Run 'pnpm run validate:features' to validate")

  if (options.maintenance) {
    console.log(`4. When done, run: pnpm run edit:feature ${featureId} --no-maintenance`)
  }

  if (existsSync(backupPath)) {
    console.log(`\nBackup available: ${backupPath}`)
    console.log(`To rollback: pnpm run edit:feature ${featureId} --rollback`)
  }

  console.log("")
}

main()
