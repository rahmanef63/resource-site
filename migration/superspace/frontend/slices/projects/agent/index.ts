import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerProjectsAgent() {
  const agent: SubAgent = {
    id: "projects-agent",
    name: "Projects Agent",
    description: "Helps manage projects, timelines, and collaboration.",
    featureId: "projects",
    tools: [
      {
        name: "summarize",
        description: "Summarize projects feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "projects",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/projects/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("project") || q.includes("timeline") || q.includes("milestone")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
