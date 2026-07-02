/**
 * Damage Reports Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { DamageReportsGeneralSettings } from "./settings"

registerFeatureSettings("damage-reports", () => [
  {
    id: "damage-reports-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: DamageReportsGeneralSettings,
  },
])
