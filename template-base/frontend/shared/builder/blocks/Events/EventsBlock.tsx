/**
 * Events Block
 * 
 * Display upcoming events with urgency indicators.
 */

"use client"

import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
    Calendar,
    CheckSquare,
    AlertCircle,
    Bell,
    type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isToday, isTomorrow, differenceInDays } from "date-fns"
import { BlockCard, getUrgencyStyle, URGENCY_COLORS } from "../shared"

// ============================================================================
// Types
// ============================================================================

export type EventUrgency = keyof typeof URGENCY_COLORS

export interface EventItem {
    id: string
    title: string
    description?: string
    startTime: number | Date
    endTime?: number | Date
    type: "event" | "task" | "deadline" | "reminder"
    isAllDay?: boolean
    color?: string
    href?: string
}

export interface EventsBlockProps {
    events: EventItem[]
    maxEvents?: number
    maxHeight?: string
    title?: string
    description?: string
    showOverdue?: boolean
    loading?: boolean
    className?: string
    onEventClick?: (event: EventItem) => void
}

// ============================================================================
// Icons
// ============================================================================

const EVENT_ICONS: Record<string, LucideIcon> = {
    event: Calendar,
    task: CheckSquare,
    deadline: AlertCircle,
    reminder: Bell,
}

// ============================================================================
// Helpers
// ============================================================================

function getEventUrgency(date: Date): EventUrgency {
    const now = new Date()
    const daysDiff = differenceInDays(date, now)

    if (date < now) return "overdue"
    if (isToday(date)) return "today"
    if (isTomorrow(date)) return "soon"
    if (daysDiff <= 7) return "upcoming"
    return "later"
}

function formatEventTime(event: EventItem): string {
    const date = typeof event.startTime === "number"
        ? new Date(event.startTime)
        : event.startTime

    if (event.isAllDay) {
        if (isToday(date)) return "Today (All day)"
        if (isTomorrow(date)) return "Tomorrow (All day)"
        return format(date, "EEE, MMM d")
    }

    if (isToday(date)) return `Today, ${format(date, "h:mm a")}`
    if (isTomorrow(date)) return `Tomorrow, ${format(date, "h:mm a")}`
    return format(date, "EEE, MMM d 'at' h:mm a")
}

const URGENCY_LABELS: Record<EventUrgency, string> = {
    overdue: "Overdue",
    today: "Today",
    soon: "Tomorrow",
    upcoming: "This week",
    later: "Later",
}

// ============================================================================
// Event Row
// ============================================================================

function EventRow({
    event,
    onClick
}: {
    event: EventItem
    onClick?: (event: EventItem) => void
}) {
    const Icon = EVENT_ICONS[event.type] || Calendar
    const date = typeof event.startTime === "number"
        ? new Date(event.startTime)
        : event.startTime
    const urgency = getEventUrgency(date)
    const styles = getUrgencyStyle(urgency)

    const Content = (
        <>
            <div
                className={cn("w-1 h-full min-h-[40px] rounded-full", styles.dot)}
                style={event.color ? { backgroundColor: event.color } : undefined}
            />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm font-medium truncate">{event.title}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {formatEventTime(event)}
                </p>
            </div>

            <Badge className={cn("text-xs shrink-0", styles.badge)}>
                {URGENCY_LABELS[urgency]}
            </Badge>
        </>
    )

    if (event.href) {
        return (
            <Link
                href={event.href}
                className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer"
            >
                {Content}
            </Link>
        )
    }

    return (
        <div
            className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-colors",
                onClick && "cursor-pointer hover:bg-muted/50"
            )}
            onClick={() => onClick?.(event)}
        >
            {Content}
        </div>
    )
}

// ============================================================================
// Events Block
// ============================================================================

export function EventsBlock({
    events,
    maxEvents = 5,
    maxHeight = "300px",
    title = "Upcoming",
    description = "Events, tasks, and deadlines",
    showOverdue = true,
    loading = false,
    className,
    onEventClick,
}: EventsBlockProps) {
    const sortedEvents = [...events]
        .sort((a, b) => {
            const aTime = typeof a.startTime === "number" ? a.startTime : a.startTime.getTime()
            const bTime = typeof b.startTime === "number" ? b.startTime : b.startTime.getTime()
            return aTime - bTime
        })
        .slice(0, maxEvents)

    const overdueCount = events.filter(e => {
        const date = typeof e.startTime === "number" ? new Date(e.startTime) : e.startTime
        return date < new Date()
    }).length

    const isEmpty = sortedEvents.length === 0

    return (
        <BlockCard
            header={{
                title,
                description,
                icon: Calendar,
                action: showOverdue && overdueCount > 0 ? (
                    <Badge variant="destructive" className="text-xs">
                        {overdueCount} overdue
                    </Badge>
                ) : undefined,
            }}
            loading={loading}
            isEmpty={isEmpty}
            emptyState={{
                icon: Calendar,
                title: "No upcoming events",
                description: "Your schedule is clear!",
            }}
            className={className}
        >
            <ScrollArea style={{ maxHeight }}>
                <div className="space-y-1">
                    {sortedEvents.map((event) => (
                        <EventRow
                            key={event.id}
                            event={event}
                            onClick={onEventClick}
                        />
                    ))}
                </div>
            </ScrollArea>
        </BlockCard>
    )
}

export default EventsBlock
