import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership, requirePermission } from "../../auth/helpers"
import { logAuditEvent } from "../../shared/audit"

export const createRequest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    amount: v.number(),
    currency: v.optional(v.string()),
    purpose: v.string(),
    category: v.optional(v.string()),
    notes: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "pettyCash.create")
    const userId = await ensureUser(ctx)
    if (args.amount <= 0) throw new Error("Amount must be > 0")

    const now = Date.now()
    const id = await ctx.db.insert("pettyCashRequests", {
      workspaceId: args.workspaceId,
      branchId: args.branchId,
      requesterId: userId,
      amount: args.amount,
      currency: args.currency ?? "IDR",
      purpose: args.purpose,
      category: args.category,
      notes: args.notes,
      status: "pending",
      attachments: args.attachments,
      createdAt: now,
      updatedAt: now,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pettyCash.request.created",
      resourceType: "pettyCashRequests",
      resourceId: id,
    })
    return { id, success: true }
  },
})

export const approveRequest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    requestId: v.id("pettyCashRequests"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "pettyCash.approve")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.requestId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Request not found")
    if (row.status !== "pending") throw new Error(`Cannot approve: status is ${row.status}`)

    await ctx.db.patch(args.requestId, {
      status: "approved",
      approverId: userId,
      approvedAt: Date.now(),
      notes: args.notes ?? row.notes,
      updatedAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pettyCash.request.approved",
      resourceType: "pettyCashRequests",
      resourceId: args.requestId,
    })
    return { success: true }
  },
})

export const rejectRequest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    requestId: v.id("pettyCashRequests"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "pettyCash.reject")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.requestId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Request not found")
    if (row.status !== "pending") throw new Error(`Cannot reject: status is ${row.status}`)

    await ctx.db.patch(args.requestId, {
      status: "rejected",
      approverId: userId,
      rejectedReason: args.reason,
      updatedAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pettyCash.request.rejected",
      resourceType: "pettyCashRequests",
      resourceId: args.requestId,
      metadata: { reason: args.reason },
    })
    return { success: true }
  },
})

export const disburseRequest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    requestId: v.id("pettyCashRequests"),
    method: v.union(v.literal("cash"), v.literal("transfer"), v.literal("card")),
    amount: v.optional(v.number()),
    receiptUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "pettyCash.disburse")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.requestId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Request not found")
    if (row.status !== "approved") throw new Error(`Cannot disburse: status is ${row.status}`)

    const amount = args.amount ?? row.amount
    const disbursementId = await ctx.db.insert("pettyCashDisbursements", {
      workspaceId: args.workspaceId,
      requestId: args.requestId,
      amount,
      currency: row.currency,
      method: args.method,
      disbursedBy: userId,
      disbursedAt: Date.now(),
      receiptUrl: args.receiptUrl,
    })
    await ctx.db.patch(args.requestId, {
      status: "disbursed",
      disbursementId,
      updatedAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pettyCash.request.disbursed",
      resourceType: "pettyCashDisbursements",
      resourceId: disbursementId,
      metadata: { method: args.method, amount },
    })
    return { disbursementId, success: true }
  },
})

export const closeRequest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    requestId: v.id("pettyCashRequests"),
    actualAmount: v.number(),
    closingNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "pettyCash.close")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.requestId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Request not found")
    if (row.status !== "disbursed" || !row.disbursementId)
      throw new Error(`Cannot close: status is ${row.status}`)

    const disbursement = await ctx.db.get(row.disbursementId)
    if (!disbursement) throw new Error("Disbursement not found")
    const variance = args.actualAmount - disbursement.amount
    const now = Date.now()
    await ctx.db.patch(row.disbursementId, {
      actualAmount: args.actualAmount,
      variance,
      closingNotes: args.closingNotes,
      closedAt: now,
      closedBy: userId,
    })
    await ctx.db.patch(args.requestId, {
      status: "closed",
      closedAt: now,
      closedBy: userId,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pettyCash.request.closed",
      resourceType: "pettyCashRequests",
      resourceId: args.requestId,
      metadata: { variance, actualAmount: args.actualAmount },
    })
    return { success: true, variance }
  },
})

export const cancelRequest = mutation({
  args: { workspaceId: v.id("workspaces"), requestId: v.id("pettyCashRequests") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "pettyCash.cancel")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.requestId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Request not found")
    if (row.requesterId !== userId) throw new Error("Only requester can cancel")
    if (row.status !== "pending") throw new Error(`Cannot cancel: status is ${row.status}`)

    await ctx.db.patch(args.requestId, { status: "cancelled", updatedAt: Date.now() })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pettyCash.request.cancelled",
      resourceType: "pettyCashRequests",
      resourceId: args.requestId,
    })
    return { success: true }
  },
})

export const deleteRequest = mutation({
  args: { workspaceId: v.id("workspaces"), requestId: v.id("pettyCashRequests") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "pettyCash.close")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.requestId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Request not found")
    if (row.status === "closed" || row.status === "disbursed") {
      throw new Error("Cannot delete after disburse — cancel first or wait for close")
    }

    const disbursements = await ctx.db
      .query("pettyCashDisbursements")
      .withIndex("by_request", (q) => q.eq("requestId", args.requestId))
      .take(50)
    for (const d of disbursements) await ctx.db.delete(d._id)

    await ctx.db.delete(args.requestId)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "pettyCash.request.deleted",
      resourceType: "pettyCashRequests",
      resourceId: args.requestId,
    })
    return { success: true }
  },
})
