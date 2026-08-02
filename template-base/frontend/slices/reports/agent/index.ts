import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerReportsAgent() {
  const agent: SubAgent = {
    id: "reports-agent",
    name: "Reports Agent",
    description: "Helps create, summarize, and analyze reports.",
    featureId: "reports",
    tools: [
      {
        name: "summarize",
        description: "Summarize reports feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "reports",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/reports/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("report") || q.includes("analytics")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
