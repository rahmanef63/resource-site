#!/usr/bin/env tsx

/**
 * Add Export/Import to Feature Script
 *
 * This script adds export/import support to existing features:
 * 1. Creates data/ folder if it doesn't exist
 * 2. Copies export-config.ts template
 * 3. Updates feature config.ts with export/import settings
 *
 * Usage:
 *   pnpm run add:export-import <feature-name>
 *   pnpm run add:export-import --all
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ANSI colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
}

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Get all features from frontend/slices directory
function getAllFeatures(): string[] {
  const featuresPath = join(__dirname, "../../frontend/slices")
  const features = readFileSync(featuresPath, { encoding: "utf-8" })
    .split("\n")
    .filter(line => {
      const trimmed = line.trim()
      return trimmed && trimmed !== "_templates" && !trimmed.startsWith(".")
    })
    .map(line => line.split("/")[0])
    .filter(Boolean)

  return features
}

// Check if feature exists
function featureExists(featureId: string): boolean {
  const featurePath = join(__dirname, `../../frontend/slices/${featureId}`)
  return existsSync(featurePath)
}

// Check if feature already has export/import
function hasExportImport(featureId: string): boolean {
  const configPath = join(__dirname, `../../frontend/slices/${featureId}/config.ts`)
  if (!existsSync(configPath)) return false

  const config = readFileSync(configPath, "utf-8")
  return config.includes("hasExportImport") || config.includes("exportConfig")
}

// Create data folder and copy template
function createDataFolder(featureId: string): void {
  const dataPath = join(__dirname, `../../frontend/slices/${featureId}/data`)
  const templatePath = join(__dirname, `../../frontend/slices/_templates/data`)

  // Create data folder
  if (!existsSync(dataPath)) {
    mkdirSync(dataPath, { recursive: true })
    log(`✓ Created data/ folder for ${featureId}`, "green")
  }

  // Copy export-config.ts template
  const targetConfigPath = join(dataPath, "export-config.ts")
  const sourceConfigPath = join(templatePath, "export-config.ts")

  if (!existsSync(targetConfigPath)) {
    let configContent = readFileSync(sourceConfigPath, "utf-8")

    // Replace placeholder with actual feature ID
    configContent = configContent.replace(/YOUR_FEATURE_NAME/g, featureId)

    writeFileSync(targetConfigPath, configContent)
    log(`✓ Created export-config.ts for ${featureId}`, "green")
  }
}

// Update feature config to include export/import
function updateFeatureConfig(featureId: string): void {
  const configPath = join(__dirname, `../../frontend/slices/${featureId}/config.ts`)
  let config = readFileSync(configPath, "utf-8")

  // Check if already has export/import
  if (config.includes("hasExportImport")) {
    log(`⚠ Feature ${featureId} already has export/import config`, "yellow")
    return
  }

  // Find the closing bracket of the config object
  const lastBraceIndex = config.lastIndexOf("}")

  // Insert export/import config before closing brace
  const exportImportConfig = `

  // Export/Import integration
  hasExportImport: true,
  exportConfigPath: 'features/${featureId}/data/export-config',`

  config = config.slice(0, lastBraceIndex) + exportImportConfig + config.slice(lastBraceIndex)

  writeFileSync(configPath, config)
  log(`✓ Updated config.ts for ${featureId}`, "green")
}

// Create index file in data folder
function createDataIndex(featureId: string): void {
  const indexPath = join(__dirname, `../../frontend/slices/${featureId}/data/index.ts`)

  if (!existsSync(indexPath)) {
    const indexContent = `/**
 * Data Export/Import for ${featureId}
 */

export { default as exportConfig } from './export-config'
`
    writeFileSync(indexPath, indexContent)
    log(`✓ Created index.ts for ${featureId}/data`, "green")
  }
}

// Main function
async function addExportImport(featureId: string): Promise<void> {
  log(`\n🔧 Adding export/import to feature: ${featureId}`, "cyan")
  log("=" .repeat(50), "cyan")

  // Check if feature exists
  if (!featureExists(featureId)) {
    log(`❌ Feature ${featureId} does not exist!`, "red")
    return
  }

  // Check if already has export/import
  if (hasExportImport(featureId)) {
    log(`⚠ Feature ${featureId} already has export/import configured!`, "yellow")
    return
  }

  // Create data folder and files
  createDataFolder(featureId)
  createDataIndex(featureId)
  updateFeatureConfig(featureId)

  log("\n✅ Successfully added export/import to feature!", "green")
  log("\nNext steps:", "bright")
  log(`1. Edit frontend/slices/${featureId}/data/export-config.ts`, "bright")
  log(`2. Customize the export properties and implement export/import logic`, "bright")
  log(`3. Add ExportImport component to your feature's UI`, "bright")
}

// CLI handler
async function main() {
  const args = process.argv.slice(2)
  const featureId = args[0]
  const allFlag = args.includes("--all")

  if (allFlag) {
    log("\n🚀 Adding export/import to ALL features...", "cyan")
    log("=" .repeat(50), "cyan")

    const features = getAllFeatures()

    for (const feature of features) {
      if (!hasExportImport(feature) && featureExists(feature)) {
        await addExportImport(feature)
      }
    }

    log("\n🎉 Process completed!", "green")
  } else if (featureId) {
    await addExportImport(featureId)
  } else {
    log("\n📖 Usage:", "cyan")
    log("  pnpm run add:export-import <feature-name>", "bright")
    log("  pnpm run add:export-import --all", "bright")
    log("\n📋 Available features:", "cyan")

    const features = getAllFeatures()
    features.forEach(feature => {
      const status = hasExportImport(feature) ? "✓" : "○"
      log(`  ${status} ${feature}`, "bright")
    })
  }
}

// Run script
main().catch(error => {
  log(`\n❌ Error: ${error.message}`, "red")
  process.exit(1)
})