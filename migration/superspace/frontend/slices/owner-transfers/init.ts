/**
 * Owner Transfers Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { OwnerTransfersGeneralSettings } from "./settings"

registerFeatureSettings("owner-transfers", () => [
  {
    id: "owner-transfers-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: OwnerTransfersGeneralSettings,
  },
])
