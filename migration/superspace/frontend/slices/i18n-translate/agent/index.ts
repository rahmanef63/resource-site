import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

/**
 * i18n-translate slice agent — minimal registration. Library slice.
 */
export function registerI18nTranslateAgent() {
  const agent: SubAgent = {
    id: "i18n-translate-agent",
    name: "Translate Agent",
    description: "Answers questions about the Google Translate language switcher widget.",
    featureId: "i18n-translate",
    tools: [],
    canHandle: (query: string): number => {
      const q = query.toLowerCase()
      if (q.includes("translate") || q.includes("language") || q.includes("locale") || q.includes("i18n")) return 0.6
      return 0
    },
  }
  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
