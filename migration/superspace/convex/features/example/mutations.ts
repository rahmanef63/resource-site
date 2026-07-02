/**
 * ============================================================================
 * EXAMPLE FEATURE - mutations.ts (Convex)
 * ============================================================================
 * 
 * Write Operations (Mutations)
 * 
 * CONVEX MUTATIONS:
 * - Are transactional (all-or-nothing)
 * - Are NOT reactive (don't re-run automatically)
 * - Can have side effects
 * - MUST check permissions (RBAC)
 * - MUST log audit events
 * 
 * PATTERN:
 * 1. Define args with Convex validators
 * 2. Check user authentication
 * 3. Check permissions (RBAC) ← CRITICAL
 * 4. Perform the operation
 * 5. Log audit event ← CRITICAL
 * 6. Return result
 * 
 * CRITICAL RULES:
 * - Every mutation MUST call requirePermission()
 * - Every mutation MUST call logAuditEvent()
 * - No exceptions!
 */

import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requirePermission } from "../../auth/helpers"
import { logAuditEvent } from "../../shared/audit"

// =========================================================================
// CREATE ITEM
// =========================================================================

/**
 * Create a new example item
 * 
 * Demonstrates the full mutation pattern:
 * 1. RBAC check
 * 2. Business logic
 * 3. Audit logging
 */
export const createItem = mutation({
    // =========================================================================
    // ARGUMENTS
    // =========================================================================
    
    args: {
        /**
         * Workspace context (REQUIRED for multi-tenancy)
         */
        workspaceId: v.id("workspaces"),
        
        /**
         * Item name
         */
        name: v.string(),
    },
    
    // =========================================================================
    // RETURN TYPE
    // =========================================================================
    
    /**
     * Return the created item's ID
     */
    returns: v.id("exampleItems"),
    
    // =========================================================================
    // HANDLER
    // =========================================================================
    
    handler: async (ctx, args) => {
        // =====================================================================
        // STEP 1: Authentication
        // =====================================================================
        
        /**
         * Ensure user is authenticated
         * Throws error if not
         */
        const userId = await ensureUser(ctx)
        
        // =====================================================================
        // STEP 2: Permission Check (RBAC) ← CRITICAL
        // =====================================================================
        
        /**
         * Check if user has permission to create items
         * 
         * This throws an error if permission is denied.
         * Permission strings should match config.ts permissions array.
         * 
         * NOTE: For this example, we use a generic permission.
         * In production, use specific permissions like 'example.create'
         */
        // await requirePermission(ctx, args.workspaceId, 'example.create')
        
        // For the example feature, we'll skip strict permission checking
        // to allow easy testing. In production, ALWAYS check permissions!
        
        // =====================================================================
        // STEP 3: Business Logic
        // =====================================================================
        
        /**
         * Create the item in the database
         */
        const now = Date.now()
        
        const itemId = await ctx.db.insert("exampleItems", {
            workspaceId: args.workspaceId,
            name: args.name,
            completed: false,
            createdBy: userId,
            createdAt: now,
            updatedAt: now,
        })
        
        // =====================================================================
        // STEP 4: Audit Logging ← CRITICAL
        // =====================================================================
        
        /**
         * Log the action for compliance and debugging
         * 
         * This creates a record in the activityEvents table that:
         * - Tracks who did what
         * - When it happened
         * - What changed
         * 
         * Audit logs are:
         * - Immutable (never deleted)
         * - Searchable
         * - Exportable for compliance
         */
        await logAuditEvent(ctx, {
            action: "example.item.created",
            resourceType: "exampleItem",
            resourceId: itemId,
            workspaceId: args.workspaceId,
            metadata: {
                itemName: args.name,
            },
        })
        
        // =====================================================================
        // STEP 5: Return Result
        // =====================================================================
        
        return itemId
    },
})

// =========================================================================
// TOGGLE ITEM
// =========================================================================

/**
 * Toggle the completed status of an item
 */
export const toggleItem = mutation({
    args: {
        itemId: v.id("exampleItems"),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const userId = await ensureUser(ctx)
        
        // Get current item
        const item = await ctx.db.get(args.itemId)
        if (!item) {
            throw new Error("Item not found")
        }
        
        // Permission check (skipped for example)
        // await requirePermission(ctx, item.workspaceId, 'example.edit')
        
        // Toggle completed status
        const newCompleted = !item.completed
        
        await ctx.db.patch(args.itemId, {
            completed: newCompleted,
            updatedAt: Date.now(),
        })
        
        // Audit log
        await logAuditEvent(ctx, {
            action: newCompleted ? "example.item.completed" : "example.item.uncompleted",
            resourceType: "exampleItem",
            resourceId: args.itemId,
            workspaceId: item.workspaceId,
            metadata: {
                itemName: item.name,
                previousCompleted: item.completed,
                newCompleted,
            },
        })
        
        return newCompleted
    },
})

// =========================================================================
// DELETE ITEM
// =========================================================================

/**
 * Delete an example item
 * 
 * Demonstrates the delete pattern with audit trail.
 */
export const deleteItem = mutation({
    args: {
        itemId: v.id("exampleItems"),
        workspaceId: v.id("workspaces"),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const userId = await ensureUser(ctx)
        
        // Get item before deletion (for audit log)
        const item = await ctx.db.get(args.itemId)
        if (!item) {
            throw new Error("Item not found")
        }
        
        // Verify workspace matches
        if (item.workspaceId !== args.workspaceId) {
            throw new Error("Item does not belong to this workspace")
        }
        
        // Permission check (skipped for example)
        // await requirePermission(ctx, args.workspaceId, 'example.delete')
        
        // Delete the item
        await ctx.db.delete(args.itemId)
        
        // Audit log (CRITICAL: Log BEFORE returning)
        await logAuditEvent(ctx, {
            action: "example.item.deleted",
            resourceType: "exampleItem",
            resourceId: args.itemId,
            workspaceId: args.workspaceId,
            metadata: {
                deletedItemName: item.name,
                wasCompleted: item.completed,
            },
        })
        
        return true
    },
})

// =========================================================================
// UPDATE ITEM
// =========================================================================

/**
 * Update an example item's name
 */
export const updateItem = mutation({
    args: {
        itemId: v.id("exampleItems"),
        name: v.string(),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const userId = await ensureUser(ctx)
        
        const item = await ctx.db.get(args.itemId)
        if (!item) {
            throw new Error("Item not found")
        }
        
        // Permission check (skipped for example)
        // await requirePermission(ctx, item.workspaceId, 'example.edit')
        
        const previousName = item.name
        
        await ctx.db.patch(args.itemId, {
            name: args.name,
            updatedAt: Date.now(),
        })
        
        // Audit log
        await logAuditEvent(ctx, {
            action: "example.item.updated",
            resourceType: "exampleItem",
            resourceId: args.itemId,
            workspaceId: item.workspaceId,
            metadata: {
                previousName,
                newName: args.name,
            },
        })
        
        return true
    },
})
