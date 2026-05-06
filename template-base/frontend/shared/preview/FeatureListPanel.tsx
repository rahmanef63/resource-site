/**
 * Feature List Panel Component
 * 
 * Middle panel that displays list of features with eye icon
 * to preview each feature
 */

"use client"

import * as React from 'react'
import { Eye, EyeOff, Search, Loader2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FeaturePreviewConfig, FeaturePreviewCategory } from './types'

interface FeatureListPanelProps {
  /** List of feature previews to display */
  features: FeaturePreviewConfig[]
  /** Currently selected feature ID */
  selectedFeatureId: string | null
  /** Callback when preview button is toggled */
  onTogglePreview: (featureId: string) => void
  /** Feature ID currently showing preview (if any) */
  previewVisibleFor: string | null
  /** Loading state */
  isLoading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Title for the panel */
  title?: string
  /** Hide the internal header (use when parent provides header) */
  hideHeader?: boolean
}

const CATEGORY_OPTIONS: { value: FeaturePreviewCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'communication', label: 'Communication' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'administration', label: 'Administration' },
  { value: 'social', label: 'Social' },
  { value: 'creativity', label: 'Creativity' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'content', label: 'Content' },
  { value: 'insights', label: 'Insights' },
  { value: 'team', label: 'Team' },
  { value: 'profile', label: 'Profile' },
]

export function FeatureListPanel({
  features,
  selectedFeatureId,
  onTogglePreview,
  previewVisibleFor,
  isLoading = false,
  emptyMessage = 'No features found',
  title = 'Features',
  hideHeader = false,
}: FeatureListPanelProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<FeaturePreviewCategory | 'all'>('all')

  // Filter features based on search and category
  const filteredFeatures = React.useMemo(() => {
    return features.filter((feature) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Category filter
      const matchesCategory = categoryFilter === 'all' || feature.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [features, searchQuery, categoryFilter])

  // Group features by category
  const groupedFeatures = React.useMemo(() => {
    const groups: Record<string, FeaturePreviewConfig[]> = {}
    
    filteredFeatures.forEach((feature) => {
      const category = feature.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(feature)
    })

    return groups
  }, [filteredFeatures])

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-muted/20">
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
    <div className="flex flex-col h-full bg-muted/20">
      {/* Header - only show if not hidden */}
      {!hideHeader && (
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{title}</h3>
            <Badge variant="secondary" className="text-xs">
              {filteredFeatures.length} features
            </Badge>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Category filter */}
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as FeaturePreviewCategory | 'all')}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Compact controls when header is hidden */}
      {hideHeader && (
        <div className="p-3 border-b space-y-2 bg-background/50">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value as FeaturePreviewCategory | 'all')}
            >
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{filteredFeatures.length} features</span>
            {categoryFilter !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-0.5 px-1.5 text-xs"
                onClick={() => setCategoryFilter('all')}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Feature list */}
      <ScrollArea className="flex-1">
        {filteredFeatures.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
              <div key={category} className="mb-4">
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {category}
                </div>
                {categoryFeatures.map((feature) => {
                  const isSelected = selectedFeatureId === feature.featureId
                  const isPreviewVisible = previewVisibleFor === feature.featureId

                  return (
                    <div
                      key={feature.featureId}
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                        isSelected
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted/50"
                      )}
                    >
                      {/* Icon placeholder */}
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold",
                        isSelected ? "bg-primary/20" : "bg-muted"
                      )}>
                        {feature.name.slice(0, 2).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {feature.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {feature.description}
                        </p>
                      </div>

                      {/* Preview toggle button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={isPreviewVisible ? "default" : "ghost"}
                              size="icon"
                              className={cn(
                                "flex-shrink-0 h-8 w-8 transition-all",
                                !isPreviewVisible && "opacity-0 group-hover:opacity-100"
                              )}
                              onClick={() => onTogglePreview(feature.featureId)}
                            >
                              {isPreviewVisible ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isPreviewVisible ? 'Hide' : 'Preview'} {feature.name}
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

export default FeatureListPanel
