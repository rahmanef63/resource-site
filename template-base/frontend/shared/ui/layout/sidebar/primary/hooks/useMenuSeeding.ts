"use client"

import { useEffect, useRef } from "react"
import { useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@/convex/_generated/dataModel"

const REQUIRED_MENU_SLUGS = [
  "chat",
  "chats",
  "calls",
  "status",
  "starred",
  "archived",
  "settings",
  "profile",
  "members",
  "Contacts",
  "documents",
  "canvas",
  "menus",
  "invitations",
  "user-settings",
]

/**
 * Hook for auto-seeding default menu items
 * Syncs required menu slugs when workspace menu is incomplete
 */
export function useMenuSeeding(
  workspaceId: Id<"workspaces"> | null,
  menuItems: any[] | undefined
) {
  const createDefaults = useMutation(
    api["features/menus/menuItems"].syncWorkspaceDefaultMenus
  )
  const seededRef = useRef<string | null>(null)
  
  useEffect(() => {
    if (!workspaceId) return
    if (!Array.isArray(menuItems)) return
    
    const key = String(workspaceId)
    const missingSlugs = REQUIRED_MENU_SLUGS.filter(
      (slug) => !menuItems.some((mi) => String(mi.slug) === slug)
    )
    
    if (missingSlugs.length === 0) {
      seededRef.current = key
      return
    }
    
    const trackedKey = `${key}:${missingSlugs.join(",")}`
    if (seededRef.current === trackedKey) return

    seededRef.current = trackedKey
    createDefaults({ workspaceId, featureSlugs: missingSlugs })
      .then(() => {
        seededRef.current = key
      })
      .catch(() => {
        seededRef.current = null
      })
  }, [workspaceId, menuItems, createDefaults])
}
