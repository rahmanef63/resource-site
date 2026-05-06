/**
 * Time Range Block
 * 
 * Time range selector dropdown.
 */

"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

// ============================================================================
// Types
// ============================================================================

export type TimeRange = "today" | "7d" | "30d" | "90d" | "year" | "all"

export interface TimeRangeBlockProps {
    value: TimeRange
    options?: TimeRange[]
    showLabel?: boolean
    lastUpdated?: number | Date
    className?: string
    onChange?: (value: TimeRange) => void
}

// ============================================================================
// Labels
// ============================================================================

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
    today: "Today",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    year: "This year",
    all: "All time",
}

// ============================================================================
// Time Range Block
// ============================================================================

export function TimeRangeBlock({
    value,
    options = ["today", "7d", "30d", "90d"],
    showLabel = true,
    lastUpdated,
    className,
    onChange,
}: TimeRangeBlockProps) {
    return (
        <div className={cn("flex items-center justify-between gap-4", className)}>
            <div className="flex items-center gap-2">
                {showLabel && (
                    <>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Time range:</span>
                    </>
                )}
                <Select value={value} onValueChange={(v) => onChange?.(v as TimeRange)}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option} value={option}>
                                {TIME_RANGE_LABELS[option]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(
                        typeof lastUpdated === "number" ? lastUpdated : lastUpdated,
                        { addSuffix: true }
                    )}
                </span>
            )}
        </div>
    )
}

export default TimeRangeBlock
