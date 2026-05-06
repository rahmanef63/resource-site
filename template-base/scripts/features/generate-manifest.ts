#!/usr/bin/env tsx
/**
 * Auto-generate frontend/shared/foundation/manifest/registry.tsx
 *
 * This script reads auto-discovered feature configs and generates the component registry
 * to ensure DRY principle - only edit feature config.ts files, not registry.tsx
 *
 * Usage:
 *   pnpm run generate:manifest
 */

import { getAllFeatures, getFeatureSlug } from "../../frontend/shared/lib/features/registry.server"
import type { FeatureConfig } from "../../frontend/shared/lib/features/defineFeature"
import fs from "fs"
import path from "path"

type FeatureMetadata = FeatureConfig

const FEATURES_REGISTRY = getAllFeatures()

interface ComponentImportConfig {
  path: string
  namedExport?: string
}

// ✅ NO HARDCODING! All paths are auto-resolved from feature config
// Each feature's config.ts defines its own component path

function fileExists(...segments: string[]): boolean {
  return fs.existsSync(path.join(process.cwd(), ...segments))
}

/**
 * ✅ 100% DYNAMIC - Auto-resolves component import path
 * NO hardcoding! Checks actual file existence in feature folders
 */
function resolveComponentImport(feature: FeatureMetadata): ComponentImportConfig {
  const component = feature.ui.component
  const slugFromConfig = getFeatureSlug(feature.id)
  const candidateSlugs = slugFromConfig && slugFromConfig !== feature.id
    ? [slugFromConfig, feature.id]
    : [feature.id]

  for (const slug of candidateSlugs) {
    // Priority 1: Check page.tsx (recommended - consistent entry point)
    if (fileExists("frontend", "slices", slug, "page.tsx")) {
      return { path: `@/frontend/slices/${slug}/page` }
    }

    // Priority 2: Check views/{Component}.tsx (fallback for legacy structure)
    if (fileExists("frontend", "slices", slug, "views", `${component}.tsx`)) {
      return { path: `@/frontend/slices/${slug}/views/${component}` }
    }

    // Priority 3: Check index.ts with named export
    if (fileExists("frontend", "slices", slug, "index.ts")) {
      return { path: `@/frontend/slices/${slug}`, namedExport: component }
    }
  }

  // Priority 4: Check legacy views/static
  if (fileExists("frontend", "views", "static", feature.id, "page.tsx")) {
    return { path: `@/frontend/views/static/${feature.id}/page` }
  }

  // Priority 5: Check legacy views/dynamic
  if (fileExists("frontend", "views", "dynamic", feature.id, "page.tsx")) {
    return { path: `@/frontend/views/dynamic/${feature.id}/page` }
  }

  throw new Error(
    `Unable to resolve component path for "${feature.id}" (component "${component}"). ` +
    `Ensure the component exists under frontend/slices/${slugFromConfig ?? feature.id}/ or update the feature config.`,
  )
}

// Flatten nested features (for features with children)
function flattenFeatures(features: FeatureMetadata[]): FeatureMetadata[] {
  const result: FeatureMetadata[] = []

  for (const feature of features) {
    result.push(feature)
    if (feature.children && feature.children.length > 0) {
      result.push(...flattenFeatures(feature.children))
    }
  }

  return result
}

// Get icon import
function getIconName(feature: FeatureMetadata): string {
  return feature.ui?.icon || "FileText"
}

// Generate imports for all features
function generateImports(features: FeatureMetadata[]): string {
  const allFeatures = flattenFeatures(features)
  const imports: string[] = []
  const icons = new Set<string>()

  // Collect all unique icons
  allFeatures.forEach(f => {
    const icon = getIconName(f)
    icons.add(icon)
  })

  // Add lucide-react icons import
  imports.push(`import {
  ${Array.from(icons).sort().join(',\n  ')}
} from "lucide-react"`)

  return imports.join('\n')
}

function indentMultiline(value: string, indent: number): string {
  const pad = " ".repeat(indent)
  return value
    .split("\n")
    .map((line, index) => (index === 0 ? line : pad + line))
    .join("\n")
}

function renderLazyLoader(config: ComponentImportConfig): string {
  if (!config.namedExport) {
    return `lazy(() => import("${config.path}"))`
  }

  const lines = [
    "lazy(async () => {",
    `  const module = await import("${config.path}")`,
    `  const Component = module.${config.namedExport}`,
    "  if (!Component) {",
    `    throw new Error("Failed to load component ${config.namedExport} from ${config.path}")`,
    "  }",
    "  return { default: Component }",
    "})",
  ]

  return lines.join("\n")
}

// Generate component registry entries
function generateRegistryEntries(features: FeatureMetadata[]): string {
  const allFeatures = flattenFeatures(features)

  return allFeatures.map(feature => {
    const importConfig = resolveComponentImport(feature)
    const componentLoader = indentMultiline(renderLazyLoader(importConfig), 6)
    const iconName = getIconName(feature)
    const aliases = feature.navigation?.aliases ? `[${feature.navigation.aliases.map(a => `"${a}"`).join(", ")}]` : "undefined"
    const patterns = feature.navigation?.patterns ? JSON.stringify(feature.navigation.patterns) : "undefined"
    const path = feature.navigation?.route ?? feature.ui.path

    return `  {
    id: "${feature.id}",
    componentId: "${feature.ui.component}",
    title: "${feature.name}",
    description: "${feature.description}",
    icon: ${iconName},
    component: ${componentLoader},
    path: "${path}",
    aliases: ${aliases},
    patterns: ${patterns},
  }`
  }).join(',\n')
}

