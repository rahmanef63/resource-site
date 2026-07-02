/**
 * Qsr Payables Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { QsrPayablesGeneralSettings } from "./settings"

registerFeatureSettings("qsr-payables", () => [
  {
    id: "qsr-payables-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: QsrPayablesGeneralSettings,
  },
])
