/**
 * Sales Feature Initialization
 * Registers sales settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { DollarSign } from "lucide-react"
import { SalesSettings } from "./settings"
import { registerSalesAgent } from "./agent"

registerFeatureSettings("sales", () => [
  {
    id: "sales-general",
    label: "Sales",
    icon: DollarSign,
    order: 100,
    component: SalesSettings,
  },
])

registerSalesAgent()
