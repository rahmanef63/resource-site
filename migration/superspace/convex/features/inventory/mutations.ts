import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import type { Id } from "../../_generated/dataModel"

/**
 * Mutations for inventory feature
 * Manages inventory items, stock adjustments, and warehouse operations
 */

// ============================================================================
// Item Mutations
// ============================================================================

/**
 * Create a new inventory item
 */
export const createItem = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        name: v.string(),
        sku: v.string(),
        description: v.optional(v.string()),
        category: v.optional(v.id("inventoryCategories")),
        itemType: v.optional(v.union(
            v.literal("product"),
            v.literal("service"),
            v.literal("bundle"),
            v.literal("kit")
        )),
        unit: v.optional(v.string()),
        costPrice: v.number(),
        sellingPrice: v.number(),
        currency: v.optional(v.string()),
        trackStock: v.optional(v.boolean()),
        minStock: v.optional(v.number()),
        maxStock: v.optional(v.number()),
        reorderPoint: v.optional(v.number()),
        reorderQuantity: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
        isTaxable: v.optional(v.boolean()),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.INVENTORY_MANAGE
        )

        const now = Date.now()

        // Check if SKU already exists
        const existingSku = await ctx.db
            .query("inventoryItems")
            .withIndex("by_sku", (q) => q.eq("sku", args.sku))
            .first()

        if (existingSku && existingSku.workspaceId === args.workspaceId) {
            throw new Error(`SKU ${args.sku} already exists`)
        }

        const itemId = await ctx.db.insert("inventoryItems", {
            workspaceId: args.workspaceId,
            name: args.name,
            sku: args.sku,
            description: args.description,
            category: args.category,
            itemType: args.itemType ?? "product",
            unit: args.unit ?? "pcs",
            costPrice: args.costPrice,
            sellingPrice: args.sellingPrice,
            currency: args.currency ?? "USD",
            trackStock: args.trackStock ?? true,
            trackSerial: false,
            trackBatch: false,
            trackExpiry: false,
            minStock: args.minStock ?? 0,
            maxStock: 0,
            reorderPoint: 0,
            reorderQuantity: 0,
            leadTime: 0,
            suppliers: [],
            images: [],
            documents: [],
            attributes: [],
            variants: [],
            isActive: true,
            isFeatured: false,
            isTaxable: true,
            tags: [],
            createdAt: now,
            createdBy: membership.userId,
            updatedAt: now,
            updatedBy: membership.userId,
        })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "inventory.item.create",
            resourceType: "inventoryItem",
            resourceId: itemId,
            metadata: { sku: args.sku, name: args.name },
        })

        return { itemId, sku: args.sku }
    },
})

/**
 * Update an inventory item
 */
export const updateItem = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        itemId: v.id("inventoryItems"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        costPrice: v.optional(v.number()),
        sellingPrice: v.optional(v.number()),
        minStock: v.optional(v.number()),
        maxStock: v.optional(v.number()),
        reorderPoint: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.INVENTORY_MANAGE
        )

        const item = await ctx.db.get(args.itemId)
        if (!item || item.workspaceId !== args.workspaceId) {
            throw new Error("Item not found")
        }

        const updates: any = { updatedAt: Date.now() }

        if (args.name !== undefined) updates.name = args.name
        if (args.description !== undefined) updates.description = args.description
        if (args.costPrice !== undefined) updates.costPrice = args.costPrice
        if (args.sellingPrice !== undefined) updates.sellingPrice = args.sellingPrice
        if (args.minStock !== undefined) updates.minStock = args.minStock
        if (args.maxStock !== undefined) updates.maxStock = args.maxStock
        if (args.reorderPoint !== undefined) updates.reorderPoint = args.reorderPoint
        if (args.isActive !== undefined) updates.isActive = args.isActive
        if (args.tags !== undefined) updates.tags = args.tags

        await ctx.db.patch(args.itemId, updates)

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "inventory.item.update",
            resourceType: "inventoryItem",
            resourceId: args.itemId,
            metadata: { sku: item.sku },
        })

        return { success: true }
    },
})

