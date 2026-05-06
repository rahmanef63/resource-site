/**
 * Workspace Navigation Items
 *
 * 100% AUTO-GENERATED from frontend/slices/config.ts (auto-discovered)
 * NO HARDCODING! All navigation items come from feature configs
 *
 * This file dynamically generates navigation items from the feature registry.
 * To add/edit navigation items, update the feature's config.ts file.
 */

import { getAllFeatures } from "@/frontend/shared/lib/features/registry"
import * as Icons from "lucide-react"
import { WorkspaceNavigationItem } from "../types"

/**
 * Auto-generated workspace navigation items from feature registry
 *
 * Each item is created from a feature's config.ts:
 * - key: feature.id
 * - label: feature.name
 * - icon: feature.ui.icon (Lucide React icon)
 * - description: feature.description
 * - path: feature.ui.path (without /dashboard prefix)
 */
export const WORKSPACE_NAVIGATION_ITEMS: WorkspaceNavigationItem[] = getAllFeatures()
  .filter(feature => {
    // Only include features that have UI and are ready for navigation
    return feature.technical.hasUI && feature.status.isReady
  })
  .map(feature => {
    // Get the icon component from lucide-react
    const IconComponent = (Icons as any)[feature.ui.icon] || Icons.HelpCircle

    // Remove /dashboard prefix from path if present
    const path = feature.ui.path.replace(/^\/dashboard/, '')

    return {
      key: feature.id as any, // Cast to ViewType (will be dynamic in types/index.ts)
      label: feature.name,
      icon: IconComponent,
      description: feature.description,
      path,
    }
  })
  .sort((a, b) => {
    // Sort by order from feature config
    const aFeature = getAllFeatures().find(f => f.id === a.key)
    const bFeature = getAllFeatures().find(f => f.id === b.key)
    return (aFeature?.ui.order || 999) - (bFeature?.ui.order || 999)
  })

/**
 * Workspace Types - Static configuration (not feature-specific)
 */
export const WORKSPACE_TYPES = [
  { value: "personal", label: "Personal", desc: "For individual use" },
  { value: "family", label: "Family", desc: "For family members" },
  { value: "group", label: "Group", desc: "For small groups" },
  { value: "organization", label: "Organization", desc: "For companies" },
  { value: "institution", label: "Institution", desc: "For schools, hospitals, etc." },
] as const
