import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerAnalyticsAgent() {
  const agent: SubAgent = {
    id: "analytics-agent",
    name: "Analytics Agent",
    description: "Helps with dashboards, reports, and exports.",
    featureId: "analytics",
    tools: [
      {
        name: "summarize",
        description: "Summarize analytics feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "analytics",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/analytics/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("analytics") || q.includes("dashboard") || q.includes("metric")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
