/**
 * Branch Health Scoring Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { BranchHealthScoringGeneralSettings } from "./settings"

registerFeatureSettings("branch-health-scoring", () => [
  {
    id: "branch-health-scoring-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: BranchHealthScoringGeneralSettings,
  },
])
