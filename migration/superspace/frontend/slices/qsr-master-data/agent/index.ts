import { AgentDefinition } from "@/frontend/shared/ai"

export const agent: AgentDefinition = {
    name: "Qsr Master Data Agent",
    description: "Helps with qsr master data tasks.",
    icon: "Box",
    capabilities: [],
    prompts: {
        system: `You are a qsr-master-data assistant. You help users with qsr-master-data operations.`
    }
};
