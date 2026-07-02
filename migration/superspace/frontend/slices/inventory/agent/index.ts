import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerInventoryAgent() {
  const agent: SubAgent = {
    id: "inventory-agent",
    name: "Inventory Agent",
    description: "Helps with stock tracking and alerts.",
    featureId: "inventory",
    tools: [
      {
        name: "summarize",
        description: "Summarize inventory feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "inventory",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/inventory/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("inventory") || q.includes("stock") || q.includes("sku")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
