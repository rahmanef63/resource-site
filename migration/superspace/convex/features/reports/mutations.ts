import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requireActiveMembership, requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"

/**
 * Reports Mutations
 */

// Create new item
export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Require permission
    const { membership } = await requireActiveMembership(ctx, args.workspaceId)
    const actorId = membership?.userId

    const itemId = await ctx.db.insert("reports", {
      workspaceId: args.workspaceId,
      name: args.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      action: "report.create",
      workspaceId: args.workspaceId,
      actorUserId: actorId,
      resourceType: "report",
      resourceId: itemId,
      changes: { name: args.name },
    })

    return itemId
  },
})

// Update item
export const update = mutation({
  args: {
    id: v.id("reports"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) throw new Error("Item not found")

    // Require permission
    const { membership } = await requireActiveMembership(ctx, item.workspaceId)
    const actorId = membership?.userId

    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      action: "report.update",
      workspaceId: item.workspaceId,
      actorUserId: actorId,
      resourceType: "report",
      resourceId: args.id,
      changes: { name: args.name },
    })

    return args.id
  },
})

// Delete item
export const remove = mutation({
  args: {
    id: v.id("reports"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) throw new Error("Item not found")

    // Require permission
    const { membership } = await requireActiveMembership(ctx, item.workspaceId)
    const actorId = membership?.userId

    await ctx.db.delete(args.id)

    await logAuditEvent(ctx, {
      action: "report.delete",
      workspaceId: item.workspaceId,
      actorUserId: actorId,
      resourceType: "report",
      resourceId: args.id,
      metadata: { name: item.name },
    })

    return args.id
  },
})
