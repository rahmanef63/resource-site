/**
 * ============================================================================
 * EXAMPLE FEATURE - queries.ts (Convex)
 * ============================================================================
 * 
 * Read Operations (Queries)
 * 
 * CONVEX QUERIES:
 * - Are reactive (UI updates automatically when data changes)
 * - Are cached for performance
 * - Should be fast and side-effect free
 * - MUST check permissions (RBAC)
 * 
 * PATTERN:
 * 1. Define args with Convex validators (v.string(), v.id(), etc.)
 * 2. Check user authentication
 * 3. Check permissions (RBAC)
 * 4. Query the database
 * 5. Return data (optionally with joined data)
 * 
 * TIPS:
 * - Use indexes for better performance
 * - Return only the data you need
 * - Consider pagination for large datasets
 */

import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

// =========================================================================
// GET ALL ITEMS
// =========================================================================

/**
 * Get all example items in a workspace
 * 
 * REACTIVE: This query re-runs automatically when:
 * - New items are added
 * - Existing items are updated
 * - Items are deleted
 * 
 * Usage in React:
 *   const items = useQuery(api.features.example.queries.getItems, {
 *     workspaceId
 *   })
 */
export const getItems = query({
    // =========================================================================
    // ARGUMENTS
    // =========================================================================
    
    /**
     * Define expected arguments with Convex validators
     * 
     * These are type-safe and validated at runtime.
     * TypeScript types are inferred automatically.
     */
    args: {
        workspaceId: v.id("workspaces"),
        completed: v.optional(v.boolean()),
    },
    
    // =========================================================================
    // RETURN TYPE
    // =========================================================================
    
    /**
     * Explicitly define return type for type safety
     * 
     * v.array(v.any()) is permissive - use specific types in production
     */
    returns: v.array(v.any()),
    
    // =========================================================================
    // HANDLER
    // =========================================================================
    
    /**
     * The query implementation
     * 
     * @param ctx - Convex context (db, auth, etc.)
     * @param args - Validated arguments
     */
    handler: async (ctx, args) => {
        // =====================================================================
        // STEP 1: Authentication + Membership Gate (MANDATORY, fail-closed)
        // =====================================================================

        /**
         * SECURITY CONTRACT — every workspace-scoped read MUST gate on the
         * caller's active membership of `args.workspaceId` BEFORE touching the
         * database. Convex queries are directly reachable over HTTP, so a
         * route-layer check is NOT enough and an auth-only check
         * (`getExistingUserId`) is NOT enough — any authenticated user could
         * otherwise read another tenant's workspace by guessing an id.
         *
         * `requireActiveMembership` resolves the caller (sister-user aware) and
         * THROWS ("Not authenticated" / "Not authorized") unless they are an
         * active member of the workspace (or its creator). Non-members fail
         * closed here — that is intended.
         *
         * For a finer-grained per-action gate, use requirePermission instead:
         *   await requirePermission(ctx, args.workspaceId, 'example.view')
         * See convex/features/crm/queries.ts for a full implementation.
         */
        await requireActiveMembership(ctx, args.workspaceId)

        // =====================================================================
        // STEP 2: Query Database
        // =====================================================================
        
        /**
         * Build the query using indexes for performance
         * 
         * Pattern: Start with index, then filter, then collect
         */
        let itemsQuery = ctx.db
            .query("exampleItems")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        
        // Optional: Filter by completion status
        if (args.completed !== undefined) {
            itemsQuery = itemsQuery.filter((q) => 
                q.eq(q.field("completed"), args.completed)
            )
        }
        
        // Execute query and get results
        const items = await itemsQuery.order("desc").take(5000)
        
        // =====================================================================
        // STEP 3: Return Data
        // =====================================================================
        
        /**
         * Return items directly, or join with related data if needed
         * 
         * For joined data, see convex/features/crm/queries.ts:
         *   const itemsWithDetails = await Promise.all(
         *     items.map(async (item) => ({
         *       ...item,
         *       creator: await ctx.db.get(item.createdBy),
         *     }))
         *   )
         */
        return items
    },
})

// =========================================================================
// GET SINGLE ITEM
// =========================================================================

/**
 * Get a single example item by ID
 *
 * DOC-ID READ PATTERN: when the only argument is a document id (no
 * workspaceId), you cannot gate BEFORE the read — you don't yet know which
 * workspace the doc belongs to. So FETCH FIRST, then gate on the doc's own
 * `workspaceId` before returning it. Never return a doc you fetched by id
 * without confirming the caller is a member of that doc's workspace.
 */
export const getItem = query({
    args: {
        itemId: v.id("exampleItems"),
    },
    returns: v.union(v.any(), v.null()),
    handler: async (ctx, args) => {
        const item = await ctx.db.get(args.itemId)
        if (!item) return null

        // Gate on the fetched doc's workspace — throws for non-members.
        await requireActiveMembership(ctx, item.workspaceId)

        return item
    },
})

// =========================================================================
// GET STATS
// =========================================================================

/**
 * Get summary statistics for the example feature
 */
export const getStats = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    returns: v.object({
        total: v.number(),
        completed: v.number(),
        pending: v.number(),
    }),
    handler: async (ctx, args) => {
        // Workspace-scoped read — gate on membership first (fail-closed).
        await requireActiveMembership(ctx, args.workspaceId)

        const items = await ctx.db
            .query("exampleItems")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .take(1000)
        
        const completed = items.filter((i) => i.completed).length
        
        return {
            total: items.length,
            completed,
            pending: items.length - completed,
        }
    },
})
