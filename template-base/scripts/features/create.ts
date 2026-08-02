#!/usr/bin/env node
/**
 * Feature Creation Script (CRUD - Create)
 *
 * Creates a new feature with:
 * - Frontend structure (UI components, hooks, types)
 * - Feature config.ts (auto-discovered, NO hardcoding!)
 * - Convex handlers (queries, mutations, actions)
 * - Test files (unit and integration)
 *
 * Usage: pnpm run create:feature <slug> [options]
 *
 * Example:
 *   pnpm run create:feature analytics --type optional --category analytics --icon BarChart
 */

import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"

import {
  FEATURE_BUNDLE_IDS,
  FEATURE_UI_CATEGORIES,
} from "../../lib/features/constants"

// ============================================================================
// TYPES
// ============================================================================

// Bundle IDs (shared SSOT for feature packaging and registry tooling)
const BUNDLE_IDS = FEATURE_BUNDLE_IDS as readonly string[]

type BundleId = typeof BUNDLE_IDS[number]

interface BundleMembership {
  core: BundleId[]
  recommended: BundleId[]
  optional: BundleId[]
}

interface CreateFeatureOptions {
  slug: string
  name?: string
  description?: string
  featureType: "default" | "optional" | "experimental" | "system"
  category:
  | "communication"
  | "productivity"
  | "collaboration"
  | "administration"
  | "social"
  | "creativity"
  | "analytics"
  | "content"
  icon?: string
  hasUI: boolean
  hasConvex: boolean
  hasTests: boolean
  permissions?: string[]
  tags?: string[]
  order?: number
  bundles?: BundleMembership
}

// ============================================================================
// CLI ARGUMENTS
// ============================================================================

