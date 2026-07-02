"use client"

import React from "react"
import {
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Link as LinkIcon,
  X,
  Filter,
  Sparkles,
  Star,
  Clock3,
  Inbox,
  ArrowUpDown,
  Search,
  Tags as TagsIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type {
  ContentType,
  ContentStatus,
  SortBy,
  SortOrder,
  ContentFiltersType as ContentFilters,
} from "../hooks/useContentLibrary"

interface ContentFiltersProps {
  filters: ContentFilters
  onUpdateFilters: (filters: Partial<ContentFilters>) => void
  onClearFilters: () => void
  availableTags?: string[]
  availableFolders?: string[]
  /** Optional search input value (renders compact search bar inline) */
  searchValue?: string
  /** Optional search change handler — when omitted, search bar is hidden */
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}

const contentTypes: { value: ContentType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "image", label: "Images", icon: ImageIcon },
  { value: "video", label: "Videos", icon: Video },
  { value: "audio", label: "Audio", icon: Music },
  { value: "document", label: "Documents", icon: FileText },
  { value: "link", label: "Links", icon: LinkIcon },
]

const contentStatuses: { value: ContentStatus; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "draft", label: "Draft" },
  { value: "processing", label: "Processing" },
  { value: "failed", label: "Failed" },
  { value: "archived", label: "Archived" },
]

const sortOptions: { value: SortBy; label: string }[] = [
  { value: "createdAt", label: "Date Created" },
  { value: "updatedAt", label: "Date Modified" },
  { value: "name", label: "Name" },
  { value: "fileSize", label: "File Size" },
  { value: "usageCount", label: "Usage Count" },
]

/**
 * Compact filter bar — single row: [search] [filters ▾] [sort ▾] [tags ▾] [clear]
 *
 * All filter controls live behind dropdowns/popovers to keep the sidebar
 * header minimal. Active filter count badge surfaces state at a glance.
 */
export function ContentFiltersBar({
  filters,
  onUpdateFilters,
  onClearFilters,
  availableTags = [],
  availableFolders = [],
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search content…",
}: ContentFiltersProps) {
  const activeFilterCount = [
    filters.type,
    filters.status,
    filters.folder,
    filters.tags?.length,
    filters.favoriteOnly,
    filters.aiGeneratedOnly,
    filters.unusedOnly,
    filters.recentOnly,
  ].filter(Boolean).length

  const tagCount = filters.tags?.length ?? 0
  const hasSortChange =
    (filters.sortBy && filters.sortBy !== "createdAt") ||
    (filters.sortOrder && filters.sortOrder !== "desc")

  return (
    <div className="flex items-center gap-1.5 w-full">
      {/* Search */}
      {onSearchChange && (
        <div className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 pl-7 pr-2 text-xs"
          />
        </div>
      )}

      {/* Filters popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={activeFilterCount > 0 ? "secondary" : "outline"}
            size="icon"
            className={cn("h-8 w-8 shrink-0 relative", activeFilterCount > 0 && "border-primary/30")}
            aria-label={`Filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ""}`}
          >
            <Filter className="h-3.5 w-3.5" />
            {activeFilterCount > 0 && (
              <Badge
                variant="default"
                className="absolute -right-1 -top-1 h-4 min-w-[16px] px-1 text-[10px] tabular-nums"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-3 space-y-3">
          {/* Quick toggles */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Quick filters
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
              <FilterToggle
                icon={Star}
                label="Favorites"
                active={!!filters.favoriteOnly}
                onClick={() => onUpdateFilters({ favoriteOnly: !filters.favoriteOnly })}
              />
              <FilterToggle
                icon={Sparkles}
                label="AI only"
                active={!!filters.aiGeneratedOnly}
                onClick={() => onUpdateFilters({ aiGeneratedOnly: !filters.aiGeneratedOnly })}
              />
              <FilterToggle
                icon={Inbox}
                label="Unused"
                active={!!filters.unusedOnly}
                onClick={() => onUpdateFilters({ unusedOnly: !filters.unusedOnly })}
              />
              <FilterToggle
                icon={Clock3}
                label="Recent"
                active={!!filters.recentOnly}
                onClick={() => onUpdateFilters({ recentOnly: !filters.recentOnly })}
              />
            </div>
          </div>

          <Separator />

          {/* Selects */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Refine
            </Label>

            <Select
              value={filters.type || "all"}
              onValueChange={(value) =>
                onUpdateFilters({ type: value === "all" ? undefined : (value as ContentType) })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-3 w-3" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                onUpdateFilters({ status: value === "all" ? undefined : (value as ContentStatus) })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {contentStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {availableFolders.length > 0 && (
              <Select
                value={filters.folder || "all"}
                onValueChange={(value) =>
                  onUpdateFilters({ folder: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All folders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All folders</SelectItem>
                  {availableFolders.map((folder) => (
                    <SelectItem key={folder} value={folder}>
                      {folder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Sort popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={hasSortChange ? "secondary" : "outline"}
            size="icon"
            className="h-8 w-8 shrink-0"
            aria-label="Sort"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-3 space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Sort by
          </Label>
          <Select
            value={filters.sortBy || "createdAt"}
            onValueChange={(value) => onUpdateFilters({ sortBy: value as SortBy })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.sortOrder || "desc"}
            onValueChange={(value) => onUpdateFilters({ sortOrder: value as SortOrder })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest first</SelectItem>
              <SelectItem value="asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </PopoverContent>
      </Popover>

      {/* Tags popover (only when tags available) */}
      {availableTags.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={tagCount > 0 ? "secondary" : "outline"}
              size="icon"
              className={cn("h-8 w-8 shrink-0 relative", tagCount > 0 && "border-primary/30")}
              aria-label={`Tags${tagCount > 0 ? ` (${tagCount} selected)` : ""}`}
            >
              <TagsIcon className="h-3.5 w-3.5" />
              {tagCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -right-1 -top-1 h-4 min-w-[16px] px-1 text-[10px] tabular-nums"
                >
                  {tagCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-3 space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tags
            </Label>
            <div className="space-y-1.5 max-h-[240px] overflow-auto">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center gap-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={filters.tags?.includes(tag)}
                    onCheckedChange={(checked) => {
                      const currentTags = filters.tags || []
                      if (checked) {
                        onUpdateFilters({ tags: [...currentTags, tag] })
                      } else {
                        onUpdateFilters({
                          tags: currentTags.filter((t) => t !== tag),
                        })
                      }
                    }}
                  />
                  <Label htmlFor={`tag-${tag}`} className="text-xs cursor-pointer flex-1">
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Clear */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={onClearFilters}
          aria-label="Clear filters"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}

interface FilterToggleProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
  onClick: () => void
}

function FilterToggle({ icon: Icon, label, active, onClick }: FilterToggleProps) {
  return (
    <Button
      variant={active ? "secondary" : "outline"}
      size="sm"
      className={cn("h-8 text-xs gap-1 justify-start", active && "border-primary/30")}
      onClick={onClick}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Button>
  )
}
