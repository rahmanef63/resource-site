/**
 * Customer Loyalty Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { CustomerLoyaltyGeneralSettings } from "./settings"

registerFeatureSettings("customer-loyalty", () => [
  {
    id: "customer-loyalty-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: CustomerLoyaltyGeneralSettings,
  },
])
