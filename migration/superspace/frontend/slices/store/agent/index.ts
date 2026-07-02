import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

/**
 * Store slice agent — minimal registration. Store is a composition host
 * (workspace + menu tabs); child slices own their real agent surfaces.
 */
export function registerStoreAgent() {
  const agent: SubAgent = {
    id: "store-agent",
    name: "Store Agent",
    description: "Answers questions about the workspace + menu Store surface.",
    featureId: "store",
    tools: [],
    canHandle: (query: string): number => {
      const q = query.toLowerCase()
      if (q.includes("store") || q.includes("workspace switch") || q.includes("menu set")) return 0.4
      return 0
    },
  }
  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
