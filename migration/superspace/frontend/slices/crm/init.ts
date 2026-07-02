/**
 * CRM Feature Initialization
 * Registers CRM settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Users, Layout, Bell, Zap } from "lucide-react"
import {
    CRMGeneralSettings,
    CRMDisplaySettings,
    CRMNotificationSettings,
    CRMAutomationSettings,
} from "./settings"
import { registerCrmAgent } from "./agent"

registerFeatureSettings("crm", () => [
    {
        id: "crm-general",
        label: "General",
        icon: Users,
        order: 100,
        component: CRMGeneralSettings,
    },
    {
        id: "crm-display",
        label: "Display",
        icon: Layout,
        order: 110,
        component: CRMDisplaySettings,
    },
    {
        id: "crm-notifications",
        label: "Notifications",
        icon: Bell,
        order: 120,
        component: CRMNotificationSettings,
    },
    {
        id: "crm-automation",
        label: "Automation",
        icon: Zap,
        order: 130,
        component: CRMAutomationSettings,
    },
])

registerCrmAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