function parseArgs(): CreateFeatureOptions {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Feature Creation CLI

Usage: pnpm run create:feature <slug> [options]

Arguments:
  slug                Feature slug (kebab-case, e.g., my-analytics)

Options:
  --name              Feature display name (default: Title Case slug)
  --description       Feature description
  --type              Feature type: default|optional|experimental|system (default: optional)
  --category          Category (required): communication|productivity|collaboration|administration|social|creativity|analytics|content
  --icon              Lucide icon name (default: Box)
  --order             Menu order number (default: 100)
  --permissions       Comma-separated permissions (e.g., VIEW_ANALYTICS,MANAGE_ANALYTICS)
  --tags              Comma-separated tags (e.g., analytics,reports,data)
  --bundles-core      Comma-separated bundle IDs where this feature is CORE (e.g., startup,business-pro)
  --bundles-recommended  Comma-separated bundle IDs where this feature is RECOMMENDED
  --bundles-optional  Comma-separated bundle IDs where this feature is OPTIONAL
  --no-ui             Skip frontend UI generation
  --no-convex         Skip Convex handlers generation
  --no-tests          Skip test files generation

Available Bundle IDs:
  Business:  startup, business-pro, sales-crm
  Productivity: project-management, knowledge-base
  Personal: personal-minimal, personal-productivity, family
  Creative: content-creator, digital-agency
  Other: education, community, custom

Examples:
  pnpm run create:feature analytics --type optional --category analytics --icon BarChart --bundles-recommended startup,business-pro
  pnpm run create:feature admin-panel --type default --category administration --permissions MANAGE_ADMIN --bundles-core startup,business-pro
  pnpm run create:feature beta-feature --type experimental --category productivity --bundles-optional custom
    `)
    process.exit(0)
  }

  const slug = args[0]
  if (!slug || slug.startsWith("--")) {
    console.error("❌ Error: Feature slug is required")
    console.error("   Usage: pnpm run create:feature <slug> [options]")
    process.exit(1)
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    console.error("❌ Error: Slug must contain only lowercase letters, numbers, and hyphens")
    console.error(`   Got: "${slug}"`)
    process.exit(1)
  }

  const getArg = (flag: string): string | undefined => {
    const index = args.indexOf(flag)
    return index !== -1 && args[index + 1] ? args[index + 1] : undefined
  }

  const hasFlag = (flag: string): boolean => args.includes(flag)

  // Convert slug to Title Case for default name
  const slugToTitle = (s: string) =>
    s
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")

  const name = getArg("--name") || slugToTitle(slug)
  const description = getArg("--description") || `${name} feature`
  const featureType = (getArg("--type") as CreateFeatureOptions["featureType"]) || "optional"
  const categoryArg = getArg("--category")
  const icon = getArg("--icon") || "Box"
  const orderArg = getArg("--order")
  const order = orderArg ? parseInt(orderArg) : 100
  const permissionsArg = getArg("--permissions")
  const permissions = permissionsArg ? permissionsArg.split(",").map((p) => p.trim()) : undefined
  const tagsArg = getArg("--tags")
  const tags = tagsArg ? tagsArg.split(",").map((t) => t.trim()) : undefined

  const hasUI = !hasFlag("--no-ui")
  const hasConvex = !hasFlag("--no-convex")
  const hasTests = !hasFlag("--no-tests")

  // Parse bundle membership
  const bundlesCoreArg = getArg("--bundles-core")
  const bundlesRecommendedArg = getArg("--bundles-recommended")
  const bundlesOptionalArg = getArg("--bundles-optional")

  const parseBundleIds = (arg: string | undefined): BundleId[] => {
    if (!arg) return []
    const ids = arg.split(",").map(id => id.trim()) as BundleId[]
    // Validate bundle IDs
    ids.forEach(id => {
      if (!BUNDLE_IDS.includes(id)) {
        console.error(`❌ Error: Invalid bundle ID "${id}"`)
        console.error(`   Valid bundle IDs: ${BUNDLE_IDS.join(", ")}`)
        process.exit(1)
      }
    })
    return ids
  }

  const bundles: BundleMembership = {
    core: parseBundleIds(bundlesCoreArg),
    recommended: parseBundleIds(bundlesRecommendedArg),
    optional: parseBundleIds(bundlesOptionalArg),
  }

  // Validate category (REQUIRED)
  const validCategories: readonly string[] = FEATURE_UI_CATEGORIES
  if (!categoryArg) {
    console.error("❌ Error: --category is required")
    console.error(`   Valid categories: ${validCategories.join(", ")}`)
    process.exit(1)
  }
  if (!validCategories.includes(categoryArg)) {
    console.error(`❌ Error: Invalid category "${categoryArg}"`)
    console.error(`   Valid categories: ${validCategories.join(", ")}`)
    process.exit(1)
  }

  // Validate feature type
  const validTypes = ["default", "optional", "experimental", "system"]
  if (!validTypes.includes(featureType)) {
    console.error(`❌ Error: Invalid type "${featureType}"`)
    console.error(`   Valid types: ${validTypes.join(", ")}`)
    process.exit(1)
  }

  return {
    slug,
    name,
    description,
    featureType,
    category: categoryArg as CreateFeatureOptions["category"],
    icon,
    hasUI,
    hasConvex,
    hasTests,
    permissions,
    tags,
    order,
    bundles,
  }
}

// ============================================================================
// TEMPLATES
// ============================================================================

function generateFeatureConfig(options: CreateFeatureOptions): string {
  const {
    slug,
    name,
    description,
    featureType,
    category,
    icon,
    order,
    permissions,
    tags,
    hasUI,
    hasConvex,
    hasTests,
    bundles,
  } = options

  const componentName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  const permissionsStr = permissions ? JSON.stringify(permissions, null, 4) : undefined
  const tagsStr = tags ? JSON.stringify(tags, null, 4) : JSON.stringify([slug, category], null, 4)

  // Format bundles configuration
  const bundlesStr = bundles ? `{
    core: ${JSON.stringify(bundles.core)},
    recommended: ${JSON.stringify(bundles.recommended)},
    optional: ${JSON.stringify(bundles.optional)},
  }` : `{
    core: [],
    recommended: [],
    optional: ['custom'], // Default: available in custom bundle only
  }`

  return `import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * ${name} Feature Configuration
 *
 * This is the single source of truth for the ${slug} feature.
 * Auto-discovered by the feature registry system.
 *
 * @see frontend/shared/lib/features/registry.ts for auto-discovery
 * @see frontend/shared/lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: '${slug}',
  name: '${name}',
  description: '${description}',

  // UI Config
  ui: {
    icon: '${icon}',                  // Lucide React icon name
    path: '/dashboard/${slug}',
    component: '${componentName}Page',
    category: '${category}',
    order: ${order},
  },

  // Technical Config
  technical: {
    featureType: '${featureType}',
    hasUI: ${hasUI},
    hasConvex: ${hasConvex},
    hasTests: ${hasTests},
    version: '1.0.0',
  },

  // Development Status
  status: {
    state: 'development',              // development | beta | stable | deprecated
    isReady: false,                     // Set to true when ready for production
    expectedRelease: undefined,         // Optional: 'Q1 2025'
  },

  // JSON Generation Policy
  generation: {
    mode: 'full-json',
  },

  // Bundle Membership
  // Defines which workspace templates include this feature
  // core: Cannot be disabled | recommended: Enabled by default | optional: User can enable
  bundles: ${bundlesStr},

  // Metadata
  tags: ${tagsStr},${permissions ? `\n\n  // Permissions (optional)\n  permissions: ${permissionsStr},` : ""}
})
`
}

function generateFrontendPage(slug: string, name: string, icon: string): string {
  const componentName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  return `"use client"

