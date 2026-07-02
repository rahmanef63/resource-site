/**
 * HR Feature Initialization
 * Registers HR settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Users } from "lucide-react"
import { HrSettings } from "./settings"
import { registerHrAgent } from "./agent"

registerFeatureSettings("hr", () => [
  {
    id: "hr-general",
    label: "HR",
    icon: Users,
    order: 100,
    component: HrSettings,
  },
])

registerHrAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
