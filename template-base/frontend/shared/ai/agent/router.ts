/**
 * Sub-Agent Router
 * 
 * Handles routing queries to appropriate sub-agents and executing their tools.
 */

import type {
    SubAgent,
    SubAgentContext,
    SubAgentResponse,
    ToolCall,
    ToolResult,
    RoutingOptions,
} from "./types";
import { subAgentRegistry } from "./registry";

// ============================================================================
// Tool Execution
// ============================================================================

/**
 * Execute a tool from a specific agent
 */
export async function executeTool(
    agentId: string,
    toolName: string,
    params: Record<string, any>,
    context: SubAgentContext
): Promise<ToolResult> {
    const agent = subAgentRegistry.getAgent(agentId);
    if (!agent) {
        return {
            success: false,
            error: `Agent "${agentId}" not found`,
        };
    }

    const tool = agent.tools.find((t) => t.name === toolName);
    if (!tool) {
        return {
            success: false,
            error: `Tool "${toolName}" not found in agent "${agentId}"`,
        };
    }

    try {
        const result = await tool.handler(params, context);
        return result;
    } catch (error) {
        console.error(`[SubAgentRouter] Tool execution error:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Tool execution failed",
        };
    }
}

/**
 * Execute a tool call from LLM response
 */
export async function executeToolCall(
    toolCall: ToolCall,
    context: SubAgentContext
): Promise<{ toolName: string; result: ToolResult }> {
    const parsed = subAgentRegistry.parseToolCall(toolCall.function.name);
    if (!parsed) {
        return {
            toolName: toolCall.function.name,
            result: {
                success: false,
                error: `Invalid tool name format: "${toolCall.function.name}"`,
            },
        };
    }

    let params: Record<string, any> = {};
    try {
        params = JSON.parse(toolCall.function.arguments);
    } catch (error) {
        return {
            toolName: toolCall.function.name,
            result: {
                success: false,
                error: "Failed to parse tool arguments",
            },
        };
    }

    const result = await executeTool(parsed.agentId, parsed.toolName, params, context);
    return {
        toolName: toolCall.function.name,
        result,
    };
}

// ============================================================================
// Query Processing
// ============================================================================

/**
 * Process a query through the sub-agent system
 */
export async function processSubAgentQuery(
    query: string,
    context: SubAgentContext,
    options: RoutingOptions = {}
): Promise<SubAgentResponse | null> {
    const startTime = Date.now();

    // Route the query
    const routingResult = subAgentRegistry.routeQuery(query, context, options);

    if (!routingResult.agent) {
        return null;
    }

    const agent = routingResult.agent;

    // Load agent-specific context if available
    let agentContext: string | undefined;
    if (agent.getContext) {
        try {
            agentContext = await agent.getContext(context);
        } catch (error) {
            console.error(`[SubAgentRouter] Failed to get context for agent "${agent.id}":`, error);
        }
    }

    const executionTimeMs = Date.now() - startTime;

    return {
        agentId: agent.id,
        agentName: agent.name,
        response: "", // Will be filled by LLM
        contextLoaded: agentContext,
        metadata: {
            executionTimeMs,
        },
    };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build system prompt for a specific agent
 */
export function buildAgentSystemPrompt(agent: SubAgent, agentContext?: string): string {
    const parts: string[] = [];

    // Agent identity
    parts.push(`You are the ${agent.name}, a specialized AI assistant for ${agent.description}.`);

    // Agent's system prompt
    if (agent.systemPrompt) {
        parts.push(agent.systemPrompt);
    }

    // Available tools
    if (agent.tools.length > 0) {
        parts.push("\nYou have access to the following tools:");
        for (const tool of agent.tools) {
            const params = Object.entries(tool.parameters)
                .map(([name, param]) => `  - ${name}: ${param.description}${param.required ? " (required)" : ""}`)
                .join("\n");
            parts.push(`\n**${tool.name}**: ${tool.description}`);
            if (params) {
                parts.push(`Parameters:\n${params}`);
            }
        }
    }

    // Agent context
    if (agentContext) {
        parts.push(`\nRelevant context:\n${agentContext}`);
    }

    // Instructions
    parts.push(`
When a user asks you to perform an action, use the appropriate tool.
When responding about data, be concise and helpful.
If you cannot perform a requested action, explain why.`);

    return parts.join("\n");
}

/**
 * Format tool result for display
 */
export function formatToolResult(toolName: string, result: ToolResult): string {
    if (!result.success) {
        return `❌ **Error executing ${toolName}**: ${result.error}`;
    }

    if (result.message) {
        return `✅ ${result.message}`;
    }

    if (result.data) {
        if (typeof result.data === "string") {
            return result.data;
        }
        if (Array.isArray(result.data)) {
            return `Found ${result.data.length} items`;
        }
        return JSON.stringify(result.data, null, 2);
    }

    return "✅ Action completed successfully";
}

/**
 * Get agent summary for UI display
 */
export function getAgentSummary(agent: SubAgent): {
    id: string;
    name: string;
    description: string;
    icon?: string;
    toolCount: number;
    tools: Array<{ name: string; description: string }>;
} {
    return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        icon: agent.icon,
        toolCount: agent.tools.length,
        tools: agent.tools.map((t) => ({ name: t.name, description: t.description })),
    };
}

/**
 * List all available agents with their summaries
 */
export function listAvailableAgents(): ReturnType<typeof getAgentSummary>[] {
    return subAgentRegistry.getAllAgents().map(getAgentSummary);
}
