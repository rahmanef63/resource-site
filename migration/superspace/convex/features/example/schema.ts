/**
 * ============================================================================
 * EXAMPLE FEATURE - schema.ts (Convex)
 * ============================================================================
 * 
 * Database Schema Definition
 * 
 * HOW IT WORKS:
 * 1. Define table schemas using Convex's `defineTable`
 * 2. Export the tables object
 * 3. Main schema.ts imports and composes all feature tables
 * 
 * NAMING CONVENTION:
 * - Table names: camelCase with feature prefix (e.g., exampleItems)
 * - Index names: by_{field} (e.g., by_workspace)
 * 
 * TIPS:
 * - Always include `workspaceId` for multi-tenant isolation
 * - Add indexes for commonly queried fields
 * - Use v.optional() for nullable fields
 */

import { defineTable } from "convex/server"
import { v } from "convex/values"

// =========================================================================
// TABLE DEFINITIONS
// =========================================================================

/**
 * Example Items Table
 * 
 * A simple table demonstrating common patterns:
 * - workspaceId for multi-tenant isolation
 * - createdBy for ownership tracking
 * - timestamps for audit trail
 * - indexes for query performance
 */
export const exampleItems = defineTable({
    /**
     * Reference to the workspace (REQUIRED for multi-tenancy)
     * 
     * Every record MUST belong to a workspace.
     * This enables workspace-level data isolation.
     */
    workspaceId: v.id("workspaces"),
    
    /**
     * Item name/title
     */
    name: v.string(),
    
    /**
     * Completion status
     */
    completed: v.boolean(),
    
    /**
     * User who created this item
     * Optional in schema, but set in mutation
     */
    createdBy: v.optional(v.id("users")),
    
    /**
     * Creation timestamp
     * Set automatically in mutation
     */
    createdAt: v.optional(v.number()),
    
    /**
     * Last update timestamp
     * Updated on every modification
     */
    updatedAt: v.optional(v.number()),
})
    // =========================================================================
    // INDEXES
    // =========================================================================
    
    /**
     * Index: by_workspace
     * 
     * Enables efficient queries like:
     *   ctx.db.query("exampleItems")
     *     .withIndex("by_workspace", q => q.eq("workspaceId", workspaceId))
     * 
     * ALWAYS create this index for multi-tenant tables.
     */
    .index("by_workspace", ["workspaceId"])
    
    /**
     * Index: by_completed
     * 
     * Enables filtering by completion status:
     *   .withIndex("by_completed", q => q.eq("completed", true))
     */
    .index("by_completed", ["completed"])

// =========================================================================
// EXPORTS
// =========================================================================

/**
 * Export all tables for this feature
 * 
 * This object is imported by convex/schema.ts and merged
 * with tables from other features.
 */
export const exampleTables = {
    exampleItems,
}
