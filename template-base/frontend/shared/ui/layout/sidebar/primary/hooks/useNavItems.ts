"use client"

import { useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@/convex/_generated/dataModel"
import { getDefaultPages, PAGE_MANIFEST_MAP, COMPONENT_REGISTRY_MAP } from "@/frontend/shared/foundation/manifest"
import { iconFromName } from "@/frontend/shared/ui/icons"
import { Building, type LucideIcon } from "lucide-react"
import type { SystemNavItem } from "./useSystemNavItems"
import {
  useIsGuestMode,
  useGuestWorkspaceContextOptional,
  MOCK_MENU_ITEMS,
} from "@/frontend/shared/foundation/provider/GuestWorkspaceProvider"
import { MOCK_SYSTEM_FEATURES } from "@/frontend/shared/mock-data"
import {
  getDashboardBaseForMode,
  getDashboardFeatureHref,
  rebaseDashboardPath,
} from "@/frontend/shared/ui/layout/dashboard/dashboard-routes"

// Type for system feature visibility data
interface SystemFeatureVisibility {
  featureId: string
  isEnabled: boolean
  isPublic: boolean
  isReady: boolean
  status: string
}

interface NavItem {
  id: string
  title: string
  description?: string
  icon: React.ElementType
  type?: string
  parentId?: string
  children: NavItem[]
  metadata?: Record<string, unknown>
  isGroup?: boolean  // true if type is "group" - indicates non-navigable container
}

/**
 * Hook for building navigation items from menu items
 * Handles menu item parsing, system features, and visibility
 * Supports both authenticated mode (Convex queries) and guest mode (mock data)
 */
export function useNavItems(workspaceId: Id<"workspaces"> | string | null) {
  const isGuestMode = useIsGuestMode()
  const routeBase = getDashboardBaseForMode(isGuestMode)
  const guestContext = useGuestWorkspaceContextOptional()

  // Get guest context for workspace-specific menu items
  const guestMenuItems = isGuestMode ? guestContext?.currentMenuItems ?? null : null

  // Query menu items - skip in guest mode
  const menuItems = useQuery(
    api["features/menus/menuItems"].getWorkspaceMenuItems,
    !isGuestMode && workspaceId ? { workspaceId } : "skip",
  ) as any[] | undefined

  // Get system features for visibility info - skip in guest mode
  const systemFeatures = useQuery(
    api.features.system.admin.getSystemFeatures,
    isGuestMode ? "skip" : undefined
  ) as SystemFeatureVisibility[] | undefined


  // Use workspace-specific mock data in guest mode, query result otherwise
  const effectiveMenuItems = isGuestMode ? (guestMenuItems ?? MOCK_MENU_ITEMS) : menuItems
  const effectiveSystemFeatures = isGuestMode ? MOCK_SYSTEM_FEATURES : systemFeatures

  // Build feature visibility map
  const featureVisibilityMap = useMemo(() => {
    const map = new Map<string, SystemFeatureVisibility>()
    if (effectiveSystemFeatures) {
      for (const feature of effectiveSystemFeatures) {
        map.set(feature.featureId, feature)
      }
    }
    return map
  }, [effectiveSystemFeatures])

  // Build navigation items
  const { navItems, systemItems } = useMemo(() => {
    if (Array.isArray(effectiveMenuItems) && effectiveMenuItems.length > 0) {
      const itemsMap = new Map()
      const rootItems: NavItem[] = []
      const systemMenuItems: SystemNavItem[] = []

      effectiveMenuItems
        .filter((mi) => mi && typeof mi.slug === "string" && mi.isVisible !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .forEach((mi) => {
          const fallbackByComponent = mi.component ? COMPONENT_REGISTRY_MAP[mi.component as string] : undefined
          const fallbackBySlug = PAGE_MANIFEST_MAP[mi.slug as string]
          const fallback = fallbackByComponent ?? fallbackBySlug

          // Get visibility info from systemFeatures if available
          const featureVisibility = featureVisibilityMap.get(mi.slug as string)

          // Merge metadata with system feature visibility info
          const mergedMetadata = {
            ...mi.metadata,
            ...(featureVisibility ? {
              isEnabled: featureVisibility.isEnabled,
              isPublic: featureVisibility.isPublic,
              isReady: featureVisibility.isReady,
              status: featureVisibility.status,
            } : {}),
          }

          const navItem: NavItem = {
            id: mi.slug as string,
            title: (mi.name as string) || fallback?.title || mi.slug,
            description: (mi.metadata?.description as string) || fallback?.description,
            icon: iconFromName(mi.icon as string) || fallback?.icon || Building,
            type: mi.type,
            parentId: mi.parentId,
            children: [],
            metadata: mergedMetadata,
            isGroup: mi.type === "group", // Mark as group for special rendering
          }

          itemsMap.set(mi._id, navItem)

          // Separate system items (featureType === "system")
          const isSystemItem = mi.metadata?.featureType === "system"

          if (!mi.parentId) {
            if (isSystemItem) {
              // Cast through unknown to LucideIcon since iconFromName returns React component icons
              const iconComponent = (navItem.icon as unknown) as LucideIcon
              systemMenuItems.push({
                id: navItem.id,
                name: navItem.title,
                url: typeof mi.path === "string"
                  ? rebaseDashboardPath(mi.path, routeBase)
                  : getDashboardFeatureHref(routeBase, navItem.id),
                icon: iconComponent,
                description: navItem.description,
                metadata: mergedMetadata,
              })
            } else {
              rootItems.push(navItem)
            }
          }
        })

      // Build parent-child relationships
      effectiveMenuItems.forEach((mi) => {
        if (mi.parentId && itemsMap.has(mi.parentId)) {
          const parent = itemsMap.get(mi.parentId)
          const child = itemsMap.get(mi._id)
          if (parent && child) {
            parent.children.push({
              id: child.id,
              title: child.title,
              url: getDashboardFeatureHref(routeBase, child.id),
              metadata: child.metadata,
            })
          }
        }
      })

      return { navItems: rootItems, systemItems: systemMenuItems }
    }

    return {
      navItems: getDefaultPages().map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        icon: p.icon,
        children: [],
      })) as NavItem[],
      systemItems: [] as SystemNavItem[],
    }
  }, [effectiveMenuItems, featureVisibilityMap, routeBase])

  return { navItems, systemItems, menuItems: effectiveMenuItems }
}
