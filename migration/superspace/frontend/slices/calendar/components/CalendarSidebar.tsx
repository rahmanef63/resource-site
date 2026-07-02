
import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EVENT_COLORS } from "../constants"
import { cn } from "@/lib/utils"

interface CalendarSidebarProps {
    events: any[]
    onEventClick: (event: any) => void
    title?: string
}

export function CalendarSidebar({ events, onEventClick, title = "Upcoming Events" }: CalendarSidebarProps) {
    const displayEvents = useMemo(() => {
        if (title !== "Upcoming Events") {
            return events.sort((a: any, b: any) => a.startsAt - b.startsAt)
        }

        const now = Date.now()
        return events
            .filter((e: any) => e.startsAt >= now)
            .sort((a: any, b: any) => a.startsAt - b.startsAt)
            .slice(0, 5)
    }, [events, title])

    const formatEventTime = (start: number, end: number, allDay?: boolean) => {
        if (allDay) return "All day"
        const startDate = new Date(start)
        const endDate = new Date(end)
        
        // Simple time formatting
        const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
        const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
        
        if (startDate.toDateString() === endDate.toDateString()) {
            return `${startDate.toLocaleTimeString([], timeOptions)} - ${endDate.toLocaleTimeString([], timeOptions)}`
        }
        
        return `${startDate.toLocaleDateString([], dateOptions)} ${startDate.toLocaleTimeString([], timeOptions)} - ${endDate.toLocaleDateString([], dateOptions)} ${endDate.toLocaleTimeString([], timeOptions)}`
    }

    const getColorClass = (color: string) => {
        return EVENT_COLORS.find((c: any) => c.value === color)?.class || "bg-blue-500"
    }

    return (
        <div className="w-80 border-l bg-muted/10 hidden lg:flex flex-col h-full">
            <div className="p-6 flex-1 overflow-auto">
                <h3 className="font-semibold mb-6 text-lg tracking-tight">{title}</h3>
                
                {displayEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center p-4 border-2 border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground">No events scheduled</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayEvents.map((event: any) => (
                            <div
                                key={event._id}
                                className={cn(
                                    "relative rounded-lg p-3 pl-4 text-sm transition-all hover:bg-accent cursor-pointer group border bg-card shadow-sm",
                                    "after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full",
                                    getColorClass(event.color).replace('bg-', 'after:bg-')
                                )}
                                onClick={() => onEventClick(event)}
                            >
                                <div className="font-medium group-hover:text-primary transition-colors">{event.title}</div>
                                <div className="text-muted-foreground text-xs mt-1">
                                    {formatEventTime(event.startsAt, event.endsAt, event.allDay)}
                                </div>
                                {event.location && (
                                    <div className="text-muted-foreground text-xs mt-0.5 truncate">
                                        📍 {event.location}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Stats */}
                <div className="mt-8 pt-6 border-t">
                    <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Overview</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Card className="shadow-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-primary">{events.length}</p>
                                <p className="text-xs text-muted-foreground font-medium mt-1">Total Events</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-primary">
                                    {events.filter((e: any) => e.type === "meeting").length}
                                </p>
                                <p className="text-xs text-muted-foreground font-medium mt-1">Meetings</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
