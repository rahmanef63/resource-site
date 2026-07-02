import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerAccountingAgent() {
  const agent: SubAgent = {
    id: "accounting-agent",
    name: "Accounting Agent",
    description: "Helps with invoices, ledgers, and financial reporting.",
    featureId: "accounting",
    tools: [
      {
        name: "summarize",
        description: "Summarize accounting feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "accounting",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/accounting/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("accounting") || q.includes("invoice") || q.includes("ledger") || q.includes("tax")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
