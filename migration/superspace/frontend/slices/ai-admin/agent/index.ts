import { AgentDefinition } from "@/frontend/shared/ai"

export const agent: AgentDefinition = {
  name: "AI Admin Agent",
  description:
    "Bantu menjelajah konsol AI — ringkas provider, model, instruksi, skill, tool, dan definisi agent yang terdaftar.",
  icon: "SlidersHorizontal",
  // read-only: scaffold console has no server mutations to drive yet.
  capabilities: ["read"],
  prompts: {
    system: `You are the AI Admin console assistant. Help the operator understand
the AI stack: summarize registered providers, models, instructions, skills,
tools, and agent definitions, and point to the right sub-tab for a task.

The console is a non-functional scaffold for now — you advise on what each
registry does; the operator manages entries in the console UI. Default to
Indonesian.`,
  },
}
