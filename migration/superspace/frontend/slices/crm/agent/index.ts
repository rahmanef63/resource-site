import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerCrmAgent() {
  const agent: SubAgent = {
    id: "crm-agent",
    name: "CRM Agent",
    description: "Helps manage leads, pipelines, and customer records.",
    featureId: "crm",
    tools: [
      {
        name: "summarize",
        description: "Summarize CRM feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "crm",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/crm/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("crm") || q.includes("lead") || q.includes("pipeline") || q.includes("customer")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
