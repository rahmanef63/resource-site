import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerStatusAgent() {
  const agent: SubAgent = {
    id: "status-agent",
    name: "Status Agent",
    description: "Helps manage user presence and status settings.",
    featureId: "status",
    tools: [
      {
        name: "summarize",
        description: "Summarize status feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "status",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/status/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("status") || q.includes("presence") || q.includes("visibility")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
