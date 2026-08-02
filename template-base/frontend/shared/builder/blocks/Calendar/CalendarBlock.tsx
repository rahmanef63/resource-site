/**
 * Calendar Block
 * 
 * A calendar view for date selection or event display.
 * Uses react-day-picker.
 */

"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { BlockCard } from "../shared"
import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface CalendarBlockProps {
    mode?: "single" | "multiple" | "range"
    selected?: Date | Date[] | { from: Date; to: Date } | undefined
    onSelect?: (date: any) => void
    title?: string
    description?: string
    className?: string
    loading?: boolean
    events?: { date: Date; label: string; type?: "default" | "destructive" | "warning" }[]
}

// ============================================================================
// Calendar Block
// ============================================================================

export function CalendarBlock({
    mode = "single",
    selected,
    onSelect,
    title,
    description,
    className,
    loading = false,
    events,
}: CalendarBlockProps) {

    // Custom modifiers for events
    const modifiers = events ? {
        hasEvent: events.map(e => e.date)
    } : {}

    const modifiersStyles = {
        hasEvent: {
            fontWeight: 'bold',
            textDecoration: 'underline',
            color: 'var(--primary)'
        }
    }

    return (
        <BlockCard
            header={title ? { title, description, icon: CalendarDays } : undefined}
            loading={loading}
            className={className}
        >
            <div className="flex justify-center p-2">
                <Calendar
                    mode={mode as any}
                    selected={selected}
                    onSelect={onSelect}
                    className="rounded-md border shadow-sm"
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles as any}
                />
            </div>
            {events && events.length > 0 && (
                <div className="p-4 pt-0 text-sm">
                    <h4 className="font-medium mb-2 text-xs uppercase text-muted-foreground">Upcoming</h4>
                    <ul className="space-y-1">
                        {events.slice(0, 3).map((e, i) => (
                            <li key={i} className="flex justify-between">
                                <span>{e.date.toLocaleDateString()}</span>
                                <span className="text-muted-foreground">{e.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </BlockCard>
    )
}
