/**
 * Mentions Component
 * 
 * Provides @ mention suggestions for users, features, workspace, etc.
 * @module shared/communications/composer
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  User,
  Users,
  Hash,
  Briefcase,
  Layers,
  FolderKanban,
  Bot,
  Globe,
  Star,
  type LucideIcon,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

// =============================================================================
// Types
// =============================================================================

export type MentionType = 
  | "user" 
  | "channel" 
  | "group"
  | "workspace" 
  | "feature"
  | "project"
  | "ai"
  | "everyone"

export interface MentionItem {
  id: string
  type: MentionType
  name: string
  displayName: string
  avatar?: string
  description?: string
  /** User status */
  status?: "online" | "offline" | "idle" | "dnd"
  /** Is this a special mention like @everyone */
  isSpecial?: boolean
}

export interface MentionsProps {
  /** Search query (text after @) */
  query: string
  /** Available mention items */
  items?: MentionItem[]
  /** Selected index */
  selectedIndex: number
  /** On item select */
  onSelect: (item: MentionItem) => void
  /** Context for filtering */
  context?: "chat" | "ai" | "all"
  /** Maximum items to show per category */
  maxPerCategory?: number
  /** Custom class */
  className?: string
}

// =============================================================================
// Default Special Mentions
// =============================================================================

export const DEFAULT_SPECIAL_MENTIONS: MentionItem[] = [
  {
    id: "everyone",
    type: "everyone",
    name: "everyone",
    displayName: "@everyone",
    description: "Notify all members in this channel",
    isSpecial: true,
  },
  {
    id: "here",
    type: "everyone",
    name: "here",
    displayName: "@here",
    description: "Notify only online members",
    isSpecial: true,
  },
  {
    id: "channel",
    type: "everyone",
    name: "channel",
    displayName: "@channel",
    description: "Notify all channel members",
    isSpecial: true,
  },
]

// =============================================================================
// Icons by Type
// =============================================================================

const typeIcons: Record<MentionType, LucideIcon> = {
  user: User,
  channel: Hash,
  group: Users,
  workspace: Briefcase,
  feature: Layers,
  project: FolderKanban,
  ai: Bot,
  everyone: Globe,
}

// =============================================================================
// Status Colors
// =============================================================================

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  idle: "bg-yellow-500",
  dnd: "bg-red-500",
}

// =============================================================================
// Component
// =============================================================================

export function Mentions({
  query,
  items = [],
  selectedIndex,
  onSelect,
  context = "all",
  maxPerCategory = 5,
  className,
}: MentionsProps) {
  const listRef = React.useRef<HTMLDivElement>(null)

  // Combine special mentions with provided items
  const allItems = React.useMemo(() => {
    return [...DEFAULT_SPECIAL_MENTIONS, ...items]
  }, [items])

  // Filter by query
  const filteredItems = React.useMemo(() => {
    if (!query) return allItems

    const lowerQuery = query.toLowerCase()
    return allItems.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.displayName.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery)
    )
  }, [allItems, query])

  // Group by type
  const groupedItems = React.useMemo(() => {
    const groups: Record<MentionType, MentionItem[]> = {
      everyone: [],
      user: [],
      channel: [],
      group: [],
      workspace: [],
      feature: [],
      project: [],
      ai: [],
    }

    for (const item of filteredItems) {
      if (groups[item.type].length < maxPerCategory) {
        groups[item.type].push(item)
      }
    }

    return groups
  }, [filteredItems, maxPerCategory])

  // Scroll selected item into view
  React.useEffect(() => {
    if (listRef.current) {
      const selectedItem = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      selectedItem?.scrollIntoView({ block: "nearest" })
    }
  }, [selectedIndex])

  if (filteredItems.length === 0) {
    return (
      <div className={cn(
        "bg-popover border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground",
        className
      )}>
        No matches found for "@{query}"
      </div>
    )
  }

  const typeLabels: Record<MentionType, string> = {
    everyone: "Special",
    user: "Members",
    channel: "Channels",
    group: "Groups",
    workspace: "Workspace",
    feature: "Features",
    project: "Projects",
    ai: "AI Assistants",
  }

  let globalIndex = 0

  return (
    <div className={cn(
      "bg-popover border rounded-lg shadow-lg overflow-hidden max-h-[300px]",
      className
    )}>
      <ScrollArea className="max-h-[300px]" ref={listRef}>
        <div className="p-1">
          {(Object.entries(groupedItems) as [MentionType, MentionItem[]][]).map(
            ([type, typeItems]) => {
              if (typeItems.length === 0) return null

              const Icon = typeIcons[type]

              return (
                <div key={type} className="mb-1 last:mb-0">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Icon className="h-3 w-3" />
                    {typeLabels[type]}
                  </div>
                  {typeItems.map((item) => {
                    const itemIndex = globalIndex++
                    const ItemIcon = typeIcons[item.type]

                    return (
                      <button
                        key={item.id}
                        data-index={itemIndex}
                        onClick={() => onSelect(item)}
                        className={cn(
                          "flex items-center gap-3 w-full px-2 py-2 rounded-md text-left transition-colors",
                          itemIndex === selectedIndex
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50"
                        )}
                      >
                        {/* Avatar/Icon */}
                        {item.type === "user" ? (
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={item.avatar} />
                              <AvatarFallback className="text-xs">
                                {item.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {item.status && (
                              <span className={cn(
                                "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
                                statusColors[item.status]
                              )} />
                            )}
                          </div>
                        ) : (
                          <div className={cn(
                            "h-8 w-8 rounded-md flex items-center justify-center shrink-0",
                            item.isSpecial ? "bg-primary/10 text-primary" : "bg-muted"
                          )}>
                            <ItemIcon className="h-4 w-4" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-sm font-medium",
                              item.isSpecial && "text-primary"
                            )}>
                              {item.displayName}
                            </span>
                            {item.isSpecial && (
                              <Star className="h-3 w-3 text-primary fill-primary" />
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            }
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default Mentions
