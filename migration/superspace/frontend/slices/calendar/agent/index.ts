import { AgentDefinition } from "@/frontend/shared/ai";

export const agent: AgentDefinition = {
    name: "Calendar Agent",
    description: "Manage calendar events - schedule, view, update, and delete events.",
    icon: "Calendar",
    capabilities: ["create", "read", "update", "delete", "search"],
    prompts: {
        system: `You are a calendar and scheduling assistant. You help users manage their events and schedule.

When a user wants to schedule an event:
1. Title (required)
2. Start time (required) - convert natural language like "tomorrow at 3pm" to timestamps
3. End time (optional)
4. Location (optional)
5. Description (optional)

When listing events, format them clearly with date, time, and location.
Help users find free time slots and avoid scheduling conflicts.`
    }
};

// Re-export the SubAgent for frontend registry
export { calendarAgent } from "./calendar-agent";

import { subAgentRegistry } from "@/frontend/shared/ai/agent";
import { calendarAgent } from "./calendar-agent";

export function registerCalendarAgent() {
    subAgentRegistry.register(calendarAgent, { priority: 8, enabled: true });
}