/**
 * Delete an inventory item (soft delete by setting inactive)
 */
export const deleteItem = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        itemId: v.id("inventoryItems"),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.INVENTORY_MANAGE
        )

        const item = await ctx.db.get(args.itemId)
        if (!item || item.workspaceId !== args.workspaceId) {
            throw new Error("Item not found")
        }

        await ctx.db.patch(args.itemId, {
            isActive: false,
            updatedAt: Date.now(),
        })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "inventory.item.delete",
            resourceType: "inventoryItem",
            resourceId: args.itemId,
            metadata: { sku: item.sku },
        })

        return { success: true }
    },
})

// ============================================================================
// Stock Adjustment Mutations
// ============================================================================

/**
 * Adjust stock quantity for an item
 */
export const adjustStock = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        itemId: v.id("inventoryItems"),
        warehouseId: v.id("warehouses"),
        adjustmentType: v.union(
            v.literal("received"),
            v.literal("sold"),
            v.literal("damaged"),
            v.literal("lost"),
            v.literal("returned"),
            v.literal("adjustment")
        ),
        quantity: v.number(), // Positive for add, negative for subtract
        reason: v.optional(v.string()),
        reference: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.INVENTORY_MANAGE
        )

        const item = await ctx.db.get(args.itemId)
        if (!item || item.workspaceId !== args.workspaceId) {
            throw new Error("Item not found")
        }

        const now = Date.now()

        let type: "in" | "out" | "transfer" | "adjustment" = "adjustment";
        let reason: "purchase" | "sale" | "return" | "damage" | "loss" | "correction" | "initial" = "correction";

        switch (args.adjustmentType) {
            case "received":
                type = "in";
                reason = "purchase";
                break;
            case "sold":
                type = "out";
                reason = "sale";
                break;
            case "damaged":
                type = "out";
                reason = "damage";
                break;
            case "lost":
                type = "out";
                reason = "loss";
                break;
            case "returned":
                type = "in";
                reason = "return";
                break;
            case "adjustment":
                type = "adjustment";
                reason = "correction";
                break;
        }

        // Create stock movement record
        const movementId = await ctx.db.insert("stockMovements", {
            workspaceId: args.workspaceId,
            item: args.itemId,
            warehouse: args.warehouseId,
            movementType: args.quantity > 0 ? "in" : "out",
            referenceType: "adjustment",
            quantity: Math.abs(args.quantity),
            notes: args.reason,
            timestamp: now,
            userId: membership.userId,
            serialNumbers: [],
        })

        const existingStock = await ctx.db
            .query("stockLevels")
            .withIndex("by_item_warehouse", (q) =>
                q.eq("item", args.itemId).eq("warehouse", args.warehouseId)
            )
            .first()

        if (existingStock) {
            await ctx.db.patch(existingStock._id, {
                quantityOnHand: existingStock.quantityOnHand + args.quantity,
                quantityAvailable: existingStock.quantityAvailable + args.quantity,
                updatedAt: now,
            })
        } else {
            await ctx.db.insert("stockLevels", {
                workspaceId: args.workspaceId,
                item: args.itemId,
                warehouse: args.warehouseId,
                quantityOnHand: args.quantity,
                quantityCommitted: 0,
                quantityAvailable: args.quantity,
                quantityOnOrder: 0,
                quantityInTransit: 0,
                totalCost: 0,
                averageCost: 0,
                updatedAt: now,
            })
        }

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "inventory.stock.adjust",
            resourceType: "stockMovement",
            resourceId: movementId,
            metadata: {
                itemId: args.itemId,
                sku: item.sku,
                quantity: args.quantity,
                type: args.adjustmentType,
            },
        })

        return { success: true, movementId }
    },
})

// ============================================================================
// Warehouse Mutations
// ============================================================================

/**
 * Create a new warehouse
 */
