/**
 * Blog Feature Initialization
 * - Registers feature settings + agent
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { BlogGeneralSettings } from "./settings"

registerFeatureSettings("blog", () => [
  {
    id: "blog-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: BlogGeneralSettings,
  },
])
