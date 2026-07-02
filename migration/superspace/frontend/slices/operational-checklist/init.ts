/**
 * Operational Checklist Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { OperationalChecklistGeneralSettings } from "./settings"

registerFeatureSettings("operational-checklist", () => [
  {
    id: "operational-checklist-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: OperationalChecklistGeneralSettings,
  },
])
