/**
 * useSubAgentRouter Hook
 * 
 * React hook for routing queries to sub-agents and managing tool execution.
 * Integrates with SessionDebugStore for real-time tracing.
 */

"use client";

import { useCallback, useMemo, useState } from "react";
import { useConvex } from "convex/react";
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider";
import { useUser } from "@/frontend/shared/foundation/auth";
import { useSessionDebugStore } from "@/frontend/shared/ui/components/session-info";
import {
    subAgentRegistry,
    processSubAgentQuery,
    executeTool,
    executeToolCall,
    buildAgentSystemPrompt,
    formatToolResult,
    listAvailableAgents,
    type SubAgentContext,
    type SubAgentResponse,
    type RoutingOptions,
    type ToolCall,
    type ToolResult,
} from "../agent";
import { getProviderModels, useAISettingsStorage, type AIApiKeyConfig } from "../settings/useAISettings";
import { PROVIDER_NAMES } from "../utils/error-handler";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// Types
// ============================================================================

export interface SubAgentRouterState {
    isProcessing: boolean;
    lastAgentUsed: string | null;
    lastToolUsed: string | null;
    error: string | null;
}

export interface SubAgentRouterActions {
    /**
     * Route a query and get the appropriate agent
     */
    routeQuery: (query: string, options?: RoutingOptions) => {
        agentId: string | null;
        agentName: string | null;
        confidence: number;
    };

    /**
     * Process a query through sub-agents with context loading
     */
    processQuery: (query: string, options?: RoutingOptions) => Promise<SubAgentResponse | null>;

    /**
     * Execute a specific tool
     */
    executeTool: (
        agentId: string,
        toolName: string,
        params: Record<string, any>
    ) => Promise<ToolResult>;

    /**
     * Execute tool calls from LLM response
     */
    executeToolCalls: (toolCalls: ToolCall[]) => Promise<Array<{
        toolName: string;
        result: ToolResult;
    }>>;

    /**
     * Get system prompt for a specific agent
     */
    getAgentSystemPrompt: (agentId: string) => Promise<string | null>;

    /**
     * Get available agents summary
     */
    getAvailableAgents: () => ReturnType<typeof listAvailableAgents>;

    /**
     * Check if any agents can handle a query
     */
    canHandleQuery: (query: string) => boolean;

    /**
     * Format a tool result for display
     */
    formatResult: (toolName: string, result: ToolResult) => string;

    /**
     * Generate text using the configured AI provider
     */
    generateText: (prompt: string, systemPrompt?: string) => Promise<string | null>;

    /**
     * Generate chat response with history
     */
    generateChat: (messages: { role: "user" | "assistant" | "system", content: string }[], systemPrompt?: string) => Promise<string | null>;
}

// ============================================================================
// Hook
// ============================================================================

