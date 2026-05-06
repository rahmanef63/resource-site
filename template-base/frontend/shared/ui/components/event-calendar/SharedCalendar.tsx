import React, { useMemo } from "react"
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { Card } from "@/components/ui/card"
import { CalendarDay } from "./CalendarDay"
import { CalendarHeader } from "./CalendarHeader"
import { CalendarEvent, CalendarViewMode } from "./types"
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    addDays,
    subDays
} from "date-fns"

interface SharedCalendarProps {
    month: Date;
    events: CalendarEvent[];
    onMonthChange: (date: Date) => void;
    date: Date | undefined;
    onDateSelect: (date: Date | undefined) => void;
    onEventDrop?: (event: CalendarEvent, newDate: Date) => void;
    onEventClick?: (event: CalendarEvent) => void;
    onAddEventClick?: (date?: Date) => void;
    renderEvent?: (event: CalendarEvent) => React.ReactNode;
    viewMode?: CalendarViewMode;
    onViewModeChange?: (mode: CalendarViewMode) => void;
    customControls?: React.ReactNode;
}

export const SharedCalendar = ({
    month,
    events,
    onMonthChange,
    date,
    onDateSelect,
    onEventDrop,
    onEventClick,
    onAddEventClick,
    renderEvent,
    viewMode = 'month',
    onViewModeChange,
    customControls
}: SharedCalendarProps) => {


    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const draggedEvent = active.data.current?.event as CalendarEvent
            const targetDateStr = over.id as string
            const targetDate = new Date(targetDateStr)

            if (draggedEvent && targetDate && !isNaN(targetDate.getTime()) && onEventDrop) {
                onEventDrop(draggedEvent, targetDate)
            }
        }
    }

    const visibleDays = useMemo(() => {
        let start: Date;
        let end: Date;

        switch (viewMode) {
            case 'month':
                start = startOfWeek(startOfMonth(month));
                end = endOfWeek(endOfMonth(month));
                // Ensure we distinct enough weeks to look like a full calendar grid if needed,
                // but date-fns start/endOfWeek usually gives just the range.
                // We might want to ensure 6 rows like before?
                // For now, implicit rows are fine, but let's stick to the visible range logic.
                // To ensure standard grid size (prevent jumping height), we could calculate end based on start+41 days.
                // Let's stick to simple start/end for now to support Week/Day cleanly.
                break;
            case 'week':
                start = startOfWeek(month);
                end = endOfWeek(month);
                break;
            case 'day':
                start = month;
                end = month;
                break;
            default:
                start = startOfWeek(startOfMonth(month));
                end = endOfWeek(endOfMonth(month));
        }

        return eachDayOfInterval({ start, end }).map(d => ({
            date: d,
            isCurrentMonth: isSameMonth(d, month)
        }));
    }, [month, viewMode])

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const handlePrev = () => {
        switch (viewMode) {
            case 'month': onMonthChange(subMonths(month, 1)); break;
            case 'week': onMonthChange(subWeeks(month, 1)); break;
            case 'day': onMonthChange(subDays(month, 1)); break;
        }
    }

    const handleNext = () => {
        switch (viewMode) {
            case 'month': onMonthChange(addMonths(month, 1)); break;
            case 'week': onMonthChange(addWeeks(month, 1)); break;
            case 'day': onMonthChange(addDays(month, 1)); break;
        }
    }

    const handleJumpToday = () => {
        const today = new Date()
        onMonthChange(today)
        onDateSelect(today)
    }

    // Grid classes based on view mode
    const getGridClasses = () => {
        switch (viewMode) {
            case 'month': return "grid-cols-7 grid-rows-6"; // Assuming 42 days roughly, or auto rows
            case 'week': return "grid-cols-7 grid-rows-1";
            case 'day': return "grid-cols-1 grid-rows-1";
            default: return "grid-cols-7";
        }
    }

    return (
        <div className="h-full flex flex-col bg-background p-4 sm:p-6 overflow-hidden">
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <CalendarHeader
                    month={month}
                    onPrevMonth={handlePrev}
                    onNextMonth={handleNext}
                    onJumpToday={handleJumpToday}
                    onAddEvent={onAddEventClick ? () => onAddEventClick(new Date()) : undefined}
                    customControls={
                        <div className="flex items-center gap-2">
                            {customControls}
                            {onViewModeChange && (
                                <div className="flex bg-muted rounded-md p-1 gap-1">
                                    {(['month', 'week', 'day'] as const).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => onViewModeChange(m)}
                                            className={`text-xs px-2 py-1 rounded-sm capitalize ${viewMode === m ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    }
                />

                <Card className="flex-1 shadow-sm border rounded-xl overflow-hidden flex flex-col bg-card">
                    {viewMode !== 'day' && (
                        <div className="grid grid-cols-7 border-b bg-muted/30">
                            {weekDays.map(day => (
                                <div key={day} className="py-3 text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={`flex-1 grid ${getGridClasses()} h-full`}>
                        {visibleDays.map(({ date: d, isCurrentMonth }, index) => {
                            const isToday = isSameDay(new Date(), d);
                            const isSelected = date ? isSameDay(date, d) : false;

                            // Filter events for this day
                            const dayEvents = events.filter(e => isSameDay(e.startsAt, d));

                            return (
                                <CalendarDay
                                    key={d.toISOString()}
                                    date={d}
                                    isCurrentMonth={isCurrentMonth}
                                    isToday={isToday}
                                    isSelected={isSelected}
                                    events={dayEvents}
                                    onDateClick={onDateSelect}
                                    onEventClick={onEventClick}
                                    onAddEventClick={onAddEventClick}
                                    renderEvent={renderEvent}
                                />
                            )
                        })}
                    </div>
                </Card>
            </DndContext>
        </div>
    )
}
