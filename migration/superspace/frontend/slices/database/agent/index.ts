import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerDatabaseAgent() {
  const agent: SubAgent = {
    id: "database-agent",
    name: "Database Agent",
    description: "Helps with database views, schemas, and exports.",
    featureId: "database",
    tools: [
      {
        name: "summarize",
        description: "Summarize database feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "database",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/database/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("database") || q.includes("table") || q.includes("schema")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
