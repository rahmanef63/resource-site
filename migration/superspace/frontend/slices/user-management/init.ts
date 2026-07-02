/**
 * User Management Feature Initialization
 * Registers feature settings and agent surface.
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Users, ShieldCheck } from "lucide-react"
import { UserManagementGeneralSettings, UserManagementSecuritySettings } from "./settings"
import { registerUserManagementAgent } from "./agent"

registerFeatureSettings("user-management", () => [
  {
    id: "user-management-general",
    label: "Users",
    icon: Users,
    order: 500,
    component: UserManagementGeneralSettings,
  },
  {
    id: "user-management-security",
    label: "Security",
    icon: ShieldCheck,
    order: 510,
    component: UserManagementSecuritySettings,
  },
])

registerUserManagementAgent()
