/**
 * Daily Closing Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { DailyClosingGeneralSettings } from "./settings"

registerFeatureSettings("daily-closing", () => [
  {
    id: "daily-closing-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: DailyClosingGeneralSettings,
  },
])