// Generate resource map
function generateResourceMap(features: FeatureMetadata[]): string {
  const allFeatures = flattenFeatures(features)
  // Dedupe keys across features — the first feature to claim a keyword
  // wins. Without this, the emitted object literal has duplicate keys
  // and TypeScript rejects the file at compile time.
  const seen = new Map<string, string>()

  allFeatures.forEach(feature => {
    const claim = (key: string) => {
      if (!seen.has(key)) seen.set(key, feature.id)
    }
    feature.navigation?.aliases?.forEach(claim)
    if (feature.navigation?.patterns) {
      Object.keys(feature.navigation.patterns).forEach((key) => {
        if (!feature.navigation?.aliases?.includes(key)) claim(key)
      })
    }
  })

  return Array.from(seen.entries())
    .map(([key, id]) => `  "${key}": "${id}"`)
    .join(',\n')
}

// Generate the manifest file
function generateManifest(): string {
  const features = FEATURES_REGISTRY
  const resourceMap = generateResourceMap(features)

  return `/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 *
 * Generated by: scripts/features/generate-manifest.ts
 * Source of truth: frontend/slices/[feature]/config.ts via registry.server.ts
 *
 * To update this file:
 *   1. Edit the relevant frontend/slices/{slug}/config.ts
 *   2. Run: pnpm run generate:manifest
 */

"use client"

import type { Id } from "@convex/_generated/dataModel"
import type { ElementType, ReactElement } from "react"
import { lazy } from "react"

${generateImports(features)}

export type AppPageComponent = (props: { workspaceId?: Id<"workspaces"> | null }) => ReactElement | null

export interface PageManifestItem {
  id: string
  componentId: string
  title: string
  description?: string
  icon?: ElementType
  color?: string
  component: React.LazyExoticComponent<React.ComponentType<any>>
  path: string
  aliases?: string[]
  patterns?: Record<string, string>
}

export const DEFAULT_PAGE_MANIFEST: PageManifestItem[] = [
${generateRegistryEntries(features)}
]

export const PAGE_MANIFEST_MAP: Record<string, PageManifestItem> = Object.fromEntries(
  DEFAULT_PAGE_MANIFEST.map((p) => [p.id, p]),
)

export const COMPONENT_REGISTRY_MAP: Record<string, PageManifestItem> = Object.fromEntries(
  DEFAULT_PAGE_MANIFEST.map((p) => [p.componentId, p]),
)

export const RESOURCE_TO_FEATURE_MAP: Record<string, string> = {
${resourceMap}
}

export function getDefaultPages(): PageManifestItem[] {
  return DEFAULT_PAGE_MANIFEST
}

export function getPageById(id: string): PageManifestItem | undefined {
  return DEFAULT_PAGE_MANIFEST.find((p) => p.id === id)
}

export function getComponentById(componentId: string): PageManifestItem | undefined {
  return COMPONENT_REGISTRY_MAP[componentId]
}

interface AppContentProps {
  workspaceId?: Id<"workspaces"> | null
  activeView: string
}

export function AppContent({ workspaceId, activeView }: AppContentProps) {
  const fallbackPage =
    DEFAULT_PAGE_MANIFEST.find((p) => p.id === activeView) ?? DEFAULT_PAGE_MANIFEST.find((p) => p.id === "overview")

  if (!fallbackPage) {
    return <div className="flex-1 p-8">Page not found: {activeView}</div>
  }

  const Comp = fallbackPage.component
  return (
    <div className="flex-1 overflow-hidden">
      <Comp workspaceId={workspaceId ?? null} />
    </div>
  )
}
`
}

// Main execution
function main() {
  console.log("Generating manifest registry from auto-discovered features...")

  try {
    const manifestContent = generateManifest()
    const outputPath = path.join(
      process.cwd(),
      "frontend/shared/foundation/manifest/registry.tsx",
    )

    // Backup old manifest
    if (fs.existsSync(outputPath)) {
      const backupPath = path.join(
        process.cwd(),
        "frontend/shared/foundation/manifest/registry.tsx.backup",
      )
      fs.copyFileSync(outputPath, backupPath)
      console.log("Backed up previous manifest registry to registry.tsx.backup")
    }

    // Write new manifest
    fs.writeFileSync(outputPath, manifestContent, "utf-8")
    console.log("Successfully generated manifest registry")
    console.log(`Location: ${outputPath}`)

    // Count features
    const allFeatures = flattenFeatures(FEATURES_REGISTRY)
    console.log(`Generated ${allFeatures.length} component entries`)
  } catch (error) {
    console.error("Error generating manifest:", error)
    process.exit(1)
  }
}

main()
