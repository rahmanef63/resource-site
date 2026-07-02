import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerHrAgent() {
  const agent: SubAgent = {
    id: "hr-agent",
    name: "HR Agent",
    description: "Helps with HR operations and employee management.",
    featureId: "hr",
    tools: [
      {
        name: "summarize",
        description: "Summarize HR feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "hr",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/hr/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("hr") || q.includes("employee") || q.includes("leave") || q.includes("payroll")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
