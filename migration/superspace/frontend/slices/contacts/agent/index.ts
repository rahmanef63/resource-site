import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerContactsAgent() {
  const agent: SubAgent = {
    id: "contacts-agent",
    name: "Contacts Agent",
    description: "Helps manage contacts and connections.",
    featureId: "contacts",
    tools: [
      {
        name: "summarize",
        description: "Summarize contacts feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "contacts",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/contacts/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("contact") || q.includes("connection") || q.includes("network")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
