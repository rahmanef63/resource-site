/**
 * List Block
 * 
 * Generic scrollable list for displaying recent items.
 */

"use client"

import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
    Clock,
    FileText,
    CheckSquare,
    MessageSquare,
    Calendar,
    Users,
    type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { BlockCard, getTypeColor } from "../shared"

// ============================================================================
// Types
// ============================================================================

export type ListItemType =
    | "document"
    | "task"
    | "message"
    | "event"
    | "contact"
    | "other"

export interface ListItem {
    id: string
    type: ListItemType
    title: string
    subtitle?: string
    timestamp?: number | Date
    href?: string
    metadata?: Record<string, string | number>
}

export interface ListBlockProps {
    items: ListItem[]
    maxItems?: number
    maxHeight?: string
    title?: string
    description?: string
    emptyMessage?: string
    showBadges?: boolean
    loading?: boolean
    className?: string
    onItemClick?: (item: ListItem) => void
}

// ============================================================================
// Icons
// ============================================================================

const TYPE_ICONS: Record<ListItemType, LucideIcon> = {
    document: FileText,
    task: CheckSquare,
    message: MessageSquare,
    event: Calendar,
    contact: Users,
    other: Clock,
}

// ============================================================================
// List Item Row
// ============================================================================

function ListItemRow({
    item,
    showBadges,
    onClick
}: {
    item: ListItem
    showBadges?: boolean
    onClick?: (item: ListItem) => void
}) {
    const Icon = TYPE_ICONS[item.type] || Clock
    const colorClass = getTypeColor(item.type)

    const timeAgo = item.timestamp ? formatDistanceToNow(
        typeof item.timestamp === "number" ? item.timestamp : item.timestamp,
        { addSuffix: true }
    ) : null

    const Content = (
        <>
            <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
                <Icon className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                {item.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {showBadges && (
                    <Badge variant="secondary" className="text-xs">
                        {item.type}
                    </Badge>
                )}
                {timeAgo && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {timeAgo}
                    </span>
                )}
            </div>
        </>
    )

    if (item.href) {
        return (
            <Link
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer"
            >
                {Content}
            </Link>
        )
    }

    return (
        <div
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                onClick && "cursor-pointer hover:bg-muted/50"
            )}
            onClick={() => onClick?.(item)}
        >
            {Content}
        </div>
    )
}

// ============================================================================
// List Block
// ============================================================================

export function ListBlock({
    items,
    maxItems = 5,
    maxHeight = "300px",
    title = "Recent Items",
    description = "Your recently accessed items",
    emptyMessage = "No recent items",
    showBadges = true,
    loading = false,
    className,
    onItemClick,
}: ListBlockProps) {
    const displayItems = items.slice(0, maxItems)
    const isEmpty = displayItems.length === 0

    return (
        <BlockCard
            header={{
                title,
                description,
                icon: Clock,
            }}
            loading={loading}
            isEmpty={isEmpty}
            emptyState={{
                icon: Clock,
                title: emptyMessage,
                description: "Items you view will appear here",
            }}
            className={className}
        >
            <ScrollArea style={{ maxHeight }}>
                <div className="space-y-1">
                    {displayItems.map((item) => (
                        <ListItemRow
                            key={item.id}
                            item={item}
                            showBadges={showBadges}
                            onClick={onItemClick}
                        />
                    ))}
                </div>
            </ScrollArea>
        </BlockCard>
    )
}

export default ListBlock
