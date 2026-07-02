/**
 * Audit Log Feature Initialization
 * Registers audit-log settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { History, Settings } from "lucide-react"
import { AuditLogGeneralSettings } from "./settings"
import { registerAuditLogAgent } from "./agent"

registerFeatureSettings("audit-log", () => [
  {
    id: "audit-log-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: AuditLogGeneralSettings,
  },
])

registerAuditLogAgent()
