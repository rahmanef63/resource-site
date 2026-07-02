/**
 * Integrations Feature Initialization
 * Registers feature settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Plug, Bell } from "lucide-react"
import { IntegrationsConnectionSettings, IntegrationsNotificationSettings } from "./settings"
import { registerIntegrationsAgent } from "./agent"

registerFeatureSettings("integrations", () => [
  {
    id: "integrations-connection",
    label: "Connection",
    icon: Plug,
    order: 500,
    component: IntegrationsConnectionSettings,
  },
  {
    id: "integrations-notifications",
    label: "Notifications",
    icon: Bell,
    order: 510,
    component: IntegrationsNotificationSettings,
  },
])

registerIntegrationsAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
