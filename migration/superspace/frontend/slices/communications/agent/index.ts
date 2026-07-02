import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerCommunicationsAgent() {
  const agent: SubAgent = {
    id: "communications-agent",
    name: "Communications Agent",
    description: "Helps with channels, messaging, and calls.",
    featureId: "communications",
    tools: [
      {
        name: "summarize",
        description: "Summarize communications feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "communications",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/communications/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("message") || q.includes("channel") || q.includes("call")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
