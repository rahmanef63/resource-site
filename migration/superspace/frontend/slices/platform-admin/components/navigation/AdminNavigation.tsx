"use client"

import React from "react"
import {
  Shield,
  Store,
  Building2,
  Users,
  Mail,
  BarChart3,
  Bug,
  Settings,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

export type AdminSection =
  | "system-features"
  | "workspaces"
  | "users"
  | "invitations"
  | "error-reports"
  | "analytics"
  | "changelog"
  | "settings"

export interface AdminNavItem {
  id: AdminSection
  label: string
  icon: React.ElementType
  badge?: string | number
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  description?: string
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: "system-features",
    label: "Menu Store",
    icon: Store,
    description: "Manage features, bundles & custom builds",
  },
  {
    id: "workspaces",
    label: "Workspaces",
    icon: Building2,
    description: "Manage all platform workspaces & hierarchy",
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    description: "Platform user management",
  },
  {
    id: "invitations",
    label: "Invitations",
    icon: Mail,
    description: "Pending workspace invitations",
  },
  {
    id: "error-reports",
    label: "Error Reports",
    icon: Bug,
    description: "User-submitted error reports",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Usage statistics and metrics",
  },
  {
    id: "changelog",
    label: "What's New",
    icon: Sparkles,
    description: "Release changelog & feature versions",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "Platform configuration",
  },
]

interface AdminNavigationProps {
  activeSection: AdminSection
  onSectionChange: (section: AdminSection) => void
  stats?: {
    features?: number
    workspaces?: number
    users?: number
    invitations?: number
    errorReports?: number
  }
  className?: string
}

export function AdminNavigation({
  activeSection,
  onSectionChange,
  stats,
  className,
}: AdminNavigationProps) {
  // Add badges based on stats
  const navItemsWithBadges = ADMIN_NAV_ITEMS.map((item) => {
    let badge: string | number | undefined
    let badgeVariant: AdminNavItem["badgeVariant"] = item.badgeVariant
    switch (item.id) {
      case "system-features":
        badge = stats?.features
        break
      case "workspaces":
        badge = stats?.workspaces
        break
      case "users":
        badge = stats?.users
        break
      case "invitations":
        badge = stats?.invitations
        break
      case "error-reports":
        badge = stats?.errorReports
        if (typeof badge === "number" && badge > 0) badgeVariant = "destructive"
        break
    }
    return { ...item, badge, badgeVariant }
  })

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-red-500 to-orange-500 p-1.5">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Platform Admin</h2>
            <p className="text-xs text-muted-foreground">Super Admin Console</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-1">
          {navItemsWithBadges.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-auto py-2.5 px-3",
                  isActive && "bg-primary/10 text-primary border border-primary/20"
                )}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-primary")} />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <Badge
                        variant={item.badgeVariant || "secondary"}
                        className="h-5 px-1.5 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 flex-shrink-0 opacity-0 transition-opacity",
                    isActive && "opacity-100"
                  )}
                />
              </Button>
            )
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-3 border-t bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          Admin v1.0.0
        </p>
      </div>
    </div>
  )
}

export { ADMIN_NAV_ITEMS }
