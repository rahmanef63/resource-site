/**
 * Sub-Agent Initialization
 * 
 * This file initializes all sub-agents by importing their init modules.
 * Import this file early in the application lifecycle to register all agents.
 */

import { subAgentRegistry } from "@/frontend/shared/ai/agent/registry";

// The feature-specific init files already register their agents.
// This module now only marks the registry as initialized.
if (typeof window !== "undefined") {
    // Use setTimeout to ensure all imports have completed
    setTimeout(() => {
        subAgentRegistry.markInitialized();
    }, 0);
}

export { subAgentRegistry };
