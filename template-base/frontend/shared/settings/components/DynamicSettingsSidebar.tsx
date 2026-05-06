"use client"

/**
 * Dynamic Settings Sidebar
 *
 * Automatically renders all registered settings categories
 */

import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useSettingsRegistry } from "../SettingsProvider"
import type { SettingsCategory } from "../types"

interface DynamicSettingsSidebarProps {
  /** Categories to display (overrides registry if provided) */
  categories?: SettingsCategory[]
  /** Active category ID */
  activeCategory?: string | null
  /** Callback when category changes */
  onCategoryChange?: (categoryId: string) => void
  /** Additional CSS classes */
  className?: string
  /** Whether to group settings by feature */
  groupByFeature?: boolean
  /** Show feature badges */
  showFeatureBadges?: boolean
  /** Controls container styling for layout integration */
  variant?: "standalone" | "layout"
}

export function DynamicSettingsSidebar({
  categories: providedCategories,
  activeCategory: providedActiveCategory,
  onCategoryChange,
  className,
  groupByFeature = true,
  showFeatureBadges = false,
  variant = "standalone",
}: DynamicSettingsSidebarProps) {
  const registry = useSettingsRegistry()

  // Use provided categories or fall back to registry
  const categories = providedCategories ?? registry.categories
  const activeCategory = providedActiveCategory ?? registry.activeCategory
  const setActiveCategory = onCategoryChange ?? registry.setActiveCategory

  // Group categories by feature
  const grouped = React.useMemo(() => {
    if (!groupByFeature) {
      return { core: categories }
    }

    const groups: Record<string, typeof categories> = {
      core: [],
    }

    categories.forEach((cat) => {
      const key = cat.featureSlug || "core"
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(cat)
    })

    return groups
  }, [categories, groupByFeature])

  const containerClasses = cn(
    "flex h-full flex-col min-h-0",
    variant === "standalone" ? "bg-card border-r border-border" : "bg-background/40",
    className,
  )

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {categories.length} {categories.length === 1 ? "category" : "categories"}
        </p>
      </div>

      {/* Categories */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(grouped).map(([groupKey, items], groupIndex) => (
            <div key={groupKey}>
              {groupByFeature && groupKey !== "core" && items.length > 0 && (
                <>
                  {groupIndex > 0 && <Separator className="my-2" />}
                  <div className="px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {groupKey.replace("wa-", "").replace("-", " ")}
                    </p>
                  </div>
                </>
              )}

              {items.map((category) => {
                const Icon = category.icon
                const isActive = activeCategory === category.id

                return (
                  <Button
                    key={category.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start mb-1",
                      isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{category.label}</span>
                    {category.badge && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {category.badge}
                      </Badge>
                    )}
                    {showFeatureBadges && category.featureSlug && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {category.featureSlug.replace("wa-", "")}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </div>
          ))}

          {categories.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No settings available
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
