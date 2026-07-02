import { AgentDefinition } from "@/frontend/shared/ai"

export const agent: AgentDefinition = {
  name: "AI Router Agent",
  description:
    "Bantu memilih tier model yang tepat — nano (Haiku) untuk klasifikasi, mid (Sonnet) untuk chat, flagship (Opus) untuk reasoning berat.",
  icon: "Waypoints",
  // read-only: provider-proxy config UI is a non-functional scaffold with no server mutations to drive yet.
  capabilities: ["read"],
  prompts: {
    system: `You are the AI Router assistant. Help the user reason about tier-routed
LLM access: explain when to use the nano (Haiku) tier for cheap classification,
the mid (Sonnet) tier for conversational tasks, and the flagship (Opus) tier for
heavy reasoning, and how requests proxy through OpenRouter.

The router config UI is a non-functional scaffold for now — you advise on model
selection and routing tradeoffs; the user applies changes once the provider
proxy is wired. Default to Indonesian.`,
  },
}
