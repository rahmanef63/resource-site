import React from "react"
import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CalendarDayProps } from "./types"
import { DraggableEvent } from "./DraggableEvent"

export const CalendarDay = ({
    date,
    isCurrentMonth,
    isToday,
    isSelected,
    events,
    onDateClick,
    onEventClick,
    onAddEventClick,
    renderEvent
}: CalendarDayProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: date.toISOString(),
        data: { date }
    })

    // Sort events by time
    const sortedEvents = [...events].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())

    return (
        <div
            ref={setNodeRef}
            data-testid="calendar-day"
            className={cn(
                "min-h-[100px] sm:min-h-[120px] p-2 border-b border-r relative flex flex-col gap-1 transition-colors select-none group",
                !isCurrentMonth && "bg-muted/10 text-muted-foreground/40",
                isToday && "bg-accent/5",
                isSelected && "bg-accent/10",
                isOver && "bg-primary/5 ring-2 ring-primary/20 ring-inset z-10"
            )}
            onClick={() => onDateClick?.(date)}
        >
            <div className="flex justify-between items-start">
                <span className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer",
                    isToday
                        ? "bg-primary text-primary-foreground"
                        : isCurrentMonth ? "text-foreground" : "text-muted-foreground/50",
                    isSelected && !isToday && "bg-secondary text-secondary-foreground"
                )}>
                    {date.getDate()}
                </span>

                {onAddEventClick && (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1 hover:bg-primary/10 hover:text-primary"
                        onClick={(e) => { e.stopPropagation(); onAddEventClick(date); }}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                )}
            </div>

            <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[100px] scrollbar-hide">
                {sortedEvents.map((event) => (
                    renderEvent ? (
                        <DraggableEvent key={event.id} event={event} onClick={(e) => { e.stopPropagation(); onEventClick?.(event) }}>
                            {renderEvent(event)}
                        </DraggableEvent>
                    ) : (
                        // Fallback default rendering
                        <DraggableEvent key={event.id} event={event} onClick={(e) => { e.stopPropagation(); onEventClick?.(event) }}>
                            <div
                                className={cn(
                                    "w-full px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer shadow-sm truncate flex items-center gap-1",
                                    event.color // Expecting partial class injection or handling in renderEvent mostly
                                )}
                                title={`${event.title}`}
                            >
                                <div className={cn("w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0")} />
                                {event.title}
                            </div>
                        </DraggableEvent>
                    )
                ))}
            </div>
        </div>
    )
}
