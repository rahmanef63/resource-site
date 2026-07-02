"use client"

import { createFeatureSettingsHook } from "@/frontend/shared/settings/hooks/useSettingsStorage"

/**
 * Calendar Settings Schema
 */
export interface CalendarSettingsSchema {
    // General
    defaultView: "month" | "week" | "day" | "agenda"
    weekStartsOn: "sunday" | "monday"
    timeFormat: "12h" | "24h"
    timezone: "local" | "utc"

    // Display
    showWeekends: boolean
    showWeekNumbers: boolean
    workingHoursStart: number // 0-23
    workingHoursEnd: number // 0-23
    highlightWorkingHours: boolean
    eventColorBy: "calendar" | "category" | "status"

    // Events
    defaultEventDuration: 30 | 60 | 90 | 120 // minutes
    showDeclinedEvents: boolean
    showAllDayEvents: boolean
    enableEventReminders: boolean
    defaultReminderMinutes: 15 | 30 | 60 | 1440 // 1440 = 1 day

    // Sync
    autoSync: boolean
    syncInterval: 5 | 15 | 30 | 60 // minutes
}

export const DEFAULT_CALENDAR_SETTINGS: CalendarSettingsSchema = {
    // General
    defaultView: "month",
    weekStartsOn: "monday",
    timeFormat: "12h",
    timezone: "local",

    // Display
    showWeekends: true,
    showWeekNumbers: false,
    workingHoursStart: 9,
    workingHoursEnd: 17,
    highlightWorkingHours: true,
    eventColorBy: "calendar",

    // Events
    defaultEventDuration: 60,
    showDeclinedEvents: false,
    showAllDayEvents: true,
    enableEventReminders: true,
    defaultReminderMinutes: 15,

    // Sync
    autoSync: true,
    syncInterval: 15,
}

export const useCalendarSettingsStorage = createFeatureSettingsHook<CalendarSettingsSchema>(
    "calendar",
    DEFAULT_CALENDAR_SETTINGS
)
