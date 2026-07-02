import { AgentDefinition } from "@/frontend/shared/ai";
import { prompts } from "./prompts";

export const agent: AgentDefinition = {
    name: "Documents Agent",
    description: "Manage documents - create, search, read, update, and delete.",
    icon: "FileText",
    capabilities: ["create", "read", "update", "delete", "search"],
    prompts: prompts
};

export { documentAgent } from "./document-agent";

import { subAgentRegistry } from "@/frontend/shared/ai/agent";
import { documentAgent } from "./document-agent";

export function registerDocumentsAgent() {
    subAgentRegistry.register(documentAgent, { priority: 10, enabled: true });
}
