import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

export function registerKnowledgeAgent() {
  const agent: SubAgent = {
    id: "knowledge-agent",
    name: "Knowledge Agent",
    description: "Helps search, organize, and summarize knowledge base.",
    featureId: "knowledge",
    tools: [
      {
        name: "summarize",
        description: "Summarize knowledge feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "knowledge",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/knowledge/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("knowledge") || q.includes("wiki") || q.includes("docs")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
