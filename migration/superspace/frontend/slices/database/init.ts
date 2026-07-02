/**
 * Database Feature Initialization
 * Registers database settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Database, Layout, Zap, Edit3, Download } from "lucide-react"
import {
    DatabaseGeneralSettings,
    DatabaseDisplaySettings,
    DatabasePerformanceSettings,
    DatabaseEditingSettings,
    DatabaseExportSettings,
} from "./settings"
import { registerDatabaseAgent } from "./agent"

registerFeatureSettings("database", () => [
    {
        id: "database-general",
        label: "General",
        icon: Database,
        order: 100,
        component: DatabaseGeneralSettings,
    },
    {
        id: "database-display",
        label: "Display",
        icon: Layout,
        order: 110,
        component: DatabaseDisplaySettings,
    },
    {
        id: "database-performance",
        label: "Performance",
        icon: Zap,
        order: 120,
        component: DatabasePerformanceSettings,
    },
    {
        id: "database-editing",
        label: "Editing",
        icon: Edit3,
        order: 130,
        component: DatabaseEditingSettings,
    },
    {
        id: "database-export",
        label: "Import/Export",
        icon: Download,
        order: 140,
        component: DatabaseExportSettings,
    },
])

registerDatabaseAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
