/**
 * Qsr Petty Cash Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { QsrPettyCashGeneralSettings } from "./settings"

registerFeatureSettings("qsr-petty-cash", () => [
  {
    id: "qsr-petty-cash-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: QsrPettyCashGeneralSettings,
  },
])