export function useSubAgentRouter(): SubAgentRouterState & SubAgentRouterActions {
    const convex = useConvex();
    const { workspaceId } = useWorkspaceContext();
    const { user } = useUser();
    const { settings } = useAISettingsStorage();

    const [isProcessing, setIsProcessing] = useState(false);
    const [lastAgentUsed, setLastAgentUsed] = useState<string | null>(null);
    const [lastToolUsed, setLastToolUsed] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Build context for sub-agents
    const context: SubAgentContext = useMemo(() => ({
        workspaceId: workspaceId as Id<"workspaces"> | null,
        userId: user?.id || null,
        convex,
    }), [workspaceId, user?.id, convex]);

    // Route a query to find the best agent
    const routeQuery = useCallback(
        (query: string, options?: RoutingOptions) => {
            const result = subAgentRegistry.routeQuery(query, context, options);
            return {
                agentId: result.agent?.id || null,
                agentName: result.agent?.name || null,
                confidence: result.confidence,
            };
        },
        [context]
    );

    // Process a query through sub-agents
    const processQuery = useCallback(
        async (query: string, options?: RoutingOptions): Promise<SubAgentResponse | null> => {
            setIsProcessing(true);
            setError(null);

            // Get debug store for tracing
            const debugStore = useSessionDebugStore.getState();
            let traceId: string | undefined;

            // Route first to get agent info
            const routeResult = subAgentRegistry.routeQuery(query, context, options);
            
            // Start trace if debugging
            if (debugStore.isDebugging && routeResult.agent) {
                traceId = debugStore.addAgentTrace({
                    timestamp: Date.now(),
                    agentId: routeResult.agent.id,
                    agentName: routeResult.agent.name,
                    query,
                    confidence: routeResult.confidence,
                    status: "processing",
                });
            }

            try {
                const response = await processSubAgentQuery(query, context, options);
                if (response) {
                    setLastAgentUsed(response.agentId);
                    
                    // Complete trace
                    if (traceId) {
                        debugStore.completeAgentTrace(traceId, response.response);
                    }
                }
                return response;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Failed to process query";
                setError(errorMessage);
                console.error("[useSubAgentRouter] Process query error:", err);
                
                // Log error to trace
                if (traceId) {
                    debugStore.completeAgentTrace(traceId, undefined, errorMessage);
                }
                
                return null;
            } finally {
                setIsProcessing(false);
            }
        },
        [context]
    );

    // Execute a specific tool
    const executeToolAction = useCallback(
        async (
            agentId: string,
            toolName: string,
            params: Record<string, any>
        ): Promise<ToolResult> => {
            setIsProcessing(true);
            setError(null);

            // Get debug store for tracing
            const debugStore = useSessionDebugStore.getState();
            const agent = subAgentRegistry.getAgent(agentId);
            let traceId: string | undefined;
            
            // Start tool trace if debugging
            if (debugStore.isDebugging) {
                traceId = debugStore.addToolCallTrace({
                    timestamp: Date.now(),
                    agentId,
                    agentName: agent?.name || agentId,
                    toolName,
                    params,
                    status: "pending",
                });
            }

            try {
                const result = await executeTool(agentId, toolName, params, context);
                setLastAgentUsed(agentId);
                setLastToolUsed(toolName);
                
                // Complete tool trace
                if (traceId) {
                    debugStore.completeToolCall(traceId, result.data, result.error);
                }
                
                return result;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Tool execution failed";
                setError(errorMessage);
                
                // Log error to trace
                if (traceId) {
                    debugStore.completeToolCall(traceId, undefined, errorMessage);
                }
                
                return {
                    success: false,
                    error: errorMessage,
                };
            } finally {
                setIsProcessing(false);
            }
        },
        [context]
    );

    // Execute multiple tool calls
    const executeToolCalls = useCallback(
        async (toolCalls: ToolCall[]) => {
            setIsProcessing(true);
            setError(null);

            const results: Array<{ toolName: string; result: ToolResult }> = [];
            const debugStore = useSessionDebugStore.getState();

            try {
                for (const toolCall of toolCalls) {
                    // Parse tool call to get agent info
                    const parsed = subAgentRegistry.parseToolCall(toolCall.function.name);
                    const agent = parsed ? subAgentRegistry.getAgent(parsed.agentId) : null;
                    let traceId: string | undefined;
                    
                    // Start tool trace if debugging
                    if (debugStore.isDebugging && parsed) {
                        traceId = debugStore.addToolCallTrace({
                            timestamp: Date.now(),
                            agentId: parsed.agentId,
                            agentName: agent?.name || parsed.agentId,
                            toolName: parsed.toolName,
                            params: JSON.parse(toolCall.function.arguments || "{}"),
                            status: "pending",
                        });
                    }
                    
                    const result = await executeToolCall(toolCall, context);
                    results.push(result);

                    // Track the last tool used
                    if (parsed) {
                        setLastAgentUsed(parsed.agentId);
                        setLastToolUsed(parsed.toolName);
                    }
                    
                    // Complete tool trace
                    if (traceId) {
                        debugStore.completeToolCall(
                            traceId,
                            result.result.data,
                            result.result.error
                        );
                    }
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Tool execution failed";
                setError(errorMessage);
                debugStore.log("error", "ToolCalls", errorMessage);
            } finally {
                setIsProcessing(false);
            }

            return results;
        },
        [context]
    );

    // Get system prompt for an agent
    const getAgentSystemPrompt = useCallback(
        async (agentId: string): Promise<string | null> => {
            const agent = subAgentRegistry.getAgent(agentId);
            if (!agent) return null;

            let agentContext: string | undefined;
            if (agent.getContext) {
                try {
                    agentContext = await agent.getContext(context);
                } catch (err) {
                    console.error(`[useSubAgentRouter] Failed to get context for ${agentId}:`, err);
                }
            }

            return buildAgentSystemPrompt(agent, agentContext);
        },
        [context]
    );

    // Get available agents
    const getAvailableAgents = useCallback(() => {
        return listAvailableAgents();
    }, []);

    // Check if any agent can handle a query
    const canHandleQuery = useCallback(
        (query: string): boolean => {
            const result = subAgentRegistry.routeQuery(query, context, { minConfidence: 0.3 });
            return result.agent !== null;
        },
        [context]
    );

    // Format a tool result
    const formatResult = useCallback((toolName: string, result: ToolResult) => {
        return formatToolResult(toolName, result);
    }, []);

    // Generate text using AI
    const generateText = useCallback(async (prompt: string, systemPrompt?: string): Promise<string | null> => {
        setIsProcessing(true);
        setError(null);

        const providerRaw = settings.defaultProvider || "groq";
        const provider = providerRaw === "z-ai" ? "glm" : providerRaw;
        const configuredModel = settings.defaultModel || "llama-3.3-70b-versatile";
        const availableModels = getProviderModels(provider);
        const model =
            availableModels.length > 0 && !availableModels.some((m) => m.id === configuredModel)
                ? availableModels[0].id
                : configuredModel;

        const apiKeyConfig =
            settings.apiKeys?.find((k: AIApiKeyConfig) => k.providerId === provider && k.isEnabled) ||
            settings.apiKeys?.find(
                (k: AIApiKeyConfig) => k.providerId === (provider === "glm" ? "z-ai" : provider) && k.isEnabled
            );

        if (!apiKeyConfig?.apiKey && provider !== "ollama") {
            const providerName = PROVIDER_NAMES[provider] || provider;
            const msg = `API Key Required for ${providerName}. Add it in Settings > AI > Providers.`;
            setError(msg);
            setIsProcessing(false);
            throw new Error(msg);
        }

        try {
            const messages = [
                { role: "system", content: systemPrompt || "You are a helpful assistant." },
                { role: "user", content: prompt }
            ];

            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages,
                    provider,
                    model,
                    apiKey: apiKeyConfig?.apiKey || "",
                    baseUrl: apiKeyConfig?.baseUrl,
                    temperature: 0.7,
                    maxTokens: 2048,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API error: ${response.status}`);
            }

            const data = await response.json();
            return data.content || null;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Generation failed";
            setError(errorMessage);
            console.error("[useSubAgentRouter] Generation error:", err);
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [settings]);

    // Generate chat response with history
    const generateChat = useCallback(async (messages: { role: "user" | "assistant" | "system", content: string }[], systemPrompt?: string): Promise<string | null> => {
        setIsProcessing(true);
        setError(null);

        const providerRaw = settings.defaultProvider || "groq";
        const provider = providerRaw === "z-ai" ? "glm" : providerRaw;
        const configuredModel = settings.defaultModel || "llama-3.3-70b-versatile";
        const availableModels = getProviderModels(provider);
        const model =
            availableModels.length > 0 && !availableModels.some((m) => m.id === configuredModel)
                ? availableModels[0].id
                : configuredModel;

        const apiKeyConfig =
            settings.apiKeys?.find((k: AIApiKeyConfig) => k.providerId === provider && k.isEnabled) ||
            settings.apiKeys?.find(
                (k: AIApiKeyConfig) => k.providerId === (provider === "glm" ? "z-ai" : provider) && k.isEnabled
            );

        if (!apiKeyConfig?.apiKey && provider !== "ollama") {
            const providerName = PROVIDER_NAMES[provider] || provider;
            const msg = `API Key Required for ${providerName}. Add it in Settings > AI > Providers.`;
            setError(msg);
            setIsProcessing(false);
            throw new Error(msg);
        }

        try {
            const apiMessages = [
                { role: "system", content: systemPrompt || "You are a helpful assistant." },
                ...messages
            ];

            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: apiMessages,
                    provider,
                    model,
                    apiKey: apiKeyConfig?.apiKey || "",
                    baseUrl: apiKeyConfig?.baseUrl,
                    temperature: 0.7,
                    maxTokens: 2048,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API error: ${response.status}`);
            }

            const data = await response.json();
            return data.content || null;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Generation failed";
            setError(errorMessage);
            console.error("[useSubAgentRouter] Chat generation error:", err);
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [settings]);

    return {
        // State
        isProcessing,
        lastAgentUsed,
        lastToolUsed,
        error,
        // Actions
        routeQuery,
        processQuery,
        executeTool: executeToolAction,
        executeToolCalls,
        getAgentSystemPrompt,
        getAvailableAgents,
        canHandleQuery,
        formatResult,
        generateText,
        generateChat,
    };
}
