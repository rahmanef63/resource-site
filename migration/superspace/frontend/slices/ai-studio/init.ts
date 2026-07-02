/**
 * AI Studio Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { AiStudioGeneralSettings } from "./settings"

registerFeatureSettings("ai-studio", () => [
  {
    id: "ai-studio-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: AiStudioGeneralSettings,
  },
])
