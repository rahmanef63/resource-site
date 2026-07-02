/**
 * Upcoming Events Section
 * 
 * Displays upcoming events, deadlines, and scheduled items
 * from calendar and tasks.
 */

"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
    Calendar,
    Clock,
    AlertCircle,
    CheckSquare,
    Bell,
    type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isToday, isTomorrow, differenceInDays } from "date-fns"

// ============================================================================
// Types
// ============================================================================

export type EventUrgency = "overdue" | "today" | "soon" | "upcoming" | "later"

export interface UpcomingEvent {
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

export interface UpcomingEventsSectionProps {
    /** Events to display */
    events: UpcomingEvent[]
    /** Maximum events to show */
    maxEvents?: number
    /** Section title */
    title?: string
    /** Section description */
    description?: string
    /** Loading state */
    loading?: boolean
    /** Click handler */
    onEventClick?: (event: UpcomingEvent) => void
    /** Additional className */
    className?: string
}

// ============================================================================
// Event Type Icons
// ============================================================================

const EVENT_TYPE_ICONS: Record<string, LucideIcon> = {
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

const URGENCY_STYLES: Record<EventUrgency, { badge: string; dot: string }> = {
    overdue: { badge: "bg-red-100 text-red-600", dot: "bg-red-500" },
    today: { badge: "bg-orange-100 text-orange-600", dot: "bg-orange-500" },
    soon: { badge: "bg-yellow-100 text-yellow-600", dot: "bg-yellow-500" },
    upcoming: { badge: "bg-blue-100 text-blue-600", dot: "bg-blue-500" },
    later: { badge: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
}

function formatEventTime(event: UpcomingEvent): string {
    const date = typeof event.startTime === 'number'
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

// ============================================================================
// Event Row
// ============================================================================

function EventRow({
    event,
    onClick
}: {
    event: UpcomingEvent
    onClick?: (event: UpcomingEvent) => void
}) {
    const Icon = EVENT_TYPE_ICONS[event.type] || Calendar
    const date = typeof event.startTime === 'number'
        ? new Date(event.startTime)
        : event.startTime
    const urgency = getEventUrgency(date)
    const styles = URGENCY_STYLES[urgency]

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
                {event.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {event.description}
                    </p>
                )}
            </div>

            <Badge className={cn("text-xs shrink-0", styles.badge)}>
                {urgency === "overdue" ? "Overdue" :
                    urgency === "today" ? "Today" :
                        urgency === "soon" ? "Tomorrow" :
                            urgency === "upcoming" ? "This week" : "Later"}
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
// Upcoming Events Section
// ============================================================================

export function UpcomingEventsSection({
    events,
    maxEvents = 5,
    title = "Upcoming",
    description = "Events, tasks, and deadlines",
    loading = false,
    onEventClick,
    className,
}: UpcomingEventsSectionProps) {
    // Sort by start time and filter to future/recent events
    const sortedEvents = [...events]
        .sort((a, b) => {
            const aTime = typeof a.startTime === 'number' ? a.startTime : a.startTime.getTime()
            const bTime = typeof b.startTime === 'number' ? b.startTime : b.startTime.getTime()
            return aTime - bTime
        })
        .slice(0, maxEvents)

    const overdueCount = events.filter(e => {
        const date = typeof e.startTime === 'number' ? new Date(e.startTime) : e.startTime
        return date < new Date()
    }).length

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {title}
                            {overdueCount > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                    {overdueCount} overdue
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {loading ? (
                    <div className="p-4 space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-1 h-10 bg-muted animate-pulse rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sortedEvents.length > 0 ? (
                    <ScrollArea className="max-h-[300px] px-4 pb-4">
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
                ) : (
                    <div className="p-8 text-center">
                        <Calendar className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No upcoming events</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Your schedule is clear!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
