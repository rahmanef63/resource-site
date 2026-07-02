import React, { useMemo } from "react"
import { SharedCalendar } from "@/frontend/shared/ui/components/event-calendar/SharedCalendar"
import { CalendarEvent, CalendarViewMode } from "@/frontend/shared/ui/components/event-calendar/types"
import { cn } from "@/lib/utils"

// Color mapping helper (kept for local rendering context)
const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
        '#3b82f6': "border-l-4 border-l-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300 hover:bg-blue-500/25",
        '#22c55e': "border-l-4 border-l-green-500 bg-green-500/15 text-green-700 dark:text-green-300 hover:bg-green-500/25",
        '#ef4444': "border-l-4 border-l-red-500 bg-red-500/15 text-red-700 dark:text-red-300 hover:bg-red-500/25",
        '#a855f7': "border-l-4 border-l-purple-500 bg-purple-500/15 text-purple-700 dark:text-purple-300 hover:bg-purple-500/25",
        '#f97316': "border-l-4 border-l-orange-500 bg-orange-500/15 text-orange-700 dark:text-orange-300 hover:bg-orange-500/25",
        '#eab308': "border-l-4 border-l-yellow-500 bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/25",
        '#ec4899': "border-l-4 border-l-pink-500 bg-pink-500/15 text-pink-700 dark:text-pink-300 hover:bg-pink-500/25",
        '#6b7280': "border-l-4 border-l-gray-500 bg-gray-500/15 text-gray-700 dark:text-gray-300 hover:bg-gray-500/25",
    }
    return colorMap[color] || "border-l-4 border-l-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300 hover:bg-blue-500/25"
}

interface CalendarCenterPanelProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    filteredEvents: any[]
    handleCreateClick: (date?: Date) => void
    month: Date
    onMonthChange: (date: Date) => void
    onEventDrop?: (event: any, newDate: Date) => void
    onEventClick?: (event: any) => void
    viewMode?: CalendarViewMode
    onViewModeChange?: (mode: CalendarViewMode) => void
}

export function CalendarCenterPanel({
    date,
    setDate,
    filteredEvents,
    handleCreateClick,
    month,
    onMonthChange,
    onEventDrop,
    onEventClick,
    viewMode = 'month',
    onViewModeChange,
}: CalendarCenterPanelProps) {

    // Map feature-specific events to shared CalendarEvent type
    const calendarEvents: CalendarEvent[] = useMemo(() => {
        return filteredEvents.map(e => ({
            id: e._id,
            title: e.title,
            startsAt: new Date(e.startsAt),
            endsAt: e.endsAt ? new Date(e.endsAt) : undefined,
            color: e.color,
            allDay: e.allDay,
            originalData: e
        }))
    }, [filteredEvents])

    const handleEventDrop = (event: CalendarEvent, newDate: Date) => {
        // Map back to original event data if needed, or just pass the mapped event
        // onEventDrop expects the original event object based on previous implementation
        onEventDrop?.(event.originalData, newDate)
    }

    const handleEventClick = (event: CalendarEvent) => {
        onEventClick?.(event.originalData)
    }

    const renderCustomEvent = (event: CalendarEvent) => {
        return (
            <div
                className={cn(
                    "w-full px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer shadow-sm truncate flex items-center gap-1",
                    getColorClasses(event.color || '#3b82f6')
                )}
                title={`${event.title} (${event.startsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
            >
                <div className={cn("w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0")} />
                {event.title}
            </div>
        )
    }

    return (
        <SharedCalendar
            month={month}
            events={calendarEvents}
            onMonthChange={onMonthChange}
            date={date}
            onDateSelect={setDate}
            onEventDrop={handleEventDrop}
            onEventClick={handleEventClick}
            onAddEventClick={handleCreateClick}
            renderEvent={renderCustomEvent}
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
        />
    )
}
