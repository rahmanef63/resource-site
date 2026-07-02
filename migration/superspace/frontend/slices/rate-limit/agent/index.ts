import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

/**
 * Rate-limit slice agent — minimal registration. Backend-only infra slice;
 * the agent only surfaces feature awareness, no actionable tools.
 */
export function registerRateLimitAgent() {
  const agent: SubAgent = {
    id: "rate-limit-agent",
    name: "Rate Limit Agent",
    description:
      "Answers questions about the Convex-backed per-key rate limiter.",
    featureId: "rate-limit",
    tools: [],
    canHandle: (query: string): number => {
      const q = query.toLowerCase()
      if (q.includes("rate limit") || q.includes("rate-limit") || q.includes("throttle"))
        return 0.5
      return 0
    },
  }
  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