import React from "react"
import { ${icon}, Plus, Settings } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { use${componentName} } from "../hooks/use${componentName}"

interface ${componentName}PageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * ${name} Page Component
 * 
 * Pattern: Feature page with shared layout components
 * @see docs/guides/FEATURE_CREATION_TEMPLATE.md
 * @see docs/00_BASE_KNOWLEDGE.md - Pattern 4: React Component with Convex
 */
export default function ${componentName}Page({ workspaceId }: ${componentName}PageProps) {
  // ✅ Use hook with workspaceId - this is the correct pattern
  const { isLoading, data } = use${componentName}(workspaceId)

  // ✅ Handle no workspace
  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view ${name}
          </p>
        </div>
      </PageContainer>
    )
  }

  // ✅ Handle loading
  if (isLoading) {
    return (
      <PageContainer centered>
        <div className="text-muted-foreground">Loading ${name.toLowerCase()}...</div>
      </PageContainer>
    )
  }

  // ✅ Main content with proper scroll wrapper
  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={${icon}}
        title="${name}"
        subtitle="${name} feature description"
        badge={{ text: "Beta", variant: "secondary" }}
        primaryAction={{
          label: "Add Item",
          icon: Plus,
          onClick: () => {},
        }}
        secondaryActions={[
          {
            id: "settings",
            label: "Settings",
            icon: Settings,
            onClick: () => {},
          },
        ]}
      />

      {/* ✅ Scrollable content area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {/* TODO: Implement your feature UI here */}
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              Start building your ${name.toLowerCase()} feature here!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
`
}

function generateHook(slug: string, name: string): string {
  const componentName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  // Convert slug to camelCase for Convex path (convex doesn't support kebab-case)
  const convexSlug = slug.includes('-')
    ? slug.split('-').map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('')
    : slug

  return `import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for ${name} feature
 * 
 * Pattern: Use Convex query directly, no manual loading state
 * The query returns undefined while loading, data when ready
 * 
 * @see docs/guides/FEATURE_CREATION_TEMPLATE.md
 * @see docs/00_BASE_KNOWLEDGE.md - Pattern 4: React Component with Convex
 */
