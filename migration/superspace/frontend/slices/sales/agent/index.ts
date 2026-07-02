import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerSalesAgent() {
  const agent: SubAgent = {
    id: "sales-agent",
    name: "Sales Agent",
    description: "Helps manage deals, pipeline, and sales reporting.",
    featureId: "sales",
    tools: [
      {
        name: "summarize",
        description: "Summarize sales feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "sales",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/sales/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("sales") || q.includes("deal") || q.includes("pipeline") || q.includes("revenue")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
