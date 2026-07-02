/**
 * Maintenance Scheduling Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { MaintenanceSchedulingGeneralSettings } from "./settings"

registerFeatureSettings("maintenance-scheduling", () => [
  {
    id: "maintenance-scheduling-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: MaintenanceSchedulingGeneralSettings,
  },
])
