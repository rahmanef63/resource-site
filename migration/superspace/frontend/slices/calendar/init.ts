/**
 * Calendar Feature Initialization
 * Registers calendar settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Calendar, Layout, CalendarDays, RefreshCw } from "lucide-react"
import {
    CalendarGeneralSettings,
    CalendarDisplaySettings,
    CalendarEventSettings,
    CalendarSyncSettings,
} from "./settings"
import { registerCalendarAgent } from "./agent"

registerFeatureSettings("calendar", () => [
    {
        id: "calendar-general",
        label: "General",
        icon: Calendar,
        order: 100,
        component: CalendarGeneralSettings,
    },
    {
        id: "calendar-display",
        label: "Display",
        icon: Layout,
        order: 110,
        component: CalendarDisplaySettings,
    },
    {
        id: "calendar-events",
        label: "Events",
        icon: CalendarDays,
        order: 120,
        component: CalendarEventSettings,
    },
    {
        id: "calendar-sync",
        label: "Sync",
        icon: RefreshCw,
        order: 130,
        component: CalendarSyncSettings,
    },
])

registerCalendarAgent()
