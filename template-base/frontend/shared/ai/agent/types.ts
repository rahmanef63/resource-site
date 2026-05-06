/**
 * Sub-Agent System Types
 * 
 * Core interfaces for the dynamic AI sub-agent architecture.
 * Sub-agents are specialized AI agents that handle feature-specific tasks.
 */

import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// Tool Definitions
// ============================================================================

/**
 * Parameter definition for a tool
 */
export interface ToolParameter {
    type: "string" | "number" | "boolean" | "array" | "object";
    description: string;
    required?: boolean;
    enum?: string[];
    items?: ToolParameter; // For array types
    properties?: Record<string, ToolParameter>; // For object types
}

/**
 * A tool that a sub-agent can use to perform actions
 */
export interface SubAgentTool {
    /** Unique name for the tool (e.g., 'createDocument') */
    name: string;
    /** Human-readable description for LLM */
    description: string;
    /** Tool parameter definitions */
    parameters: Record<string, ToolParameter>;
    /** Handler function that executes the tool */
    handler: (params: Record<string, any>, ctx: SubAgentContext) => Promise<ToolResult>;
}

/**
 * Result returned by a tool execution
 */
export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}

// ============================================================================
// Sub-Agent Definitions
// ============================================================================

/**
 * Context passed to sub-agents for execution
 */
export interface SubAgentContext {
    workspaceId: Id<"workspaces"> | null;
    userId: string | null;
    conversationId?: string;
    previousMessages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
    /** Convex client for database operations */
    convex?: any;
}

/**
 * A sub-agent that specializes in a specific feature domain
 */
/**
 * Quick-prompt suggestion surfaced in chat welcome/empty states.
 * Consumed by AgentChatContainer (and any custom chat UI) via
 * `subAgentRegistry.getSuggestions(featureId)`.
 */
export interface AgentSuggestion {
    /** Short label rendered on the suggestion chip/button. */
    label: string;
    /** Full prompt text sent to the agent when the suggestion is selected. */
    prompt: string;
    /** Optional lucide-react icon name. */
    icon?: string;
    /** Optional grouping label (e.g., "Analysis", "Generate"). */
    category?: string;
}

export interface SubAgent {
    /** Unique identifier (e.g., 'document-agent') */
    id: string;
    /** Human-readable name */
    name: string;
    /** Description of what this agent does */
    description: string;
    /** Associated feature ID (e.g., 'documents', 'tasks', 'crm') */
    featureId: string;
    /** Icon name from lucide-react */
    icon?: string;
    /** Tools available to this agent */
    tools: SubAgentTool[];

    /**
     * Determines if this agent can handle a query.
     * Returns a confidence score (0-1) or boolean.
     * Higher scores indicate better fit.
     */
    canHandle: (query: string, ctx: SubAgentContext) => number | boolean;

    /**
     * Optional: Get additional context for the agent.
     * This is lazy-loaded only when the agent is selected.
     */
    getContext?: (ctx: SubAgentContext) => Promise<string>;

    /**
     * Optional: System prompt addition for this agent.
     */
    systemPrompt?: string;

    /**
     * Optional: Quick-prompt suggestions surfaced in chat welcome states.
     * SSOT — features register these instead of hardcoding in each chat UI.
     * Consumed via `subAgentRegistry.getSuggestions(featureId)`.
     */
    suggestions?: AgentSuggestion[];
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Response from a sub-agent execution
 */
export interface SubAgentResponse {
    /** ID of the agent that handled the request */
    agentId: string;
    /** Name of the agent */
    agentName: string;
    /** Tool that was used (if any) */
    toolUsed?: string;
    /** Result from the tool execution */
    toolResult?: ToolResult;
    /** Generated response text */
    response: string;
    /** Context that was loaded for this agent */
    contextLoaded?: string;
    /** Metadata about the execution */
    metadata?: {
        executionTimeMs?: number;
        tokensUsed?: number;
        tokensSaved?: number;
    };
}

/**
 * Tool call request from LLM
 */
export interface ToolCall {
    id: string;
    type: "function";
    function: {
        name: string;
        arguments: string; // JSON string
    };
}

/**
 * OpenAI-compatible tool definition for LLM
 */
export interface LLMToolDefinition {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: "object";
            properties: Record<string, any>;
            required: string[];
        };
    };
}

// ============================================================================
// Registry Types
// ============================================================================

/**
 * Registry entry for a sub-agent
 */
export interface SubAgentRegistryEntry {
    agent: SubAgent;
    enabled: boolean;
    priority: number; // Higher = checked first
    registeredAt: number;
}

/**
 * Options for routing a query
 */
export interface RoutingOptions {
    /** Minimum confidence threshold to accept an agent */
    minConfidence?: number;
    /** Force a specific agent ID */
    forceAgentId?: string;
    /** Include disabled agents */
    includeDisabled?: boolean;
}

/**
 * Result from routing a query to an agent
 */
export interface RoutingResult {
    agent: SubAgent | null;
    confidence: number;
    allScores: Array<{ agentId: string; confidence: number }>;
}
