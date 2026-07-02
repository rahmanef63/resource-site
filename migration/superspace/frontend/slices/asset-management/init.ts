/**
 * Asset Management Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { AssetManagementGeneralSettings } from "./settings"

registerFeatureSettings("asset-management", () => [
  {
    id: "asset-management-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: AssetManagementGeneralSettings,
  },
])
