/**
 * POS Feature Initialization
 * Registers feature settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { ShoppingCart, MonitorCheck } from "lucide-react"
import { POSGeneralSettings, POSTerminalSettings } from "./settings"
import { registerPosAgent } from "./agent"

registerFeatureSettings("pos", () => [
  {
    id: "pos-general",
    label: "General",
    icon: ShoppingCart,
    order: 500,
    component: POSGeneralSettings,
  },
  {
    id: "pos-terminal",
    label: "Terminal",
    icon: MonitorCheck,
    order: 510,
    component: POSTerminalSettings,
  },
])

registerPosAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
