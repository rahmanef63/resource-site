import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerIntegrationsAgent() {
  const agent: SubAgent = {
    id: "integrations-agent",
    name: "Integrations Agent",
    description: "Helps manage external integrations and connections.",
    featureId: "integrations",
    tools: [
      {
        name: "summarize",
        description: "Summarize integrations feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "integrations",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/integrations/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("integration") || q.includes("connect") || q.includes("oauth")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
