import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Inventory Queries
 * Read operations with workspace isolation and RBAC
 */

export const getItems = query({
  args: {
    workspaceId: v.id("workspaces"),
    category: v.optional(v.id("inventoryCategories")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    if (args.category) {
      return ctx.db
        .query("inventoryItems")
        .withIndex("by_category", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("category", args.category)
        )
        .take(args.limit ?? 50)
    }

    return ctx.db
      .query("inventoryItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(args.limit ?? 50)
  },
})

export const getItem = query({
  args: { itemId: v.id("inventoryItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId)
    if (!item) return null
    await requireActiveMembership(ctx, item.workspaceId)
    return item
  },
})

export const getCategories = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return ctx.db
      .query("inventoryCategories")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(100)
  },
})

export const getWarehouses = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return ctx.db
      .query("warehouses")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(50)
  },
})

export const getSuppliers = query({
  args: { workspaceId: v.id("workspaces"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return ctx.db
      .query("suppliers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(args.limit ?? 50)
  },
})

export const getStockAdjustments = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    if (args.status) {
      return ctx.db
        .query("stockAdjustments")
        .withIndex("by_status", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("status", args.status as "pending" | "draft" | "completed" | "cancelled" | "approved")
        )
        .take(args.limit ?? 50)
    }

    return ctx.db
      .query("stockAdjustments")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(args.limit ?? 50)
  },
})

export const getPurchaseOrders = query({
  args: { workspaceId: v.id("workspaces"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return ctx.db
      .query("purchaseOrders")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(args.limit ?? 50)
  },
})
