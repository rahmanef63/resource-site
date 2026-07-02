/**
 * BI Feature Initialization
 * Registers BI settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { LineChart } from "lucide-react"
import { BiSettings } from "./settings"
import { registerBiAgent } from "./agent"

registerFeatureSettings("bi", () => [
  {
    id: "bi-general",
    label: "Business Intelligence",
    icon: LineChart,
    order: 100,
    component: BiSettings,
  },
])

registerBiAgent()
