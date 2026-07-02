import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership, requirePermission } from "../../auth/helpers"
import { logAuditEvent } from "../../shared/audit"

export const createTransfer = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    type: v.union(
      v.literal("withdraw"),
      v.literal("inject"),
      v.literal("loan"),
      v.literal("repayment"),
    ),
    amount: v.number(),
    currency: v.optional(v.string()),
    fromAccount: v.optional(v.string()),
    toAccount: v.optional(v.string()),
    ownerUserId: v.id("users"),
    transferDate: v.string(),
    category: v.optional(v.string()),
    notes: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "ownerTransfers.create")
    const userId = await ensureUser(ctx)
    if (args.amount <= 0) throw new Error("Amount must be > 0")

    const now = Date.now()
    const id = await ctx.db.insert("ownerTransfers", {
      workspaceId: args.workspaceId,
      branchId: args.branchId,
      type: args.type,
      amount: args.amount,
      currency: args.currency ?? "IDR",
      fromAccount: args.fromAccount,
      toAccount: args.toAccount,
      ownerUserId: args.ownerUserId,
      transferDate: args.transferDate,
      category: args.category,
      notes: args.notes,
      attachments: args.attachments,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "ownerTransfers.created",
      resourceType: "ownerTransfers",
      resourceId: id,
      metadata: { type: args.type, amount: args.amount },
    })
    return { id, success: true }
  },
})

export const approveTransfer = mutation({
  args: { workspaceId: v.id("workspaces"), transferId: v.id("ownerTransfers") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "ownerTransfers.approve")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.transferId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Transfer not found")
    if (row.status !== "pending") throw new Error(`Cannot approve: status is ${row.status}`)

    await ctx.db.patch(args.transferId, {
      approvedBy: userId,
      approvedAt: Date.now(),
      status: "approved",
      updatedAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "ownerTransfers.approved",
      resourceType: "ownerTransfers",
      resourceId: args.transferId,
    })
    return { success: true }
  },
})

export const updateTransfer = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    transferId: v.id("ownerTransfers"),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    fromAccount: v.optional(v.string()),
    toAccount: v.optional(v.string()),
    transferDate: v.optional(v.string()),
    category: v.optional(v.string()),
    notes: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "ownerTransfers.create")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.transferId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Transfer not found")
    if (row.status !== "pending") {
      throw new Error(`Cannot edit transfer: status is ${row.status}`)
    }
    if (args.amount !== undefined && args.amount <= 0) {
      throw new Error("Amount must be > 0")
    }
    const patch: Record<string, unknown> = { updatedAt: Date.now() }
    if (args.amount !== undefined) patch.amount = args.amount
    if (args.currency !== undefined) patch.currency = args.currency
    if (args.fromAccount !== undefined) patch.fromAccount = args.fromAccount
    if (args.toAccount !== undefined) patch.toAccount = args.toAccount
    if (args.transferDate !== undefined) patch.transferDate = args.transferDate
    if (args.category !== undefined) patch.category = args.category
    if (args.notes !== undefined) patch.notes = args.notes
    if (args.attachments !== undefined) patch.attachments = args.attachments
    await ctx.db.patch(args.transferId, patch as any)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "ownerTransfers.updated",
      resourceType: "ownerTransfers",
      resourceId: args.transferId,
      changes: patch,
    })
    return { success: true }
  },
})

export const rejectTransfer = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    transferId: v.id("ownerTransfers"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "ownerTransfers.approve")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.transferId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Transfer not found")
    if (row.status !== "pending") {
      throw new Error(`Cannot reject: status is ${row.status}`)
    }
    await ctx.db.patch(args.transferId, {
      status: "rejected",
      updatedAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "ownerTransfers.rejected",
      resourceType: "ownerTransfers",
      resourceId: args.transferId,
      metadata: { reason: args.reason, amount: row.amount, type: row.type },
    })
    return { success: true }
  },
})

export const deleteTransfer = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    transferId: v.id("ownerTransfers"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "ownerTransfers.create")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.transferId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Transfer not found")
    if (row.status !== "pending" && row.status !== "rejected") {
      throw new Error(
        `Cannot delete: status is ${row.status}. Only pending/rejected transfers may be removed.`,
      )
    }
    await ctx.db.delete(args.transferId)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "ownerTransfers.deleted",
      resourceType: "ownerTransfers",
      resourceId: args.transferId,
      metadata: { amount: row.amount, type: row.type, status: row.status },
    })
    return { success: true }
  },
})

export const reconcileTransfer = mutation({
  args: { workspaceId: v.id("workspaces"), transferId: v.id("ownerTransfers") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "ownerTransfers.reconcile")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.transferId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Transfer not found")
    if (row.status !== "approved") throw new Error(`Cannot reconcile: status is ${row.status}`)

    await ctx.db.patch(args.transferId, {
      reconciledAt: Date.now(),
      status: "reconciled",
      updatedAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "ownerTransfers.reconciled",
      resourceType: "ownerTransfers",
      resourceId: args.transferId,
    })
    return { success: true }
  },
})
