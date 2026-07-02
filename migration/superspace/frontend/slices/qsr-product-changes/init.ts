/**
 * Qsr Product Changes Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { QsrProductChangesGeneralSettings } from "./settings"

registerFeatureSettings("qsr-product-changes", () => [
  {
    id: "qsr-product-changes-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: QsrProductChangesGeneralSettings,
  },
])
