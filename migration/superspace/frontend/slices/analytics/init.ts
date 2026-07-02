/**
 * Analytics Feature Initialization
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { BarChart3, Layout, Database, Download } from "lucide-react"
import {
    AnalyticsGeneralSettings,
    AnalyticsDisplaySettings,
    AnalyticsDataSettings,
    AnalyticsExportSettings,
} from "./settings"
import { registerAnalyticsAgent } from "./agent"

registerFeatureSettings("analytics", () => [
    {
        id: "analytics-general",
        label: "General",
        icon: BarChart3,
        order: 100,
        component: AnalyticsGeneralSettings,
    },
    {
        id: "analytics-display",
        label: "Display",
        icon: Layout,
        order: 110,
        component: AnalyticsDisplaySettings,
    },
    {
        id: "analytics-data",
        label: "Data",
        icon: Database,
        order: 120,
        component: AnalyticsDataSettings,
    },
    {
        id: "analytics-export",
        label: "Export",
        icon: Download,
        order: 130,
        component: AnalyticsExportSettings,
    },
])

registerAnalyticsAgent()
