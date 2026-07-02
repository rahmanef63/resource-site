/**
 * AI Router Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { AiRouterGeneralSettings } from "./settings"

registerFeatureSettings("ai-router", () => [
  {
    id: "ai-router-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: AiRouterGeneralSettings,
  },
])
