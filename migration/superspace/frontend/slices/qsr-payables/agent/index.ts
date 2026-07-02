import { AgentDefinition } from "@/frontend/shared/ai"

export const agent: AgentDefinition = {
    name: "Qsr Payables Agent",
    description: "Helps with qsr payables tasks.",
    icon: "Box",
    capabilities: [],
    prompts: {
        system: `You are a qsr-payables assistant. You help users with qsr-payables operations.`
    }
};
