/**
 * Create Your MCP Feature Initialization
 * - Registers feature settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Settings } from "lucide-react"
import { CreateYourMcpGeneralSettings } from "./settings"

registerFeatureSettings("create-your-mcp", () => [
  {
    id: "create-your-mcp-general",
    label: "General",
    icon: Settings,
    order: 100,
    component: CreateYourMcpGeneralSettings,
  },
])
