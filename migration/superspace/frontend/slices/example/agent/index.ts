/**
 * ============================================================================
 * EXAMPLE FEATURE - agents/index.ts
 * ============================================================================
 * 
 * AI Agent Registration for this feature.
 * 
 * WHY THIS IS REQUIRED:
 * SuperSpace has an AI system that can interact with features.
 * Each feature must register its capabilities so the AI knows:
 * - What this feature does
 * - What tools/actions are available
 * - When to route user queries here
 * 
 * PATTERN:
 * 1. Define a SubAgent with tools
 * 2. Register it with the global registry
 * 3. AI automatically routes relevant queries
 * 
 * TOOLS:
 * Tools are actions the AI can perform on behalf of the user.
 * Each tool has:
 * - name: Unique identifier
 * - description: What it does (AI reads this)
 * - parameters: Expected input shape
 * - handler: The actual implementation
 */

import { subAgentRegistry } from "@/frontend/shared/ai/agent"
import type { SubAgent } from "@/frontend/shared/ai/agent"

/**
 * Register the Example feature's AI agent
 * 
 * Called once at application startup.
 * See: frontend/slices/example/init.ts
 */
export function registerExampleAgent() {
    const agent: SubAgent = {
        // =====================================================================
        // IDENTITY
        // =====================================================================
        
        /**
         * Unique agent ID (kebab-case)
         */
        id: "example-agent",
        
        /**
         * Display name
         */
        name: "Example Agent",
        
        /**
         * What this agent does (AI uses this to decide routing)
         */
        description: "Helps users understand the Example feature and SuperSpace patterns.",
        
        /**
         * Link to parent feature
         */
        featureId: "example",
        
        // =====================================================================
        // TOOLS - What can the AI do with this feature?
        // =====================================================================
        
        tools: [
            {
                /**
                 * Tool: summarize
                 * 
                 * Provides a summary of the feature status.
                 * This is a scaffold - replace with real implementation.
                 */
                name: "summarize",
                description: "Get a summary of the Example feature and its items.",
                parameters: {},
                handler: async (_params, ctx) => {
                    // In a real implementation, you would:
                    // 1. Call Convex queries to get data
                    // 2. Format it for the AI response
                    // 3. Return structured data
                    
                    return {
                        success: true,
                        data: {
                            featureSlug: "example",
                            workspaceId: ctx.workspaceId,
                            description: "This is a minimal example feature for learning.",
                            note: "Implement real tools under convex/features/example/agents.",
                        },
                        message: "Example feature is a learning reference.",
                    }
                },
            },
            {
                /**
                 * Tool: getPatterns
                 * 
                 * Returns information about SuperSpace patterns.
                 */
                name: "getPatterns",
                description: "Learn about SuperSpace development patterns and conventions.",
                parameters: {},
                handler: async () => {
                    return {
                        success: true,
                        data: {
                            patterns: [
                                "SSOT: Single Source of Truth in config.ts",
                                "RBAC: Every query/mutation checks permissions",
                                "Audit: Every mutation logs an audit event",
                                "Zero-Hardcoding: Features are auto-discovered",
                                "Three-Tier Sharing: Global → Feature → Local",
                            ],
                        },
                        message: "Here are the core SuperSpace patterns.",
                    }
                },
            },
        ],
        
        // =====================================================================
        // ROUTING - When should queries come to this agent?
        // =====================================================================
        
        /**
         * Determine if this agent can handle a query
         * 
         * @param query - The user's natural language query
         * @returns Score 0-1 (0 = can't handle, 1 = perfect match)
         * 
         * The AI system uses these scores to route queries.
         * Higher score = more likely to handle.
         */
        canHandle: (query: string): number => {
            const q = query.toLowerCase()
            
            // High confidence keywords
            if (q.includes("example") || q.includes("tutorial") || q.includes("learn")) {
                return 0.8
            }
            
            // Medium confidence
            if (q.includes("pattern") || q.includes("convention") || q.includes("how to")) {
                return 0.5
            }
            
            // Can't handle
            return 0
        },
    }

    // =========================================================================
    // REGISTER WITH GLOBAL REGISTRY
    // =========================================================================
    
    /**
     * Register the agent with the central registry
     * 
     * Options:
     * - priority: Higher = processed first (default: 10)
     * - enabled: Can be disabled without removing (default: true)
     */
    subAgentRegistry.register(agent, { 
        priority: 10, 
        enabled: true 
    })
}
