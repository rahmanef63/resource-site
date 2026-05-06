import React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

interface CalendarHeaderProps {
    month: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onJumpToday: () => void;
    onAddEvent?: () => void;
    customControls?: React.ReactNode;
}

export const CalendarHeader = ({
    month,
    onPrevMonth,
    onNextMonth,
    onJumpToday,
    onAddEvent,
    customControls
}: CalendarHeaderProps) => {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={onPrevMonth} className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onNextMonth} className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <h2 className="text-2xl font-bold">
                    {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </h2>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onJumpToday}>
                    Today
                </Button>
                {customControls}
                {onAddEvent && (
                    <Button size="sm" onClick={onAddEvent} className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Event
                    </Button>
                )}
            </div>
        </div>
    )
}
