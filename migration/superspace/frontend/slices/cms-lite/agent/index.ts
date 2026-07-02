import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerCmsLiteAgent() {
  const agent: SubAgent = {
    id: "cms-lite-agent",
    name: "CMS Lite Agent",
    description: "Helps manage lightweight CMS content.",
    featureId: "cms-lite",
    tools: [
      {
        name: "summarize",
        description: "Summarize cms-lite feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "cms-lite",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/cmsLite/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("cms") || q.includes("content") || q.includes("page") || q.includes("landing")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
