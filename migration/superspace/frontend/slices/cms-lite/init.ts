/**
 * CMS Lite Feature Initialization
 * Registers cms-lite settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Box } from "lucide-react"
import { CmsLiteSettingsPlaceholder } from "./settings/CmsLiteSettingsPlaceholder"
import { registerCmsLiteAgent } from "./agent"

registerFeatureSettings("cms-lite", () => [
  {
    id: "cms-lite-general",
    label: "Cms Lite",
    icon: Box,
    order: 100,
    component: CmsLiteSettingsPlaceholder,
  },
])

registerCmsLiteAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
