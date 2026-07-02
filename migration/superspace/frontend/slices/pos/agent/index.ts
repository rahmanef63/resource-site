import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerPosAgent() {
  const agent: SubAgent = {
    id: "pos-agent",
    name: "POS Agent",
    description: "Helps with point-of-sale operations and reporting.",
    featureId: "pos",
    tools: [
      {
        name: "summarize",
        description: "Summarize POS feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "pos",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/pos/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("pos") || q.includes("checkout") || q.includes("sale")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
