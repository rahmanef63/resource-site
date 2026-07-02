/**
 * Overview Feature Initialization
 * Registers overview-related settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Home, Settings } from "lucide-react"
import { OverviewGeneralSettings } from "./settings"
import { registerOverviewAgent } from "./agent"

registerFeatureSettings("overview", () => [
  {
    id: "overview-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: OverviewGeneralSettings,
  },
])

registerOverviewAgent()
