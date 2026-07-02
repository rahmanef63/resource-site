/**
 * Platform Admin Feature Initialization
 * Registers platform admin settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Shield } from "lucide-react"
import { PlatformAdminSettings } from "./settings"
import { registerPlatformAdminAgent } from "./agent"

registerFeatureSettings("platform-admin", () => [
  {
    id: "platform-admin-general",
    label: "Platform Admin",
    icon: Shield,
    order: 100,
    component: PlatformAdminSettings,
  },
])

registerPlatformAdminAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
