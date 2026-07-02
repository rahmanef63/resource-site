"use client"

import React, { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import {
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Link as LinkIcon,
  MoreHorizontal,
  Sparkles,
  Star,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { Id } from "@convex/_generated/dataModel"
import type { ContentItem, ContentType } from "../hooks/useContentLibrary"

interface ContentListProps {
  items: ContentItem[]
  selectedId: Id<"content"> | null
  onSelect: (id: Id<"content">) => void
  selectionMode?: boolean
  selectedIds?: Set<string>
  onToggleSelection?: (id: Id<"content">) => void
  onDelete?: (id: Id<"content">) => void
  onDuplicate?: (id: Id<"content">) => void
  onToggleFavorite?: (id: Id<"content">, nextValue: boolean) => void
  groupByType?: boolean
  viewMode?: "list" | "grid"
}

const typeIcons: Record<ContentType, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
  link: LinkIcon,
}

const typeLabels: Record<ContentType, string> = {
  image: "Images",
  video: "Videos",
  audio: "Audio",
  document: "Documents",
  link: "Links",
}

const typeColors: Record<ContentType, string> = {
  image: "bg-pink-500/10 text-pink-500",
  video: "bg-purple-500/10 text-purple-500",
  audio: "bg-orange-500/10 text-orange-500",
  document: "bg-blue-500/10 text-blue-500",
  link: "bg-green-500/10 text-green-500",
}

const STORAGE_KEY = "content-list-collapsed-sections"

function formatFileSize(bytes?: number): string {
  if (!bytes) return ""
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

// Thumbnail component with optional hover zoom
function ThumbnailWithZoom({
  item,
  Icon
}: {
  item: ContentItem
  Icon: React.ComponentType<{ className?: string }>
}) {
  const hasImage = item.thumbnailUrl || (item.type === "image" && item.fileUrl)
  const imageSrc = item.thumbnailUrl || item.fileUrl || ""

  const thumbnailContent = (
    <div
      className={cn(
        "flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center overflow-hidden",
        hasImage ? "bg-muted" : typeColors[item.type]
      )}
    >
      {hasImage ? (
        <Image
          src={imageSrc}
          alt={item.name}
          width={40}
          height={40}
          className="h-full w-full object-cover"
          sizes="40px"
        />
      ) : (
        <Icon className="h-5 w-5" />
      )}
    </div>
  )

  // Only show hover card for images with URLs
  if (hasImage && (item.type === "image" || item.type === "video")) {
    return (
      <HoverCard openDelay={300} closeDelay={100}>
        <HoverCardTrigger asChild>
          {thumbnailContent}
        </HoverCardTrigger>
        <HoverCardContent
          side="right"
          align="start"
          className="w-auto p-2"
        >
          <div className="overflow-hidden rounded-md">
            <Image
              src={imageSrc}
              alt={item.name}
              width={200}
              height={200}
              className="max-w-[200px] max-h-[200px] object-contain"
              sizes="200px"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center truncate max-w-[200px]">
            {item.name}
          </p>
        </HoverCardContent>
      </HoverCard>
    )
  }

  return thumbnailContent
}

// Single content item row
function ContentItemRow({
  item,
  isSelected,
  isChecked,
  selectionMode,
  onSelect,
  onToggleSelection,
  onDelete,
  onDuplicate,
  onToggleFavorite,
}: {
  item: ContentItem
  isSelected: boolean
  isChecked: boolean
  selectionMode: boolean
  onSelect: (id: Id<"content">) => void
  onToggleSelection?: (id: Id<"content">) => void
  onDelete?: (id: Id<"content">) => void
  onDuplicate?: (id: Id<"content">) => void
  onToggleFavorite?: (id: Id<"content">, nextValue: boolean) => void
}) {
  const Icon = typeIcons[item.type]

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors",
        isSelected
          ? "bg-accent text-accent-foreground"
          : "hover:bg-muted/50"
      )}
      onClick={() => !selectionMode && onSelect(item._id)}
    >
      {/* Selection checkbox */}
      {selectionMode && (
        <Checkbox
          checked={isChecked}
          onCheckedChange={() => onToggleSelection?.(item._id)}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Thumbnail with hover zoom */}
      <ThumbnailWithZoom item={item} Icon={Icon} />

      {/* Content info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{item.name}</p>
          {item.aiGenerated && (
            <Sparkles className="h-3 w-3 text-purple-500 flex-shrink-0" />
          )}
          {item.isFavorite ? (
            <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />
          ) : null}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(item.fileSize)}</span>
          {item.fileSize && <span>•</span>}
          <span>{formatDate(item.createdAt)}</span>
        </div>
      </div>

      {/* Actions */}
      {!selectionMode && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="More options"
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDuplicate?.(item._id)}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleFavorite?.(item._id, !item.isFavorite)}>
              <Star className={cn("mr-2 h-4 w-4", item.isFavorite && "fill-amber-400 text-amber-400")} />
              {item.isFavorite ? "Remove Favorite" : "Add Favorite"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(item._id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

// Collapsible section for a content type
function ContentTypeSection({
  type,
  items,
  isOpen,
  onToggle,
  selectedId,
  onSelect,
  selectionMode,
  selectedIds,
  onToggleSelection,
  onDelete,
  onDuplicate,
  onToggleFavorite,
}: {
  type: ContentType
  items: ContentItem[]
  isOpen: boolean
  onToggle: () => void
  selectedId: Id<"content"> | null
  onSelect: (id: Id<"content">) => void
  selectionMode: boolean
  selectedIds: Set<string>
  onToggleSelection?: (id: Id<"content">) => void
  onDelete?: (id: Id<"content">) => void
  onDuplicate?: (id: Id<"content">) => void
  onToggleFavorite?: (id: Id<"content">, nextValue: boolean) => void
}) {
  const Icon = typeIcons[type]

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between h-8 px-2 mb-1"
        >
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <Icon className={cn("h-3.5 w-3.5", typeColors[type].split(" ")[1])} />
            <span className="text-xs font-medium">{typeLabels[type]}</span>
          </div>
          <Badge variant="secondary" className="h-5 text-xs">
            {items.length}
          </Badge>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5 pl-2">
          {items.map((item) => (
            <ContentItemRow
              key={item._id}
              item={item}
              isSelected={selectedId === item._id}
              isChecked={selectedIds.has(item._id)}
              selectionMode={selectionMode}
              onSelect={onSelect}
              onToggleSelection={onToggleSelection}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function ContentList({
  items,
  selectedId,
  onSelect,
  selectionMode = false,
  selectedIds = new Set(),
  onToggleSelection,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  groupByType = true,
  viewMode = "list",
}: ContentListProps) {
  // Load collapsed state from localStorage
  const [collapsedSections, setCollapsedSections] = useState<Set<ContentType>>(() => {
    if (typeof window === "undefined") return new Set()
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return new Set(JSON.parse(saved) as ContentType[])
      }
    } catch {
      // Ignore errors
    }
    return new Set()
  })

  // Save collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...collapsedSections]))
    }
  }, [collapsedSections])

  const toggleSection = (type: ContentType) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  // Group items by type
  const groupedItems = useMemo(() => {
    const groups: Partial<Record<ContentType, ContentItem[]>> = {}
    const typeOrder: ContentType[] = ["image", "video", "audio", "document", "link"]

    for (const type of typeOrder) {
      const typeItems = items.filter((item) => item.type === type)
      if (typeItems.length > 0) {
        groups[type] = typeItems
      }
    }

    return groups
  }, [items])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No content found</p>
      </div>
    )
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = typeIcons[item.type]
          const imageSrc = item.thumbnailUrl || item.fileUrl || ""
          const hasImage = Boolean(item.thumbnailUrl || (item.type === "image" && item.fileUrl))

          return (
            <button
              key={item._id}
              type="button"
              onClick={() => {
                if (selectionMode) {
                  onToggleSelection?.(item._id)
                  return
                }
                onSelect(item._id)
              }}
              className={cn(
                "relative overflow-hidden rounded-xl border bg-background text-left transition-colors hover:border-primary/40 hover:bg-muted/30",
                selectedId === item._id && !selectionMode && "border-primary bg-primary/5",
                selectionMode && selectedIds.has(item._id) && "border-primary bg-primary/5",
              )}
            >
              <div className="aspect-[4/3] bg-muted">
                {hasImage ? (
                  <Image
                    src={imageSrc}
                    alt={item.name}
                    width={480}
                    height={360}
                    className="h-full w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className={cn("flex h-full items-center justify-center", typeColors[item.type])}>
                    <Icon className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(item.fileSize) || typeLabels[item.type]}
                    </p>
                  </div>
                  {item.aiGenerated ? (
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {typeLabels[item.type]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                </div>
              </div>
              {item.isFavorite ? (
                <div className="absolute right-3 top-3 rounded-full bg-background/90 p-1 shadow-sm">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </div>
              ) : null}
            </button>
          )
        })}
      </div>
    )
  }

  // Grouped view with collapsible sections
  if (groupByType) {
    return (
      <div className="space-y-1">
        {(Object.entries(groupedItems) as [ContentType, ContentItem[]][]).map(([type, typeItems]) => (
          <ContentTypeSection
            key={type}
            type={type}
            items={typeItems}
            isOpen={!collapsedSections.has(type)}
            onToggle={() => toggleSection(type)}
            selectedId={selectedId}
            onSelect={onSelect}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onToggleSelection={onToggleSelection}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    )
  }

  // Flat list view (original behavior)
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <ContentItemRow
          key={item._id}
          item={item}
          isSelected={selectedId === item._id}
          isChecked={selectedIds.has(item._id)}
          selectionMode={selectionMode}
          onSelect={onSelect}
          onToggleSelection={onToggleSelection}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}
