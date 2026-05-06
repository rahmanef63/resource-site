/**
 * Feature Settings List Panel
 * 
 * Shows list of installed features with settings icon on hover
 * Similar pattern to FeatureListPanel but for settings
 * 
 * Usage in Menu Store:
 * - Shows installed menu items that have configurable settings
 * - Hover to show settings icon, click to open settings in right panel
 */

"use client"

import * as React from 'react'
import { Settings, Search, Loader2, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DynamicIcon } from '@/frontend/shared/ui/icons'
import { hasFeatureSettings } from '@/frontend/shared/foundation/utils/registry/feature-settings-registry'
import type { Id } from '@/convex/_generated/dataModel'

// Internal feature item representation
interface FeatureSettingsItem {
  slug: string
  name: string
  icon?: string | null
  description?: string
  category?: string
  hasSettings: boolean
}

import type { MenuItem } from "@/frontend/shared/foundation/types"

export interface FeatureSettingsListPanelProps {
  /** List of menu items to display (will filter for those with settings) */
  menuItems: MenuItem[]
  /** Callback when settings button is clicked - provides slug and name */
  onToggleSettings: (featureSlug: string, featureName?: string) => void
  /** Currently active settings slug (if settings panel is open) */
  activeSettingsSlug: string | null
  /** Loading state */
  isLoading?: boolean
  /** Enable search functionality */
  searchable?: boolean
  /** Show counts in header */
  showCounts?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Title for the panel */
  title?: string
  /** Hide the internal header */
  hideHeader?: boolean
  /** Additional class name */
  className?: string
}

export function FeatureSettingsListPanel({
  menuItems,
  onToggleSettings,
  activeSettingsSlug,
  isLoading = false,
  searchable = true,
  showCounts = true,
  emptyMessage = 'No features with settings found',
  title = 'Feature Settings',
  hideHeader = false,
  className,
}: FeatureSettingsListPanelProps) {
  const [searchQuery, setSearchQuery] = React.useState('')

  // Convert menu items to feature items with settings check
  const features = React.useMemo<FeatureSettingsItem[]>(() => {
    return menuItems
      .filter(item => item.slug && item.slug !== '#') // Filter out folders
      .map(item => ({
        slug: item.slug,
        name: item.name,
        icon: item.icon,
        description: item.metadata?.description as string | undefined,
        category: item.metadata?.category as string | undefined,
        hasSettings: hasFeatureSettings(item.slug),
      }))
  }, [menuItems])

  // Filter features that have settings and match search
  const filteredFeatures = React.useMemo(() => {
    return features
      .filter(f => f.hasSettings)
      .filter((feature) => {
        if (searchQuery === '') return true
        return (
          feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          feature.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          feature.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
  }, [features, searchQuery])

  // Group by category
  const groupedFeatures = React.useMemo(() => {
    const groups: Record<string, FeatureSettingsItem[]> = {}

    filteredFeatures.forEach((feature) => {
      const category = feature.category || 'Other'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(feature)
    })

    return groups
  }, [filteredFeatures])

  // Count features without settings for info
  const featuresWithoutSettings = features.filter(f => !f.hasSettings).length

  if (isLoading) {
    return (
      <div className={cn("flex flex-col h-full bg-muted/20", className)}>
        {!hideHeader && (
          <div className="p-4 border-b">
            <h3 className="font-semibold">{title}</h3>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full bg-muted/20", className)}>
      {/* Header */}
      {!hideHeader && (
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{title}</h3>
            {showCounts && (
              <Badge variant="secondary" className="text-xs">
                {filteredFeatures.length} configurable
              </Badge>
            )}
          </div>

          {/* Search */}
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          )}
        </div>
      )}

      {/* Compact controls when header is hidden */}
      {hideHeader && searchable && (
        <div className="p-3 border-b space-y-2 bg-background/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          {showCounts && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{filteredFeatures.length} with settings</span>
              {featuresWithoutSettings > 0 && (
                <span className="text-muted-foreground/60">
                  {featuresWithoutSettings} without
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Feature list */}
      <ScrollArea className="flex-1">
        {filteredFeatures.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Settings className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{emptyMessage}</p>
            {featuresWithoutSettings > 0 && (
              <p className="text-xs text-muted-foreground/60 mt-2">
                {featuresWithoutSettings} feature{featuresWithoutSettings > 1 ? 's' : ''} without settings
              </p>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
              <div key={category} className="mb-4">
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {category}
                </div>
                {categoryFeatures.map((feature) => {
                  const isActive = activeSettingsSlug === feature.slug

                  return (
                    <div
                      key={feature.slug}
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer",
                        isActive
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => onToggleSettings(feature.slug, feature.name)}
                    >
                      {/* Icon */}
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center",
                        isActive ? "bg-primary/20" : "bg-muted"
                      )}>
                        {feature.icon ? (
                          <DynamicIcon name={feature.icon} className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-bold">
                            {feature.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {feature.name}
                          </span>
                        </div>
                        {feature.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {feature.description}
                          </p>
                        )}
                      </div>

                      {/* Settings button - show on hover or when active */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={isActive ? "default" : "ghost"}
                              size="icon"
                              className={cn(
                                "flex-shrink-0 h-8 w-8 transition-all",
                                !isActive && "opacity-0 group-hover:opacity-100"
                              )}
                              onClick={(e) => {
                                e.stopPropagation()
                                onToggleSettings(feature.slug, feature.name)
                              }}
                            >
                              {isActive ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Settings className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isActive ? 'Close' : 'Configure'} {feature.name}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export default FeatureSettingsListPanel
