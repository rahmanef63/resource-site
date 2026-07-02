import { AgentDefinition } from "@/frontend/shared/ai"

export const agent: AgentDefinition = {
    name: "Qsr Product Changes Agent",
    description: "Helps with qsr product changes tasks.",
    icon: "Box",
    capabilities: [],
    prompts: {
        system: `You are a qsr-product-changes assistant. You help users with qsr-product-changes operations.`
    }
};
