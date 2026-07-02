/**
 * Recent Items Section
 * 
 * Displays recently accessed items from across features
 * (documents, tasks, etc.)
 */

"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"

// ============================================================================
// Types
// ============================================================================

export type RecentItemType =
    | "document"
    | "task"
    | "message"
    | "event"
    | "contact"
    | "other"

export interface RecentItem {
    id: string
    type: RecentItemType
    title: string
    subtitle?: string
    timestamp: number | Date
    href?: string
    metadata?: Record<string, string | number>
}

export interface RecentItemsSectionProps {
    /** Recent items to display */
    items: RecentItem[]
    /** Maximum items to show */
    maxItems?: number
    /** Section title */
    title?: string
    /** Section description */
    description?: string
    /** Loading state */
    loading?: boolean
    /** Click handler */
    onItemClick?: (item: RecentItem) => void
    /** Additional className */
    className?: string
}

// ============================================================================
// Item Type Icons & Colors
// ============================================================================

const ITEM_TYPE_CONFIG: Record<RecentItemType, { icon: LucideIcon; colorClass: string }> = {
    document: { icon: FileText, colorClass: "bg-blue-100 text-blue-600 dark:bg-blue-900/20" },
    task: { icon: CheckSquare, colorClass: "bg-green-100 text-green-600 dark:bg-green-900/20" },
    message: { icon: MessageSquare, colorClass: "bg-purple-100 text-purple-600 dark:bg-purple-900/20" },
    event: { icon: Calendar, colorClass: "bg-orange-100 text-orange-600 dark:bg-orange-900/20" },
    contact: { icon: Users, colorClass: "bg-pink-100 text-pink-600 dark:bg-pink-900/20" },
    other: { icon: Clock, colorClass: "bg-gray-100 text-gray-600 dark:bg-gray-900/20" },
}

// ============================================================================
// Recent Item Row
// ============================================================================

function RecentItemRow({
    item,
    onClick
}: {
    item: RecentItem
    onClick?: (item: RecentItem) => void
}) {
    const config = ITEM_TYPE_CONFIG[item.type] || ITEM_TYPE_CONFIG.other
    const Icon = config.icon

    const timeAgo = formatRelativeTime(
        typeof item.timestamp === 'number' ? item.timestamp : item.timestamp
    )

    const Content = (
        <>
            <div className={cn("p-2 rounded-lg shrink-0", config.colorClass)}>
                <Icon className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                {item.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-xs">
                    {item.type}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {timeAgo}
                </span>
            </div>
        </>
    )

    // Use Next Link if href is provided (Best Practice)
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

    // Fallback to onClick or just a div
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
// Recent Items Section
// ============================================================================

export function RecentItemsSection({
    items,
    maxItems = 5,
    title = "Recent Items",
    description = "Your recently accessed items",
    loading = false,
    onItemClick,
    className,
}: RecentItemsSectionProps) {
    const displayItems = items.slice(0, maxItems)

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            {title}
                        </CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {loading ? (
                    <div className="p-4 space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : displayItems.length > 0 ? (
                    <ScrollArea className="max-h-[300px] px-4 pb-4">
                        <div className="space-y-1">
                            {displayItems.map((item) => (
                                <RecentItemRow
                                    key={item.id}
                                    item={item}
                                    onClick={onItemClick}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="p-8 text-center">
                        <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No recent items</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Items you view will appear here
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
