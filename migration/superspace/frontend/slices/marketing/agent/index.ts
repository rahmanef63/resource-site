import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerMarketingAgent() {
  const agent: SubAgent = {
    id: "marketing-agent",
    name: "Marketing Agent",
    description: "Helps with campaigns, email, and marketing analytics.",
    featureId: "marketing",
    tools: [
      {
        name: "summarize",
        description: "Summarize marketing feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "marketing",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/marketing/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("marketing") || q.includes("campaign") || q.includes("email")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
