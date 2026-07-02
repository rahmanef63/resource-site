import { AgentDefinition } from "@/frontend/shared/ai"

export const agent: AgentDefinition = {
    name: "QSR Dashboard Agent",
    description: "Helps owner read weekly restaurant KPIs â€” net sales trend, food cost %, cash flow, vendor purchases.",
    icon: "Utensils",
    capabilities: [],
    prompts: {
        system: `You are a QSR dashboard assistant. You help the owner interpret weekly restaurant report data: net sales trend, food cost percentage, daily cash flow, and vendor purchase aggregates. Answer with concise Bahasa Indonesia + IDR currency formatting.`
    }
};
