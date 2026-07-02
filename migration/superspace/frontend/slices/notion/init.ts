/**
 * Notion Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { NotionGeneralSettings } from "./settings"

registerFeatureSettings("notion", () => [
  {
    id: "notion-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: NotionGeneralSettings,
  },
])
