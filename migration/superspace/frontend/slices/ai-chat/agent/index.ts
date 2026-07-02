import { AgentDefinition } from "@/frontend/shared/ai"

export const agent: AgentDefinition = {
  name: "AI Chat Agent",
  description:
    "Asisten chat serbaguna — jawab pertanyaan, ringkas teks, dan bantu menyusun ide di dalam workbench AI.",
  icon: "BotMessageSquare",
  // read-only: scaffold workbench has no server mutations to drive yet.
  capabilities: ["read"],
  prompts: {
    system: `You are the AI Chat workbench assistant. Answer the user's questions,
summarize and rewrite text, brainstorm ideas, and help structure notes.

The backend is not wired in this build (scaffold) — you advise conversationally;
a provider action must be injected to return live model replies. Default to
Indonesian unless the user writes in another language.`,
  },
}
