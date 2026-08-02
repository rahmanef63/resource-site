import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Layers } from "lucide-react"
import { WorkspaceShellSettings } from "./settings"
import { registerWorkspaceShellAgent } from "./agent"

registerFeatureSettings("workspace-shell", () => [
  {
    id: "workspace-shell-general",
    label: "General",
    icon: Layers,
    order: 10,
    component: WorkspaceShellSettings,
  },
])

registerWorkspaceShellAgent()
