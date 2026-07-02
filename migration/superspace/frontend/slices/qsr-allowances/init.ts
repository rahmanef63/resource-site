/**
 * Qsr Allowances Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { QsrAllowancesGeneralSettings } from "./settings"

registerFeatureSettings("qsr-allowances", () => [
  {
    id: "qsr-allowances-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: QsrAllowancesGeneralSettings,
  },
])
