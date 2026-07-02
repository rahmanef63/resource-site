import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

/**
 * Notifications slice agent — minimal registration. Library slice; the
 * agent only surfaces feature awareness, no actionable tools yet.
 */
export function registerNotificationsAgent() {
  const agent: SubAgent = {
    id: "notifications-agent",
    name: "Notifications Agent",
    description: "Answers questions about per-page notify-me subscriptions.",
    featureId: "notifications",
    tools: [],
    canHandle: (query: string): number => {
      const q = query.toLowerCase()
      if (q.includes("notify") || q.includes("notification") || q.includes("subscribe")) return 0.6
      return 0
    },
  }
  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
