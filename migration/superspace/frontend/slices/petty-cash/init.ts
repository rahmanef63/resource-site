/**
 * Petty Cash Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { PettyCashGeneralSettings } from "./settings"

registerFeatureSettings("petty-cash", () => [
  {
    id: "petty-cash-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: PettyCashGeneralSettings,
  },
])
