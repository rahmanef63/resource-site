import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerApprovalsAgent() {
  const agent: SubAgent = {
    id: "approvals-agent",
    name: "Approvals Agent",
    description: "Helps with approval workflows and requests.",
    featureId: "approvals",
    tools: [
      {
        name: "summarize",
        description: "Summarize approvals feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "approvals",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/approvals/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("approve") || q.includes("approval") || q.includes("workflow")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
