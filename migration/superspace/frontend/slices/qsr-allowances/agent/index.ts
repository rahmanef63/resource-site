import { AgentDefinition } from "@/frontend/shared/ai"

export const agent: AgentDefinition = {
    name: "Qsr Allowances Agent",
    description: "Helps with qsr allowances tasks.",
    icon: "Box",
    capabilities: [],
    prompts: {
        system: `You are a qsr-allowances assistant. You help users with qsr-allowances operations.`
    }
};
