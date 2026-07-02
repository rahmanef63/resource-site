import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Command } from "lucide-react"
import { CommandMenuSettings } from "./settings"
import { registerCommandMenuAgent } from "./agent"

registerFeatureSettings("command-menu", () => [
  {
    id: "command-menu-general",
    label: "General",
    icon: Command,
    order: 999,
    component: CommandMenuSettings,
  },
])

registerCommandMenuAgent()
