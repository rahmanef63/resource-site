/**
 * AI Admin Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { AiAdminGeneralSettings } from "./settings"

registerFeatureSettings("ai-admin", () => [
  {
    id: "ai-admin-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: AiAdminGeneralSettings,
  },
])
