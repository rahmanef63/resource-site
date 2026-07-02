/**
 * Cash Flow Forecast Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { CashFlowForecastGeneralSettings } from "./settings"

registerFeatureSettings("cash-flow-forecast", () => [
  {
    id: "cash-flow-forecast-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: CashFlowForecastGeneralSettings,
  },
])
