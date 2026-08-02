#!/usr/bin/env node
/**
 * Feature List Script (CRUD - Read)
 *
 * Lists all features discovered by the auto-discovery system.
 *
 * Usage: pnpm run list:features [options]
 *
 * Examples:
 *   pnpm run list:features
 *   pnpm run list:features --type optional
 *   pnpm run list:features --category analytics
 *   pnpm run list:features --status development
 */

import { getAllFeatures, getFeatureMeta, getFeaturesByType, getFeaturesByCategory } from "../../frontend/shared/lib/features/registry.server"

interface ListOptions {
  type?: "default" | "optional" | "experimental" | "system"
  category?: string
  status?: "development" | "beta" | "stable" | "deprecated"
  ready?: boolean
}

function parseArgs(): ListOptions {
  const args = process.argv.slice(2)

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Feature List CLI

Usage: pnpm run list:features [options]

Options:
  --type        Filter by type: default|optional|experimental|system
  --category    Filter by category: communication|productivity|etc
  --status      Filter by status: development|beta|stable|deprecated
  --ready       Filter by ready status: true|false
  --json        Output as JSON

Examples:
  pnpm run list:features                          # List all features
  pnpm run list:features --type optional          # List optional features only
  pnpm run list:features --category analytics     # List analytics features
  pnpm run list:features --status development     # List features in development
  pnpm run list:features --ready true             # List production-ready features
    `)
    process.exit(0)
  }

  const getArg = (flag: string): string | undefined => {
    const index = args.indexOf(flag)
    return index !== -1 && args[index + 1] ? args[index + 1] : undefined
  }

  const type = getArg("--type") as ListOptions["type"]
  const category = getArg("--category")
  const status = getArg("--status") as ListOptions["status"]
  const readyArg = getArg("--ready")
  const ready = readyArg ? readyArg === "true" : undefined

  return { type, category, status, ready }
}

function main() {
  const options = parseArgs()
  const outputJson = process.argv.includes("--json")

  let features = getAllFeatures()

  // Apply filters
  if (options.type) {
    features = getFeaturesByType(options.type)
  }
  if (options.category) {
    features = getFeaturesByCategory(options.category)
  }
  if (options.status) {
    features = features.filter((f) => f.status.state === options.status)
  }
  if (options.ready !== undefined) {
    features = features.filter((f) => f.status.isReady === options.ready)
  }

  if (outputJson) {
    console.log(JSON.stringify(features, null, 2))
    return
  }

  // Pretty print
  console.log("\n📦 Feature Registry\n")
  console.log("=".repeat(80))
  console.log(`Total Features: ${features.length}\n`)

  // Group by type
  const byType = features.reduce(
    (acc, f) => {
      const type = f.technical.featureType
      if (!acc[type]) acc[type] = []
      acc[type].push(f)
      return acc
    },
    {} as Record<string, typeof features>
  )

  Object.entries(byType).forEach(([type, feats]) => {
    console.log(`\n${type.toUpperCase()} (${feats.length})`)
    console.log("-".repeat(80))

    feats.forEach((f) => {
      const statusIcon = f.status.isReady ? "✅" : "🚧"
      const stateEmoji: Record<string, string> = {
        development: "🛠️",
        beta: "🧪",
        stable: "✅",
        deprecated: "⚠️",
        experimental: "🔬",
      }
      const stateEmojiIcon = stateEmoji[f.status.state] ?? "❓"

      console.log(`\n${statusIcon} ${f.name} (${f.id})`)
      console.log(`   Status: ${stateEmojiIcon} ${f.status.state} ${f.status.isReady ? "" : "(not ready)"}`)
      console.log(`   Category: ${f.ui.category}`)
      console.log(`   Path: ${f.ui.path}`)
      console.log(`   Version: ${f.technical.version}`)
      const frontendSlug = getFeatureMeta(f.id)?.slug ?? f.id
      console.log(`   Config: frontend/slices/${frontendSlug}/config.ts`)

      if (f.permissions && f.permissions.length > 0) {
        console.log(`   Permissions: ${f.permissions.join(", ")}`)
      }

      if (f.children && f.children.length > 0) {
        console.log(`   Children: ${f.children.length} sub-routes`)
      }
    })
  })

  console.log("\n" + "=".repeat(80))
  console.log(`\n📊 Summary:`)
  console.log(`   Total: ${features.length}`)
  console.log(`   Ready: ${features.filter((f) => f.status.isReady).length}`)
  console.log(`   In Development: ${features.filter((f) => !f.status.isReady).length}\n`)

  // Count by type
  const typeCounts = Object.entries(byType).map(([type, feats]) => `${type}: ${feats.length}`)
  console.log(`   By Type: ${typeCounts.join(" | ")}\n`)
}

main()
