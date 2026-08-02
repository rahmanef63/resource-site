
import * as React from "react"
import { format, addDays } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface SharedDatePickerProps {
    date?: Date
    onChange?: (date: Date | undefined) => void
    placeholder?: string
    className?: string
    disabled?: boolean
    fromDate?: Date
    toDate?: Date
    showYearPicker?: boolean

    // Feature: Presets (calendar-19 style)
    showPresets?: boolean
    presets?: { label: string; offset: number }[]

    // Feature: Time Picker (calendar-20 style)
    showTimePicker?: boolean
    timeValue?: string
    onTimeChange?: (time: string) => void
}

export function SharedDatePicker({
    date,
    onChange,
    placeholder = "Pick a date",
    className,
    disabled,
    fromDate,
    toDate,
    showYearPicker = false,
    showPresets = false,
    presets = [
        { label: "Today", offset: 0 },
        { label: "Tomorrow", offset: 1 },
        { label: "In 3 days", offset: 3 },
        { label: "In a week", offset: 7 },
    ],
    showTimePicker = false,
    timeValue,
    onTimeChange,
}: SharedDatePickerProps) {
    const [month, setMonth] = React.useState<Date>(date || new Date())

    React.useEffect(() => {
        if (date) {
            setMonth(date)
        }
    }, [date])

    const years = React.useMemo(() => {
        if (!showYearPicker) return []
        const currentYear = new Date().getFullYear()
        return Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)
    }, [showYearPicker])

    const handleYearChange = (year: string) => {
        const newDate = new Date(month)
        newDate.setFullYear(parseInt(year))
        setMonth(newDate)
        if (date) {
            const newSelectedDate = new Date(date)
            newSelectedDate.setFullYear(parseInt(year))
            onChange?.(newSelectedDate)
        }
    }

    const handlePresetClick = (offset: number) => {
        const newDate = addDays(new Date(), offset)
        onChange?.(newDate)
        setMonth(newDate)
    }

    // Generate time slots (every 30 mins)
    const timeSlots = React.useMemo(() => {
        if (!showTimePicker) return []
        return Array.from({ length: 48 }, (_, i) => {
            const totalMinutes = i * 30
            const hour = Math.floor(totalMinutes / 60)
            const minute = totalMinutes % 60
            return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        })
    }, [showTimePicker])

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                        format(date, "PPP") + (showTimePicker && timeValue ? ` at ${timeValue}` : "")
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn("w-auto p-0", showTimePicker ? "flex" : "")}
                align="start"
            >
                <div className={cn("flex flex-col", showTimePicker && "border-r")}>
                    {/* Year Picker Header */}
                    {showYearPicker && (
                        <div className="flex items-center justify-between p-3 border-b">
                            <Select
                                value={month.getFullYear().toString()}
                                onValueChange={handleYearChange}
                            >
                                <SelectTrigger className="w-[120px] h-8">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Calendar */}
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={onChange}
                        month={month}
                        onMonthChange={setMonth}
                        initialFocus
                        fromDate={fromDate}
                        toDate={toDate}
                    />

                    {/* Presets Footer */}
                    {showPresets && (
                        <div className="p-3 border-t grid grid-cols-2 gap-2">
                            {presets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7 w-full"
                                    onClick={() => handlePresetClick(preset.offset)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Time Picker Sidebar */}
                {showTimePicker && (
                    <div className="flex flex-col w-48 p-3">
                        <div className="mb-2 font-medium text-sm flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Time
                        </div>
                        <ScrollArea className="h-[300px]">
                            <div className="grid gap-1 pr-3">
                                {timeSlots.map((time) => (
                                    <Button
                                        key={time}
                                        variant={timeValue === time ? "default" : "ghost"}
                                        className="w-full justify-start h-8 text-sm font-normal"
                                        onClick={() => onTimeChange?.(time)}
                                    >
                                        {time}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
