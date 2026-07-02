/**
 * AI Chat Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { AiChatGeneralSettings } from "./settings"

registerFeatureSettings("ai-chat", () => [
  {
    id: "ai-chat-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: AiChatGeneralSettings,
  },
])
