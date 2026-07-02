"use client"

import React, { useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { EVENT_TYPES, EVENT_COLORS } from "../../constants"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CalendarLeftPanelProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    datesWithEvents: Date[]
    selectedTypes: string[]
    handleTypeToggle: (type: string) => void
    events?: any[]
    onEventClick?: (event: any) => void
    handleCreateClick?: (date?: Date) => void
}

export function CalendarLeftPanel({
    date,
    setDate,
    datesWithEvents,
    selectedTypes,
    handleTypeToggle,
    events = [],
    onEventClick = () => { },
    handleCreateClick = () => { }
}: CalendarLeftPanelProps) {

    // Custom Day Component for Mini Calendar
    const CustomDayContent = (props: any) => {
        const { date: d, activeModifiers } = props;
        return (
            <div className="relative group w-full h-full flex items-center justify-center">
                <span className="z-10">{d.getDate()}</span>
                <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-background/80 transition-opacity cursor-pointer z-20 rounded-md"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCreateClick(d);
                    }}
                >
                    <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    </div>
                </div>
            </div>
        )
    }

    // Logic from CalendarSidebar for mobile view
    const displayEvents = useMemo(() => {
        const now = Date.now()
        return events
            .filter((e: any) => e.startsAt >= now)
            .sort((a: any, b: any) => a.startsAt - b.startsAt)
            .slice(0, 3) // Show fewer on mobile
    }, [events])

    const formatEventTime = (start: number, end: number, allDay?: boolean) => {
        if (allDay) return "All day"
        const startDate = new Date(start)
        const endDate = new Date(end)
        const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
        return `${startDate.toLocaleTimeString([], timeOptions)} - ${endDate.toLocaleTimeString([], timeOptions)}`
    }

    const getColorClass = (color: string) => {
        return EVENT_COLORS.find((c: any) => c.value === color)?.class || "bg-blue-500"
    }

    return (
        <div className="space-y-6 p-1">
            {/* Mini Calendar */}
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => setDate(d)}
                        className="rounded-lg border shadow-sm bg-card"
                        classNames={{
                            selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            today: "bg-accent text-accent-foreground font-medium",
                        }}
                        modifiers={{ hasEvent: datesWithEvents }}
                        modifiersClassNames={{ hasEvent: "font-bold text-primary underline decoration-primary/50 decoration-2 underline-offset-2" }}
                        components={{
                            DayContent: CustomDayContent
                        } as any}
                    />
                </CardContent>
            </Card>

            {/* Event Type Filters */}
            <div className="space-y-4 px-2">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Event Types</h3>
                <div className="space-y-3">
                    {EVENT_TYPES.map(type => (
                        <div key={type.value} className="flex items-center space-x-3 group">
                            <Checkbox
                                id={`filter-${type.value}`}
                                checked={selectedTypes.includes(type.value)}
                                onCheckedChange={() => handleTypeToggle(type.value)}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label
                                htmlFor={`filter-${type.value}`}
                                className="text-sm font-medium cursor-pointer capitalize group-hover:text-primary transition-colors"
                            >
                                {type.name}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Only: Upcoming Events & Stats */}
            <div className="lg:hidden space-y-6 pt-4 border-t">
                <div className="px-2">
                    <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">Upcoming</h3>
                    {displayEvents.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No upcoming events</p>
                    ) : (
                        <div className="space-y-3">
                            {displayEvents.map((event: any) => (
                                <div
                                    key={event._id}
                                    className={cn(
                                        "relative rounded-lg p-2 pl-3 text-sm border bg-card shadow-sm",
                                        "after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full",
                                        getColorClass(event.color).replace('bg-', 'after:bg-')
                                    )}
                                    onClick={() => onEventClick(event)}
                                >
                                    <div className="font-medium truncate">{event.title}</div>
                                    <div className="text-muted-foreground text-xs mt-0.5">
                                        {formatEventTime(event.startsAt, event.endsAt, event.allDay)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-2">
                    <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">Overview</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Card className="shadow-sm">
                            <CardContent className="p-3 text-center">
                                <p className="text-xl font-bold text-primary">{events.length}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">Total</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm">
                            <CardContent className="p-3 text-center">
                                <p className="text-xl font-bold text-primary">
                                    {events.filter((e: any) => e.type === "meeting").length}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-medium">Meetings</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
