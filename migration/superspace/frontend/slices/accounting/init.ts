/**
 * Accounting Feature Initialization
 * Registers accounting settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Calculator } from "lucide-react"
import { AccountingSettings } from "./settings"
import { registerAccountingAgent } from "./agent"

registerFeatureSettings("accounting", () => [
  {
    id: "accounting-general",
    label: "Accounting",
    icon: Calculator,
    order: 100,
    component: AccountingSettings,
  },
])

registerAccountingAgent()
