import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership, requirePermission } from "../../auth/helpers"
import { logAuditEvent } from "../../shared/audit"

export const registerAsset = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    name: v.string(),
    category: v.string(),
    serialNumber: v.optional(v.string()),
    purchaseDate: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    depreciationMethod: v.optional(
      v.union(v.literal("straight-line"), v.literal("declining-balance"), v.literal("none")),
    ),
    usefulLifeYears: v.optional(v.number()),
    location: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "assets.register")
    const userId = await ensureUser(ctx)
    const now = Date.now()
    const id = await ctx.db.insert("managedAssets", {
      workspaceId: args.workspaceId,
      branchId: args.branchId,
      name: args.name,
      category: args.category,
      serialNumber: args.serialNumber,
      purchaseDate: args.purchaseDate,
      purchasePrice: args.purchasePrice,
      currentValue: args.purchasePrice,
      depreciationMethod: args.depreciationMethod,
      usefulLifeYears: args.usefulLifeYears,
      status: "active",
      location: args.location,
      assignedTo: args.assignedTo,
      notes: args.notes,
      photos: args.photos,
      createdAt: now,
      updatedAt: now,
    })
    if (args.purchasePrice) {
      await ctx.db.insert("assetTransactions", {
        workspaceId: args.workspaceId,
        assetId: id,
        type: "purchase",
        amount: args.purchasePrice,
        date: args.purchaseDate ?? new Date().toISOString().split("T")[0],
        performedBy: userId,
        createdAt: now,
      })
    }
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "assets.registered",
      resourceType: "managedAssets",
      resourceId: id,
    })
    return { id, success: true }
  },
})

export const transferAsset = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    assetId: v.id("managedAssets"),
    toLocation: v.optional(v.string()),
    toAssignee: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "assets.transfer")
    const userId = await ensureUser(ctx)
    const asset = await ctx.db.get(args.assetId)
    if (!asset || asset.workspaceId !== args.workspaceId) throw new Error("Asset not found")

    const now = Date.now()
    await ctx.db.patch(args.assetId, {
      location: args.toLocation ?? asset.location,
      assignedTo: args.toAssignee ?? asset.assignedTo,
      updatedAt: now,
    })
    await ctx.db.insert("assetTransactions", {
      workspaceId: args.workspaceId,
      assetId: args.assetId,
      type: "transfer",
      date: new Date().toISOString().split("T")[0],
      notes: args.notes,
      performedBy: userId,
      createdAt: now,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "assets.transferred",
      resourceType: "managedAssets",
      resourceId: args.assetId,
    })
    return { success: true }
  },
})

export const retireAsset = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    assetId: v.id("managedAssets"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "assets.retire")
    const userId = await ensureUser(ctx)
    const asset = await ctx.db.get(args.assetId)
    if (!asset || asset.workspaceId !== args.workspaceId) throw new Error("Asset not found")

    const now = Date.now()
    await ctx.db.patch(args.assetId, { status: "retired", currentValue: 0, updatedAt: now })
    await ctx.db.insert("assetTransactions", {
      workspaceId: args.workspaceId,
      assetId: args.assetId,
      type: "retirement",
      date: new Date().toISOString().split("T")[0],
      notes: args.reason,
      performedBy: userId,
      createdAt: now,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "assets.retired",
      resourceType: "managedAssets",
      resourceId: args.assetId,
      metadata: { reason: args.reason },
    })
    return { success: true }
  },
})
