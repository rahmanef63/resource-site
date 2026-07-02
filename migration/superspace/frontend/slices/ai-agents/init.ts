/**
 * AI Agents Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { AiAgentsGeneralSettings } from "./settings"

registerFeatureSettings("ai-agents", () => [
  {
    id: "ai-agents-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: AiAgentsGeneralSettings,
  },
])
