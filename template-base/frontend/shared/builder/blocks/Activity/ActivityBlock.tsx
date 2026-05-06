/**
 * Activity Block
 * 
 * Displays recent activity items in a scrollable feed.
 */

"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
    Activity,
    FileText,
    MessageSquare,
    CheckCircle2,
    UserPlus,
    Settings,
    type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { BlockCard, getTypeColor } from "../shared"

// ============================================================================
// Types
// ============================================================================

export type ActivityType =
    | "document"
    | "task"
    | "message"
    | "member"
    | "settings"
    | "general"

export interface ActivityItem {
    id: string
    type: ActivityType
    title: string
    description?: string
    timestamp: number | Date
    user?: {
        name: string
        avatar?: string
    }
    badge?: {
        label: string
        variant?: "default" | "secondary" | "destructive" | "outline"
    }
}

export interface ActivityBlockProps {
    activities: ActivityItem[]
    maxItems?: number
    maxHeight?: string
    title?: string
    description?: string
    emptyMessage?: string
    loading?: boolean
    className?: string
}

// ============================================================================
// Icons
// ============================================================================

const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
    document: FileText,
    task: CheckCircle2,
    message: MessageSquare,
    member: UserPlus,
    settings: Settings,
    general: Activity,
}

// ============================================================================
// Activity Row
// ============================================================================

function ActivityRow({ item }: { item: ActivityItem }) {
    const Icon = ACTIVITY_ICONS[item.type]
    const colorClass = getTypeColor(item.type)

    const timeAgo = formatDistanceToNow(
        typeof item.timestamp === "number" ? item.timestamp : item.timestamp,
        { addSuffix: true }
    )

    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
                <Icon className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.badge && (
                        <Badge variant={item.badge.variant ?? "secondary"} className="text-xs">
                            {item.badge.label}
                        </Badge>
                    )}
                </div>

                {item.description && (
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                )}

                <div className="flex items-center gap-2 mt-1">
                    {item.user && (
                        <span className="text-xs text-muted-foreground">{item.user.name}</span>
                    )}
                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// Activity Block
// ============================================================================

export function ActivityBlock({
    activities,
    maxItems = 10,
    maxHeight = "400px",
    title = "Recent Activity",
    description = "Latest updates across your workspace",
    emptyMessage = "No recent activity",
    loading = false,
    className,
}: ActivityBlockProps) {
    const displayActivities = activities.slice(0, maxItems)
    const isEmpty = displayActivities.length === 0

    return (
        <BlockCard
            header={{
                title,
                description,
                icon: Activity,
            }}
            loading={loading}
            isEmpty={isEmpty}
            emptyState={{
                icon: Activity,
                title: emptyMessage,
                description: "Activity will appear here as you work",
            }}
            className={className}
        >
            <ScrollArea style={{ maxHeight }}>
                <div className="space-y-1">
                    {displayActivities.map((activity) => (
                        <ActivityRow key={activity.id} item={activity} />
                    ))}
                </div>
            </ScrollArea>
        </BlockCard>
    )
}

export default ActivityBlock