export function use${componentName}(workspaceId: Id<"workspaces"> | null | undefined) {
  // ✅ Query data from Convex - returns undefined while loading
  const data = useQuery(
    workspaceId ? api.features.${convexSlug}.queries.getData : "skip",
    workspaceId ? { workspaceId } : "skip"
  )

  // ✅ Mutations
  const createItem = useMutation(api.features.${convexSlug}.mutations.createItem)

  return {
    // State - undefined = loading, null = no data, otherwise = data
    isLoading: data === undefined && workspaceId !== null && workspaceId !== undefined,
    data,
    
    // Actions
    createItem,
  }
}
`
}

function generateTypes(slug: string): string {
  const typeName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  return `/**
 * Type definitions for ${slug} feature
 */

export interface ${typeName}Item {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface ${typeName}Config {
  enabled: boolean
  settings?: Record<string, unknown>
}
`
}

function generateFeatureSettingsComponent(slug: string, name: string): string {
  const componentName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  return `"use client"

import { SettingsSection } from "@/frontend/shared/settings/primitives/SettingsSection"

export function ${componentName}GeneralSettings() {
  return (
    <SettingsSection title="General" description="Basic settings for ${name}">
      <div className="text-sm text-muted-foreground">No settings yet.</div>
    </SettingsSection>
  )
}
`
}

function generateFeatureSettingsIndex(slug: string): string {
  const componentName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  return `export { ${componentName}GeneralSettings } from "./${componentName}Settings"
`
}

function generateFeatureAgentsIndex(slug: string, name: string): string {
  const lowerName = name.toLowerCase()

  return `import { AgentDefinition } from "../../ai/types"

export const agent: AgentDefinition = {
    name: "${name} Agent",
    description: "Helps with ${lowerName} tasks.",
    icon: "Box",
    capabilities: [],
    prompts: {
        system: \`You are a \${lowerName} assistant. You help users with \${lowerName} operations.\`
    }
};
`
}

function generateFeatureInit(slug: string, name: string): string {
  const componentName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")

  return `/**
 * ${name} Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { ${componentName}GeneralSettings } from "./settings"

registerFeatureSettings("${slug}", () => [
  {
    id: "${slug}-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: ${componentName}GeneralSettings,
  },
])
`
}

function generateConvexAgent(slug: string, name: string): string {
  return `import { FeatureAgent } from "../ai/lib/types"

/**
 * Backend Agent for ${slug}
 * Provides server-side tools for the feature agent.
 */
export const agent: FeatureAgent = {
    tools: {}
};
`
}

function generateConvexQueries(slug: string): string {
  return `import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Queries for ${slug} feature
 */

export const getData = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // ✅ REQUIRED: Check workspace membership
    const { membership, role } = await requireActiveMembership(ctx, args.workspaceId)

    // TODO: Implement your query logic
    return {
      message: "Query successful",
      userId: membership.userDocId,
      role: role.name,
    }
  },
})
`
}

function generateConvexMutations(slug: string): string {
  return `import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"

/**
 * Mutations for ${slug} feature
 */

export const createItem = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // ✅ REQUIRED: Check permission
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.DOCUMENTS_CREATE // TODO: Use appropriate permission
    )

    // TODO: Implement your mutation logic
    const itemId = await ctx.db.insert("documents", {
      workspaceId: args.workspaceId,
      name: args.name,
      createdBy: membership.userDocId,
      createdAt: Date.now(),
    })

    // TODO: Add audit logging
    // await ctx.runMutation(internal.audit.logEvent, { ... })

    return itemId
  },
})
`
}

function generateTest(slug: string, name: string): string {
  return `import { describe, it, expect } from "vitest"

/**
 * Unit tests for ${name} feature
 */
describe("${name} Feature", () => {
  it("should initialize correctly", () => {
    expect(true).toBe(true)
  })

  // TODO: Add more unit tests for utilities, helpers, etc.
})
`
}

function generateIntegrationTest(slug: string, name: string): string {
  return `import { describe, it, expect, beforeEach } from "vitest"
import { convexTest } from "convex-test"
import schema from "@/convex/schema"
import { api } from "@/convex/_generated/api"

/**
 * Integration tests for ${name} feature
 */
describe("${name} Integration", () => {
  let t: any

  beforeEach(async () => {
    t = convexTest(schema)
  })

  it("should enforce RBAC on queries", async () => {
    // TODO: Test permission checks
    expect(true).toBe(true)
  })

  it("should enforce RBAC on mutations", async () => {
    // TODO: Test permission checks
    expect(true).toBe(true)
  })

  // TODO: Add more integration tests for Convex handlers
})
`
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("🚀 Feature Creation Script\n")

  const options = parseArgs()
  const { slug, name, hasUI, hasConvex, hasTests } = options

  const rootDir = process.cwd()
  const featureDir = join(rootDir, "frontend", "slices", slug)

  // Check if feature already exists
  if (existsSync(featureDir)) {
    console.error(`❌ Error: Feature "${slug}" already exists at:`)
    console.error(`   ${featureDir}`)
    console.error(`\n💡 Tip: Use 'pnpm run edit:feature ${slug}' to edit existing feature`)
    process.exit(1)
  }

  console.log(`📦 Creating feature: ${name} (${slug})`)
  console.log(`   Type: ${options.featureType}`)
  console.log(`   Category: ${options.category}`)
  console.log(`   Icon: ${options.icon}`)
  console.log(`   Bundles:`)
  console.log(`     - Core: ${options.bundles?.core.length ? options.bundles.core.join(', ') : 'none'}`)
  console.log(`     - Recommended: ${options.bundles?.recommended.length ? options.bundles.recommended.join(', ') : 'none'}`)
  console.log(`     - Optional: ${options.bundles?.optional.length ? options.bundles.optional.join(', ') : 'custom (default)'}`)
  console.log(`   Location: frontend/slices/${slug}/\n`)

  // Create feature directory
  mkdirSync(featureDir, { recursive: true })

  // 1. Generate config.ts (SINGLE SOURCE OF TRUTH!)
  console.log("1️⃣  Generating config.ts (auto-discovered)...")
  const configPath = join(featureDir, "config.ts")
  writeFileSync(configPath, generateFeatureConfig(options))
  console.log(`   ✅ Created: frontend/slices/${slug}/config.ts`)

  // 2. Generate frontend (if enabled)
  if (hasUI) {
    console.log("\n2️⃣  Generating frontend structure...")
    const viewsDir = join(featureDir, "views")
    const hooksDir = join(featureDir, "hooks")
    const typesDir = join(featureDir, "types")
    const settingsDir = join(featureDir, "settings")
    const agentDir = join(featureDir, "agent")

    mkdirSync(viewsDir, { recursive: true })
    mkdirSync(hooksDir, { recursive: true })
    mkdirSync(typesDir, { recursive: true })
    mkdirSync(settingsDir, { recursive: true })
    mkdirSync(agentDir, { recursive: true })

    const componentName = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("")

    // Create the main page component in views/
    writeFileSync(join(viewsDir, `${componentName}Page.tsx`), generateFrontendPage(slug, name!, options.icon!))

    // Create page.tsx as the consistent entry point (re-exports from views/)
    const pageEntryContent = `/**
 * ${name} Feature - Page Entry Point
 * 
 * This is the main entry point for the ${name} feature.
 * Re-exports from views/${componentName}Page.tsx for consistent imports.
 */
export { default } from './views/${componentName}Page'
`
    writeFileSync(join(featureDir, "page.tsx"), pageEntryContent)

    // Create mandatory settings/ scaffold
    writeFileSync(join(settingsDir, `${componentName}Settings.tsx`), generateFeatureSettingsComponent(slug, name!))
    writeFileSync(join(settingsDir, "index.ts"), generateFeatureSettingsIndex(slug))

    // Create mandatory agent/ scaffold
    writeFileSync(join(agentDir, "index.ts"), generateFeatureAgentsIndex(slug, name!))

    // Create init.ts (register settings + agents)
    writeFileSync(join(featureDir, "init.ts"), generateFeatureInit(slug, name!))

    writeFileSync(join(hooksDir, `use${componentName}.ts`), generateHook(slug, name!))
    writeFileSync(join(typesDir, "index.ts"), generateTypes(slug))

    console.log(`   ✅ Created: frontend/slices/${slug}/page.tsx (entry point)`)
    console.log(`   ✅ Created: frontend/slices/${slug}/views/${componentName}Page.tsx`)
    console.log(`   ✅ Created: frontend/slices/${slug}/hooks/use${componentName}.ts`)
    console.log(`   ✅ Created: frontend/slices/${slug}/types/index.ts`)
    console.log(`   ✅ Created: frontend/slices/${slug}/settings/ (mandatory)`)
    console.log(`   ✅ Created: frontend/slices/${slug}/agent/ (mandatory)`)
    console.log(`   ✅ Created: frontend/slices/${slug}/init.ts (mandatory)`)
  }

  // 3. Generate Convex handlers (if enabled)
  if (hasConvex) {
    console.log("\n3️⃣  Generating Convex handlers...")
    // Convex does not support dashes in folder names, convert to camelCase
    const convexSlug = slug.includes('-')
      ? slug.split('-').map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('')
      : slug
    const convexDir = join(rootDir, "convex", "features", convexSlug)
    mkdirSync(convexDir, { recursive: true })

    writeFileSync(join(convexDir, "queries.ts"), generateConvexQueries(slug))
    writeFileSync(join(convexDir, "mutations.ts"), generateConvexMutations(slug))

    // Create mandatory agent.ts scaffold (backend tool endpoints)
    writeFileSync(join(convexDir, "agent.ts"), generateConvexAgent(slug, name!))

    console.log(`   ✅ Created: convex/features/${convexSlug}/queries.ts`)
    console.log(`   ✅ Created: convex/features/${convexSlug}/mutations.ts`)
    console.log(`   ✅ Created: convex/features/${convexSlug}/agent.ts (mandatory)`)
    if (slug !== convexSlug) {
      console.log(`   ℹ️  Note: Convex folder uses camelCase (${convexSlug}) because dashes are not supported`)
    }
  }

  // 4. Generate tests (if enabled)
  if (hasTests) {
    console.log("\n4️⃣  Generating test files...")
    const testsDir = join(rootDir, "tests", "features", slug)
    mkdirSync(testsDir, { recursive: true })

    writeFileSync(join(testsDir, `${slug}.test.ts`), generateTest(slug, name!))
    writeFileSync(join(testsDir, `${slug}.integration.test.ts`), generateIntegrationTest(slug, name!))

    console.log(`   ✅ Created: tests/features/${slug}/${slug}.test.ts`)
    console.log(`   ✅ Created: tests/features/${slug}/${slug}.integration.test.ts`)
  }

  // Done!
  console.log("\n✅ Feature created successfully!\n")
  console.log("📋 Next steps:")
  console.log(`   1. Edit frontend/slices/${slug}/config.ts to update feature config`)
  console.log(`   2. Implement your feature logic in the generated files`)
  console.log(`   3. Run 'pnpm run sync:all' to sync manifests`)
  console.log(`   4. Run 'pnpm run validate:features' to validate`)
  console.log(`   5. Run 'pnpm test tests/features/${slug}' to test\n`)
  console.log(`💡 Tips:`)
  console.log(`   - config.ts is auto-discovered (no manual registration needed!)`)
  console.log(`   - Set status.isReady = true when ready for production`)
  console.log(`   - Add RBAC checks to all Convex queries/mutations`)
  console.log(`   - Add audit logging to all mutations\n`)
}

main().catch((error) => {
  console.error("\n❌ Fatal error:", error.message)
  process.exit(1)
})
