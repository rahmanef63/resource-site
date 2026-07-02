import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

/**
 * command-menu slice agent — minimal registration. Library slice.
 */
export function registerCommandMenuAgent() {
  const agent: SubAgent = {
    id: "command-menu-agent",
    name: "Command Menu Agent",
    description: "Answers questions about the ⌘K command palette and search modal.",
    featureId: "command-menu",
    tools: [],
    canHandle: (query: string): number => {
      const q = query.toLowerCase()
      if (q.includes("command") || q.includes("palette") || q.includes("cmd+k") || q.includes("shortcut")) return 0.6
      return 0
    },
  }
  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
