/**
 * Sub-Agent Registry
 * 
 * Central registry for managing and discovering sub-agents.
 * Provides routing capabilities to direct queries to appropriate agents.
 */

import type {
    SubAgent,
    SubAgentRegistryEntry,
    RoutingOptions,
    RoutingResult,
    LLMToolDefinition,
    SubAgentContext,
    AgentSuggestion,
} from "./types";

class SubAgentRegistry {
    private agents: Map<string, SubAgentRegistryEntry> = new Map();
    private initCallbacks: Array<() => void> = [];
    private initialized = false;

    // ============================================================================
    // Registration
    // ============================================================================

    /**
     * Get agent by ID
     */
    getAgentById(id: string | null): SubAgent {
        if (!id) {
            // Return a default "General" agent placeholder if no ID
            return {
                id: "general",
                name: "General Assistant",
                description: "Capable of general conversation and tasks.",
                featureId: "ai",
                tools: [],
                canHandle: () => 1,
            } as any;
        }
        return this.agents.get(id)?.agent || this.getAgentById(null);
    }


    /**
     * Register a sub-agent with the registry
     */
    register(agent: SubAgent, options?: { priority?: number; enabled?: boolean }): void {
        if (this.agents.has(agent.id)) {
            console.warn(`[SubAgentRegistry] Agent "${agent.id}" is already registered. Overwriting.`);
        }

        this.agents.set(agent.id, {
            agent,
            enabled: options?.enabled ?? true,
            priority: options?.priority ?? 0,
            registeredAt: Date.now(),
        });

        if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        }
    }

    /**
     * Unregister a sub-agent
     */
    unregister(agentId: string): boolean {
        const removed = this.agents.delete(agentId);
        if (removed && typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        }
        return removed;
    }

    /**
     * Enable or disable an agent
     */
    setEnabled(agentId: string, enabled: boolean): void {
        const entry = this.agents.get(agentId);
        if (entry) {
            entry.enabled = enabled;
        }
    }

    // ============================================================================
    // Queries
    // ============================================================================

    /**
     * Get a specific agent by ID
     */
    getAgent(agentId: string): SubAgent | undefined {
        return this.agents.get(agentId)?.agent;
    }

    /**
     * Get all registered agents
     */
    getAllAgents(includeDisabled = false): SubAgent[] {
        return Array.from(this.agents.values())
            .filter((entry) => includeDisabled || entry.enabled)
            .sort((a, b) => b.priority - a.priority)
            .map((entry) => entry.agent);
    }

    /**
     * Get agent entries with metadata
     */
    getAgentEntries(): SubAgentRegistryEntry[] {
        return Array.from(this.agents.values()).sort((a, b) => b.priority - a.priority);
    }

    /**
     * Check if an agent is registered
     */
    hasAgent(agentId: string): boolean {
        return this.agents.has(agentId);
    }

    /**
     * Get agent count
     */
    get size(): number {
        return this.agents.size;
    }

    // ============================================================================
    // Suggestions (quick prompts surfaced in chat welcome states)
    // ============================================================================

    /**
     * Return registered quick-prompt suggestions for the agent that owns
     * `featureId`. Falls back to an empty array when nothing is registered
     * so consumers can safely `?? []`.
     *
     * Matches agents whose `featureId` equals the argument OR whose `id`
     * matches the argument — supports both "by feature" and "by agent"
     * lookups from the same helper.
     */
    getSuggestions(featureId: string): AgentSuggestion[] {
        for (const entry of this.agents.values()) {
            if (!entry.enabled) continue;
            const a = entry.agent;
            if (a.featureId === featureId || a.id === featureId) {
                return a.suggestions ?? [];
            }
        }
        return [];
    }

    // ============================================================================
    // Routing
    // ============================================================================

    /**
     * Route a query to the most appropriate agent
     */
    routeQuery(
        query: string,
        context: SubAgentContext,
        options: RoutingOptions = {}
    ): RoutingResult {
        const { minConfidence = 0.3, forceAgentId, includeDisabled = false } = options;

        // Force a specific agent if requested
        if (forceAgentId) {
            const agent = this.getAgent(forceAgentId);
            if (agent) {
                return {
                    agent,
                    confidence: 1.0,
                    allScores: [{ agentId: forceAgentId, confidence: 1.0 }],
                };
            }
        }

        // Score all agents
        const scores: Array<{ agentId: string; agent: SubAgent; confidence: number }> = [];

        for (const [agentId, entry] of this.agents.entries()) {
            if (!includeDisabled && !entry.enabled) continue;

            try {
                const result = entry.agent.canHandle(query, context);
                const confidence = typeof result === "boolean" ? (result ? 0.8 : 0) : result;

                if (confidence > 0) {
                    scores.push({
                        agentId,
                        agent: entry.agent,
                        confidence,
                    });
                }
            } catch (error) {
                console.error(`[SubAgentRegistry] Error evaluating agent "${agentId}":`, error);
            }
        }

        // Sort by confidence (descending), then by priority
        scores.sort((a, b) => {
            if (b.confidence !== a.confidence) {
                return b.confidence - a.confidence;
            }
            const aPriority = this.agents.get(a.agentId)?.priority ?? 0;
            const bPriority = this.agents.get(b.agentId)?.priority ?? 0;
            return bPriority - aPriority;
        });

        const allScores = scores.map((s) => ({ agentId: s.agentId, confidence: s.confidence }));

        // Return best match if above threshold
        if (scores.length > 0 && scores[0].confidence >= minConfidence) {
            return {
                agent: scores[0].agent,
                confidence: scores[0].confidence,
                allScores,
            };
        }

        return {
            agent: null,
            confidence: 0,
            allScores,
        };
    }

    // ============================================================================
    // LLM Tool Definitions
    // ============================================================================

    /**
     * Get tool definitions for all enabled agents in OpenAI function format
     */
    getToolDefinitions(agentId?: string): LLMToolDefinition[] {
        const definitions: LLMToolDefinition[] = [];
        const agents = agentId ? [this.getAgent(agentId)].filter(Boolean) : this.getAllAgents();

        for (const agent of agents) {
            if (!agent) continue;

            for (const tool of agent.tools) {
                const properties: Record<string, any> = {};
                const required: string[] = [];

                for (const [paramName, param] of Object.entries(tool.parameters)) {
                    properties[paramName] = {
                        type: param.type,
                        description: param.description,
                    };
                    if (param.enum) {
                        properties[paramName].enum = param.enum;
                    }
                    if (param.required) {
                        required.push(paramName);
                    }
                }

                definitions.push({
                    type: "function",
                    function: {
                        name: `${agent.id}__${tool.name}`,
                        description: `[${agent.name}] ${tool.description}`,
                        parameters: {
                            type: "object",
                            properties,
                            required,
                        },
                    },
                });
            }
        }

        return definitions;
    }

    /**
     * Parse a tool call name to get agent and tool
     */
    parseToolCall(toolName: string): { agentId: string; toolName: string } | null {
        const parts = toolName.split("__");
        if (parts.length !== 2) return null;
        return {
            agentId: parts[0],
            toolName: parts[1],
        };
    }

    // ============================================================================
    // Initialization
    // ============================================================================

    /**
     * Add callback to run when registry is initialized
     */
    onInit(callback: () => void): void {
        if (this.initialized) {
            callback();
        } else {
            this.initCallbacks.push(callback);
        }
    }

    /**
     * Mark registry as initialized and run callbacks
     */
    markInitialized(): void {
        this.initialized = true;
        for (const callback of this.initCallbacks) {
            try {
                callback();
            } catch (error) {
                console.error("[SubAgentRegistry] Init callback error:", error);
            }
        }
        this.initCallbacks = [];
    }

    /**
     * Reset the registry (for testing)
     */
    reset(): void {
        this.agents.clear();
        this.initialized = false;
        this.initCallbacks = [];
    }
}

// Singleton instance
export const subAgentRegistry = new SubAgentRegistry();

// Export class for testing
export { SubAgentRegistry };

// Helper functions for AgentSelector
export const getAgentById = (id: string | null) => subAgentRegistry.getAgentById(id);
export const AVAILABLE_AGENTS = subAgentRegistry.getAllAgents();
export const listAvailableAgents = () => subAgentRegistry.getAllAgents();
export const subAgentRegistryInstance = subAgentRegistry;

