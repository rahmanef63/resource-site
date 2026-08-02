"use client"

/**
 * Feature Settings Sync
 *
 * Generic component that syncs workspace menu items with settings registry.
 * Automatically registers/unregisters feature settings as features are added/removed.
 */

import { useEffect, useMemo, useRef } from "react"
import { useQuery } from "convex/react"
import type { Id } from "@convex/_generated/dataModel"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import { useSettingsRegistry } from "../SettingsProvider"
import { getFeatureSettingsBuilder, getAllRegisteredFeatures } from "@/frontend/shared/foundation/utils/registry/feature-settings-registry"
import type { SettingsCategory, FeatureSettingsBuilder } from "../types"

import type { MenuItem } from "@/frontend/shared/foundation/types"

export interface FeatureSettingsSyncProps {
  /** Workspace ID to sync settings for */
  workspaceId: Id<"workspaces">
  /** Optional static feature settings builders (fallback for features without dynamic registration) */
  staticBuilders?: Record<string, FeatureSettingsBuilder>
}

/**
 * Syncs workspace features with settings registry
 *
 * @example
 * ```tsx
 * <FeatureSettingsSync
 *   workspaceId={workspaceId}
 *   staticBuilders={LEGACY_FEATURE_BUILDERS}
 * />
 * ```
 */
export function FeatureSettingsSync({
  workspaceId,
  staticBuilders = {},
}: FeatureSettingsSyncProps) {
  const { registerSettings, unregisterSettings } = useSettingsRegistry()
  const previouslyRegistered = useRef<Set<string>>(new Set())

  const menuItems = useQuery(
    api["features/menus/menuItems"].getWorkspaceMenuItems,
    workspaceId ? { workspaceId } : "skip"
  ) as MenuItem[] | undefined

  const featureMenuItems = useMemo(() => {
    if (!Array.isArray(menuItems)) {
      return []
    }

    return menuItems.filter(
      (item) =>
        item &&
        typeof item.slug === "string" &&
        !["folder", "divider", "action"].includes(item.type)
    )
  }, [menuItems])

  // Stable stringified slugs to prevent infinite re-renders
  const featureSlugs = useMemo(
    () => featureMenuItems.map((m) => m.slug).sort().join(","),
    [featureMenuItems]
  )

  useEffect(() => {
    if (!workspaceId || featureMenuItems.length === 0) {
      previouslyRegistered.current.forEach((slug) => unregisterSettings(slug))
      previouslyRegistered.current = new Set()
      return
    }

    // Debug: log available builders and menu items
    if (process.env.NODE_ENV === "development") {
      const registeredFeatures = getAllRegisteredFeatures()

    }

    const registeredThisRun = new Set<string>()

    featureMenuItems.forEach((menuItem) => {
      // Try dynamic registry first (new system)
      const registryBuilder = getFeatureSettingsBuilder(menuItem.slug)
      // Fallback to static builders (legacy/placeholders)
      const builder = registryBuilder || staticBuilders[menuItem.slug]
      const categories = builder ? builder({ menuItem }) : []

      if (process.env.NODE_ENV === "development") {

      }

      if (categories.length > 0) {
        registerSettings({
          featureSlug: menuItem.slug,
          categories,
        })
        registeredThisRun.add(menuItem.slug)
      } else {
        unregisterSettings(menuItem.slug)
      }
    })

    previouslyRegistered.current.forEach((slug) => {
      if (!registeredThisRun.has(slug)) {
        unregisterSettings(slug)
      }
    })

    previouslyRegistered.current = registeredThisRun
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureSlugs, workspaceId])

  return null
}
