import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerAuditLogAgent() {
  const agent: SubAgent = {
    id: "audit-log-agent",
    name: "Audit Log Agent",
    description: "Helps query and explain audit logs with proper permissions.",
    featureId: "audit-log",
    tools: [
      {
        name: "summarize",
        description: "Summarize audit log status and recent activity context.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "audit-log",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Add real tools under convex/features/auditLog/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("audit") || q.includes("log")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
