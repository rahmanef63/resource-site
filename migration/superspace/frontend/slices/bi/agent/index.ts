import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerBiAgent() {
  const agent: SubAgent = {
    id: "bi-agent",
    name: "BI Agent",
    description: "Helps explore dashboards, insights, and exports.",
    featureId: "bi",
    tools: [
      {
        name: "summarize",
        description: "Summarize BI feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "bi",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/bi/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("bi") || q.includes("dashboard") || q.includes("insight") || q.includes("kpi")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
