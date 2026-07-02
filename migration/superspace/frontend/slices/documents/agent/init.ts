/**
 * Document Agent Initialization
 * 
 * Registers the Document Agent with the sub-agent registry.
 * Import this file to enable the Document Agent.
 */

import { subAgentRegistry } from "@/frontend/shared/ai/agent";
import { documentAgent } from "./document-agent";

// Register the document agent with high priority
subAgentRegistry.register(documentAgent, {
    priority: 10,
    enabled: true,
});

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}

export { documentAgent };
