"use client"

import type { ComponentType } from "react"
import { Bell, Bot, Home, LayoutGrid, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUnifiedMobileWorkspaceContext } from "@/frontend/shared/ui/layout/dashboard/mobile/useUnifiedMobileWorkspaceContext"
import {
  getDashboardBaseForMode,
  getDashboardFeatureHref,
  getDashboardHomeHref,
  getDashboardRouteInfo,
} from "@/frontend/shared/ui/layout/dashboard/dashboard-routes"

type DockItem = {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  isActive?: boolean
  onClick: () => void
}

export interface MobileDashboardDockProps {
  currentWorkspaceColor?: string
  onOpenProfile?: () => void
}

export function MobileDashboardDock({
  currentWorkspaceColor,
  onOpenProfile,
}: MobileDashboardDockProps) {
  const pathname = usePathname() ?? ""
  const router = useRouter()
  const { isGuestMode } = useUnifiedMobileWorkspaceContext()
  const fallbackBase = getDashboardBaseForMode(isGuestMode)
  const routeInfo = getDashboardRouteInfo(pathname, fallbackBase)
  const routeBase = routeInfo.base ?? fallbackBase
  const overviewHref = getDashboardFeatureHref(routeBase, "overview")
  const homeHref = getDashboardHomeHref(routeBase)
  const aiHref = getDashboardFeatureHref(routeBase, "ai")

  const items: DockItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutGrid,
      isActive: routeInfo.isOverview,
      onClick: () => router.push(overviewHref),
    },
    {
      id: "home",
      label: "Home",
      icon: Home,
      isActive: routeInfo.isHome,
      onClick: () => router.push(homeHref),
    },
    {
      id: "ai",
      label: "AI",
      icon: Bot,
      isActive: routeInfo.slug === "ai" || pathname.startsWith(`${aiHref}/`),
      onClick: () => router.push(aiHref),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      onClick: () => window.dispatchEvent(new Event("open-notifications")),
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      onClick: () => {
        if (onOpenProfile) {
          onOpenProfile()
          return
        }

        window.dispatchEvent(
          new CustomEvent("open-settings", {
            detail: { tab: "global", id: "gl_account" },
          }),
        )
      },
    },
  ]

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3">
      <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-between gap-1 rounded-xl border border-border/60 bg-background/95 p-2 shadow-lg backdrop-blur">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "flex h-auto min-w-0 flex-1 flex-col gap-1 rounded-xl px-2 py-2 text-[11px] text-muted-foreground",
                item.isActive && "bg-muted text-foreground",
              )}
              onClick={item.onClick}
              style={
                item.isActive && currentWorkspaceColor
                  ? {
                      boxShadow: `inset 0 0 0 1px ${currentWorkspaceColor}22`,
                    }
                  : undefined
              }
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
