"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Pin, PinOff, Star, MoreHorizontal, ExternalLink, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsGuestMode } from "@/frontend/shared/foundation/provider/GuestWorkspaceProvider"
import { toast } from "sonner"

// ============================================================================
// Types
// ============================================================================

interface PinnedItem {
  _id: Id<"favorites">
  title: string
  url: string
  icon?: string
  color?: string
  entityType: string
  isPinned: boolean
  showInSidebar: boolean
}

interface NavPinnedProps {
  workspaceId: Id<"workspaces"> | string | null
  /** Maximum items to show before collapsing */
  maxItems?: number
  /** Additional className */
  className?: string
}

// ============================================================================
// Icon Resolver
// ============================================================================

function resolveIcon(iconName?: string): React.ElementType | null {
  if (!iconName) return Star
  // For now, return Star as default. In production, use a dynamic icon resolver
  return Star
}

// ============================================================================
// NavPinned Component
// ============================================================================

export function NavPinned({ workspaceId, maxItems = 5, className }: NavPinnedProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const isGuestMode = useIsGuestMode()
  
  // Base URL for navigation
  const baseUrl = isGuestMode ? "/mock-dashboard" : "/dashboard"

  // Query pinned favorites
  const pinnedItems = useQuery(
    api.shared.favorites.favorites.getUserFavorites,
    !isGuestMode && workspaceId ? { 
      workspaceId: workspaceId as Id<"workspaces">,
      limit: maxItems 
    } : "skip"
  )

  // Filter to only show items marked for sidebar display
  const sidebarItems = React.useMemo(() => {
    if (!pinnedItems) return []
    return pinnedItems
      .filter(item => item.showInSidebar || item.isPinned)
      .slice(0, maxItems)
  }, [pinnedItems, maxItems])

  // Mutations
  const removeFromFavorites = useMutation(api.shared.favorites.favorites.removeFromFavorites)
  const togglePinMutation = useMutation(api.shared.favorites.favorites.toggleSidebarPin)

  // Handlers
  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleRemove = async (item: PinnedItem) => {
    if (isGuestMode || !workspaceId) return

    try {
      await removeFromFavorites({
        favoriteId: item._id,
        workspaceId: workspaceId as Id<"workspaces">,
      })
      toast.success("Removed from sidebar")
    } catch (error) {
      toast.error("Failed to remove item")
      console.error("Failed to remove from favorites:", error)
    }
  }

  const handleTogglePin = async (item: PinnedItem) => {
    try {
      await togglePinMutation({
        favoriteId: item._id,
        showInSidebar: !item.showInSidebar,
      })
      toast.success(item.showInSidebar ? "Unpinned from sidebar" : "Pinned to sidebar")
    } catch (error) {
      toast.error("Failed to update pin status")
      console.error("Failed to toggle pin:", error)
    }
  }

  // Don't render if no items
  if (!sidebarItems || sidebarItems.length === 0) {
    return null
  }

  return (
    <SidebarGroup className={cn("group-data-[collapsible=icon]:hidden", className)}>
      <SidebarGroupLabel>
        <Pin className="mr-1 h-3 w-3" />
        Pinned
      </SidebarGroupLabel>
      <SidebarMenu>
        {sidebarItems.map((item) => {
          const IconComponent = resolveIcon(item.icon)
          
          return (
            <SidebarMenuItem key={item._id}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link
                  href={item.url || `${baseUrl}`}
                  onClick={handleMenuClick}
                  style={item.color ? { 
                    "--item-color": item.color 
                  } as React.CSSProperties : undefined}
                >
                  {IconComponent && (
                    <IconComponent 
                      className="h-4 w-4" 
                      style={item.color ? { color: item.color } : undefined}
                    />
                  )}
                  <span className="flex-1 truncate">{item.title}</span>
                </Link>
              </SidebarMenuButton>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={item.url || "#"} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in new tab
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleTogglePin(item)}>
                    {item.showInSidebar ? (
                      <>
                        <PinOff className="mr-2 h-4 w-4" />
                        Unpin from sidebar
                      </>
                    ) : (
                      <>
                        <Pin className="mr-2 h-4 w-4" />
                        Pin to sidebar
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleRemove(item)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove from favorites
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
