/**
 * QSR Dashboard Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { QsrDashboardGeneralSettings } from "./settings"

registerFeatureSettings("qsr-dashboard", () => [
  {
    id: "qsr-dashboard-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: QsrDashboardGeneralSettings,
  },
])
