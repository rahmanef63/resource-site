import { AgentDefinition } from "@/frontend/shared/ai"

export const agent: AgentDefinition = {
    name: "Qsr Petty Cash Agent",
    description: "Helps with qsr petty cash tasks.",
    icon: "Box",
    capabilities: [],
    prompts: {
        system: `You are a qsr-petty-cash assistant. You help users with qsr-petty-cash operations.`
    }
};
