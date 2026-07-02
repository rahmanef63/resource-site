/**
 * Qsr Master Data Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { QsrMasterDataGeneralSettings } from "./settings"

registerFeatureSettings("qsr-master-data", () => [
  {
    id: "qsr-master-data-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: QsrMasterDataGeneralSettings,
  },
])
