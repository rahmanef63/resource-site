/**
 * Kpi Thresholds Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { KpiThresholdsGeneralSettings } from "./settings"

registerFeatureSettings("kpi-thresholds", () => [
  {
    id: "kpi-thresholds-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: KpiThresholdsGeneralSettings,
  },
])
