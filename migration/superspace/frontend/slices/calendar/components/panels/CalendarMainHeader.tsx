"use client"

import React from "react"
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CalendarMainHeaderProps {
    date: Date | undefined
    handleCreateClick: () => void
    onTodayClick?: () => void
    onPrevClick?: () => void
    onNextClick?: () => void
}

export function CalendarMainHeader({ 
    date, 
    handleCreateClick,
    onTodayClick,
    onPrevClick,
    onNextClick
}: CalendarMainHeaderProps) {
    return (
        <div className="flex items-center justify-between px-6 py-4 bg-background border-b">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                    <Button aria-label="Previous" variant="ghost" size="icon" className="h-7 w-7" onClick={onPrevClick}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-3 text-xs font-medium" onClick={onTodayClick}>
                        Today
                    </Button>
                    <Button aria-label="Next" variant="ghost" size="icon" className="h-7 w-7" onClick={onNextClick}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-xl tracking-tight">
                        {date?.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </div>
            <Button onClick={() => handleCreateClick()} className="shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                New Event
            </Button>
        </div>
    )
}
