"use client"

/**
 * Calendar Feature Settings Components
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCalendarSettingsStorage } from "./useCalendarSettings"
import {
    SettingsSection,
    SettingsToggle,
    SettingsSelect,
    SettingsSlider,
} from "@/frontend/shared/settings/primitives"

export function CalendarGeneralSettings() {
    const { settings, updateSetting, resetSettings, isLoaded } = useCalendarSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Configure calendar defaults</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetSettings}>
                            Reset
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="default-view"
                        label="Default View"
                        description="Calendar view shown on load"
                        value={settings.defaultView}
                        onValueChange={(v) => updateSetting("defaultView", v as typeof settings.defaultView)}
                        options={[
                            { value: "month", label: "Month" },
                            { value: "week", label: "Week" },
                            { value: "day", label: "Day" },
                            { value: "agenda", label: "Agenda" },
                        ]}
                    />

                    <SettingsSelect
                        id="week-start"
                        label="Week Starts On"
                        description="First day of the week"
                        value={settings.weekStartsOn}
                        onValueChange={(v) => updateSetting("weekStartsOn", v as typeof settings.weekStartsOn)}
                        options={[
                            { value: "sunday", label: "Sunday" },
                            { value: "monday", label: "Monday" },
                        ]}
                    />

                    <SettingsSelect
                        id="time-format"
                        label="Time Format"
                        description="How times are displayed"
                        value={settings.timeFormat}
                        onValueChange={(v) => updateSetting("timeFormat", v as typeof settings.timeFormat)}
                        options={[
                            { value: "12h", label: "12-hour (AM/PM)" },
                            { value: "24h", label: "24-hour" },
                        ]}
                    />

                    <SettingsSelect
                        id="timezone"
                        label="Timezone"
                        description="Calendar timezone"
                        value={settings.timezone}
                        onValueChange={(v) => updateSetting("timezone", v as typeof settings.timezone)}
                        options={[
                            { value: "local", label: "Local Time" },
                            { value: "utc", label: "UTC" },
                        ]}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function CalendarDisplaySettings() {
    const { settings, updateSetting, isLoaded } = useCalendarSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>Customize calendar appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="weekends"
                        label="Show Weekends"
                        description="Display Saturday and Sunday"
                        checked={settings.showWeekends}
                        onCheckedChange={(v) => updateSetting("showWeekends", v)}
                    />

                    <SettingsToggle
                        id="week-numbers"
                        label="Show Week Numbers"
                        description="Display week numbers in the calendar"
                        checked={settings.showWeekNumbers}
                        onCheckedChange={(v) => updateSetting("showWeekNumbers", v)}
                    />

                    <Separator />

                    <SettingsSection title="Working Hours" description="Set your typical work schedule">
                        <SettingsSlider
                            id="work-start"
                            label="Start Hour"
                            description="When your workday begins"
                            value={settings.workingHoursStart}
                            onValueChange={(v: number[]) => updateSetting("workingHoursStart", v[0])}
                            min={0}
                            max={23}
                            step={1}
                        />

                        <SettingsSlider
                            id="work-end"
                            label="End Hour"
                            description="When your workday ends"
                            value={settings.workingHoursEnd}
                            onValueChange={(v: number[]) => updateSetting("workingHoursEnd", v[0])}
                            min={0}
                            max={23}
                            step={1}
                        />

                        <SettingsToggle
                            id="highlight-work"
                            label="Highlight Working Hours"
                            description="Visually distinguish working hours"
                            checked={settings.highlightWorkingHours}
                            onCheckedChange={(v) => updateSetting("highlightWorkingHours", v)}
                        />
                    </SettingsSection>

                    <Separator />

                    <SettingsSelect
                        id="event-color"
                        label="Event Color By"
                        description="How events are color-coded"
                        value={settings.eventColorBy}
                        onValueChange={(v) => updateSetting("eventColorBy", v as typeof settings.eventColorBy)}
                        options={[
                            { value: "calendar", label: "Calendar" },
                            { value: "category", label: "Category" },
                            { value: "status", label: "Status" },
                        ]}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export function CalendarEventSettings() {
    const { settings, updateSetting, isLoaded } = useCalendarSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Event Settings</CardTitle>
                    <CardDescription>Configure event defaults and behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsSelect
                        id="event-duration"
                        label="Default Event Duration"
                        description="Default length for new events"
                        value={String(settings.defaultEventDuration)}
                        onValueChange={(v) => updateSetting("defaultEventDuration", Number(v) as typeof settings.defaultEventDuration)}
                        options={[
                            { value: "30", label: "30 minutes" },
                            { value: "60", label: "1 hour" },
                            { value: "90", label: "90 minutes" },
                            { value: "120", label: "2 hours" },
                        ]}
                    />

                    <Separator />

                    <SettingsToggle
                        id="declined"
                        label="Show Declined Events"
                        description="Display events you've declined"
                        checked={settings.showDeclinedEvents}
                        onCheckedChange={(v) => updateSetting("showDeclinedEvents", v)}
                    />

                    <SettingsToggle
                        id="all-day"
                        label="Show All-Day Events"
                        description="Display all-day events at the top"
                        checked={settings.showAllDayEvents}
                        onCheckedChange={(v) => updateSetting("showAllDayEvents", v)}
                    />

                    <Separator />

                    <SettingsSection title="Reminders" description="Event reminder settings">
                        <SettingsToggle
                            id="reminders"
                            label="Enable Reminders"
                            description="Get notified before events"
                            checked={settings.enableEventReminders}
                            onCheckedChange={(v) => updateSetting("enableEventReminders", v)}
                        />

                        <SettingsSelect
                            id="reminder-time"
                            label="Default Reminder"
                            description="When to send reminder before event"
                            value={String(settings.defaultReminderMinutes)}
                            onValueChange={(v) => updateSetting("defaultReminderMinutes", Number(v) as typeof settings.defaultReminderMinutes)}
                            options={[
                                { value: "15", label: "15 minutes before" },
                                { value: "30", label: "30 minutes before" },
                                { value: "60", label: "1 hour before" },
                                { value: "1440", label: "1 day before" },
                            ]}
                            disabled={!settings.enableEventReminders}
                        />
                    </SettingsSection>
                </CardContent>
            </Card>
        </div>
    )
}

export function CalendarSyncSettings() {
    const { settings, updateSetting, isLoaded } = useCalendarSettingsStorage()

    if (!isLoaded) {
        return <div className="p-4 text-center text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Sync Settings</CardTitle>
                    <CardDescription>Configure calendar synchronization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SettingsToggle
                        id="auto-sync"
                        label="Auto-Sync"
                        description="Automatically sync calendar data"
                        checked={settings.autoSync}
                        onCheckedChange={(v) => updateSetting("autoSync", v)}
                    />

                    <SettingsSelect
                        id="sync-interval"
                        label="Sync Interval"
                        description="How often to sync with external calendars"
                        value={String(settings.syncInterval)}
                        onValueChange={(v) => updateSetting("syncInterval", Number(v) as typeof settings.syncInterval)}
                        options={[
                            { value: "5", label: "Every 5 minutes" },
                            { value: "15", label: "Every 15 minutes" },
                            { value: "30", label: "Every 30 minutes" },
                            { value: "60", label: "Every hour" },
                        ]}
                        disabled={!settings.autoSync}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export const CalendarSettings = CalendarGeneralSettings
