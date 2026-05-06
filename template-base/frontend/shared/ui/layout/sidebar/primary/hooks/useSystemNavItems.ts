"use client"

import { useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Shield, Building2, type LucideIcon } from "lucide-react"
import { useIsGuestMode } from "@/frontend/shared/foundation/provider/GuestWorkspaceProvider"
import { AUTHENTICATED_DASHBOARD_BASE, getDashboardFeatureHref } from "@/frontend/shared/ui/layout/dashboard/dashboard-routes"

export interface SystemNavItem {
  id: string
  name: string
  url: string
  icon: LucideIcon
  description?: string
  tag?: "admin"
  metadata?: Record<string, unknown>
}

/**
 * Hook for building final system nav items
 * Adds platform admin and workspace-store items when applicable
 */
export function useSystemNavItems(baseSystemItems: SystemNavItem[]) {
  const isGuestMode = useIsGuestMode()
  // Check platform admin status
  const platformAdminStatus = useQuery(
    api.features.custom.admin.checkMyPlatformAdminStatus,
    isGuestMode ? "skip" : undefined,
  )
  
  const finalSystemItems = useMemo(() => {
    if (isGuestMode) {
      return baseSystemItems
    }

    const items = [...baseSystemItems]
    
    // Always add workspace-store as system feature
    const hasWorkspaceStore = items.some((item) => item.id === "workspace-store")
    if (!hasWorkspaceStore) {
      items.push({
        id: "workspace-store",
        name: "Workspaces",
        url: getDashboardFeatureHref(AUTHENTICATED_DASHBOARD_BASE, "workspace-store"),
        icon: Building2,
        description: "Manage workspace hierarchy with nested workspaces",
        metadata: {
          featureType: "system",
        },
      })
    }
    
    // Add platform admin if user is admin
    if (platformAdminStatus?.isPlatformAdmin) {
      const hasPlatformAdmin = items.some((item) => item.id === "platform-admin")
      if (!hasPlatformAdmin) {
        items.push({
          id: "platform-admin",
          name: "Platform Admin",
          url: getDashboardFeatureHref(AUTHENTICATED_DASHBOARD_BASE, "platform-admin"),
          icon: Shield,
          description: "Super Admin panel for managing features and workspaces",
          tag: "admin" as const,
          metadata: {
            featureType: "system",
          },
        })
      }
    }
    
    return items
  }, [baseSystemItems, isGuestMode, platformAdminStatus?.isPlatformAdmin])
  
  return finalSystemItems
}
