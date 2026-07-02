/**
 * Inventory Feature Initialization
 * Registers inventory settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Package, Layout, Bell, Zap } from "lucide-react"
import {
    InventoryGeneralSettings,
    InventoryDisplaySettings,
    InventoryAlertSettings,
    InventoryAutomationSettings,
} from "./settings"
import { registerInventoryAgent } from "./agent"

registerFeatureSettings("inventory", () => [
    {
        id: "inventory-general",
        label: "General",
        icon: Package,
        order: 100,
        component: InventoryGeneralSettings,
    },
    {
        id: "inventory-display",
        label: "Display",
        icon: Layout,
        order: 110,
        component: InventoryDisplaySettings,
    },
    {
        id: "inventory-alerts",
        label: "Alerts",
        icon: Bell,
        order: 120,
        component: InventoryAlertSettings,
    },
    {
        id: "inventory-automation",
        label: "Automation",
        icon: Zap,
        order: 130,
        component: InventoryAutomationSettings,
    },
])

registerInventoryAgent()
