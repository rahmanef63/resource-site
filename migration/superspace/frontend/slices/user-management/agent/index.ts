import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerUserManagementAgent() {
  const agent: SubAgent = {
    id: "user-management-agent",
    name: "User Management Agent",
    description: "Helps manage users, roles, and access control.",
    featureId: "user-management",
    tools: [
      {
        name: "summarize",
        description: "Summarize user-management feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "user-management",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/userManagement/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("user") || q.includes("role") || q.includes("permission")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
