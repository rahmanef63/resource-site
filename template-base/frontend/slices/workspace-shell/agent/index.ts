import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

/**
 * workspace-shell — AI agent (P0 scaffold).
 *
 * Future tools (P3+): switch_workspace, switch_menu_set, fork_menu_set,
 * list_menu_sets, get_nav_context.
 */
export function registerWorkspaceShellAgent() {
  const agent: SubAgent = {
    id: "workspace-shell",
    name: "Workspace Shell",
    description:
      "Manages workspace navigation context — switch workspace, switch menu set, fork menu set, manage workspace tree hierarchy.",
    featureId: "workspace-shell",
    icon: "Layers",
    tools: [],
    canHandle: (query: string): number => {
      const q = query.toLowerCase()
      if (
        q.includes("switch workspace") ||
        q.includes("change menu") ||
        q.includes("menu set") ||
        q.includes("navigation context") ||
        q.includes("workspace tree")
      ) {
        return 0.8
      }
      if (q.includes("workspace") && (q.includes("menu") || q.includes("nav"))) {
        return 0.5
      }
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 15, enabled: true })
}
