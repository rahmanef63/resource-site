/**
 * Approvals Feature Initialization
 * Registers feature settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { CheckCircle, Bell, Settings } from "lucide-react"
import { ApprovalsGeneralSettings, ApprovalsNotificationSettings } from "./settings"
import { registerApprovalsAgent } from "./agent"

registerFeatureSettings("approvals", () => [
  {
    id: "approvals-general",
    label: "Workflow",
    icon: CheckCircle,
    order: 500,
    component: ApprovalsGeneralSettings,
  },
  {
    id: "approvals-notifications",
    label: "Notifications",
    icon: Bell,
    order: 510,
    component: ApprovalsNotificationSettings,
  },
])

registerApprovalsAgent()