export const createWarehouse = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        name: v.string(),
        code: v.string(),
        type: v.optional(v.union(
            v.literal("main"),
            v.literal("branch"),
            v.literal("distribution"),
            v.literal("transit")
        )),
        address: v.optional(v.object({
            line1: v.string(),
            line2: v.optional(v.string()),
            city: v.string(),
            state: v.optional(v.string()),
            country: v.string(),
            postalCode: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.INVENTORY_MANAGE
        )

        const now = Date.now()

        const warehouseId = await ctx.db.insert("warehouses", {
            workspaceId: args.workspaceId,
            name: args.name,
            code: args.code,
            type: args.type ?? "main",
            address: args.address,
            isActive: true,
            isDefault: false,
            timezone: "UTC",
            currency: "USD",
            createdAt: now,
            createdBy: membership.userId,
            updatedAt: now,
            updatedBy: membership.userId,
        })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "inventory.warehouse.create",
            resourceType: "warehouse",
            resourceId: warehouseId,
            metadata: { name: args.name, code: args.code },
        })

        return { warehouseId }
    },
})

// ============================================================================
// Category Mutations
// ============================================================================

/**
 * Create an inventory category
 */
export const createCategory = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        parentId: v.optional(v.id("inventoryCategories")),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.INVENTORY_MANAGE
        )

        const now = Date.now()

        const categoryId = await ctx.db.insert("inventoryCategories", {
            workspaceId: args.workspaceId,
            name: args.name,
            slug: args.slug,
            description: args.description,
            parent: args.parentId,
            path: args.slug, // TODO: Implement proper path construction
            sortOrder: 0,
            isActive: true,
            createdAt: now,
            createdBy: membership.userId,
            updatedAt: now,
            updatedBy: membership.userId,
        })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "inventory.category.create",
            resourceType: "inventoryCategory",
            resourceId: categoryId,
            metadata: { name: args.name },
        })

        return { categoryId }
    },
})

/**
 * Bulk-import inventory items — typically from CSV/spreadsheet upload.
 * Skips rows whose SKU already exists in this workspace.
 */
export const bulkImportItems = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        rows: v.array(v.object({
            sku: v.string(),
            name: v.string(),
            description: v.optional(v.string()),
            unit: v.string(),
            costPrice: v.number(),
            sellingPrice: v.number(),
            currency: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.INVENTORY_MANAGE,
        )
        const userId = membership?.userId as Id<"users"> | undefined
        if (!userId) throw new Error("No user")

        const now = Date.now()
        const existingChecks = await Promise.all(
            args.rows.map((row) =>
                ctx.db
                    .query("inventoryItems")
                    .withIndex("by_sku", (q) => q.eq("sku", row.sku))
                    .first(),
            ),
        )

        let inserted = 0
        const skipped: string[] = []
        const toInsert: Array<typeof args.rows[number]> = []
        args.rows.forEach((row, i) => {
            const existing = existingChecks[i]
            if (existing && existing.workspaceId === args.workspaceId) {
                skipped.push(row.sku)
            } else {
                toInsert.push(row)
            }
        })

        await Promise.all(toInsert.map((row) =>
            ctx.db.insert("inventoryItems", {
                sku: row.sku,
                name: row.name,
                description: row.description,
                itemType: "product",
                unit: row.unit,
                costPrice: row.costPrice,
                sellingPrice: row.sellingPrice,
                currency: row.currency ?? "IDR",
                trackStock: true,
                trackSerial: false,
                trackBatch: false,
                trackExpiry: false,
                minStock: 0,
                maxStock: 0,
                reorderPoint: 0,
                reorderQuantity: 0,
                leadTime: 0,
                suppliers: [],
                images: [],
                documents: [],
                attributes: [],
                variants: [],
                isActive: true,
                isFeatured: false,
                isTaxable: false,
                tags: [],
                workspaceId: args.workspaceId,
                createdAt: now,
                createdBy: userId,
                updatedAt: now,
                updatedBy: userId,
            }),
        ))
        inserted = toInsert.length

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: userId,
            action: "inventory.bulkImported",
            resourceType: "inventoryItems",
            resourceId: args.workspaceId,
            metadata: { inserted, skipped: skipped.length },
        })

        return { inserted, skipped }
    },
})
