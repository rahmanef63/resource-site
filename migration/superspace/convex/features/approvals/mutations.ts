import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import type { Id } from "../../_generated/dataModel"
import { logAuditEvent } from "../../shared/audit"

/**
 * Mutations for approvals feature
 */

export const createRequest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("expense"),
      v.literal("leave"),
      v.literal("document"),
      v.literal("purchase"),
      v.literal("custom")
    )),
    approvers: v.array(v.id("users")),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    )),
    dueDate: v.optional(v.number()),
    data: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.APPROVALS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const id = await ctx.db.insert("approvalRequests", {
      workspaceId: args.workspaceId,
      title: args.title,
      description: args.description,
      type: args.type ?? "custom",
      status: "pending",
      priority: args.priority ?? "normal",
      requesterId: userId,
      approvers: args.approvers,
      approvalHistory: [],
      data: args.data,
      dueDate: args.dueDate,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "approvals.request.created",
      resourceType: "approvalRequest",
      resourceId: String(id),
      metadata: { title: args.title, type: args.type ?? "custom", priority: args.priority ?? "normal", approverCount: args.approvers.length },
    })

    return { id, success: true }
  },
})

export const approveRequest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    requestId: v.id("approvalRequests"),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.APPROVALS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const request = await ctx.db.get(args.requestId)
    if (!request || request.workspaceId !== args.workspaceId) {
      throw new Error("Request not found")
    }

    if (!request.approvers?.includes(userId)) {
      throw new Error("Not authorized to approve this request")
    }

    const history = request.approvalHistory || []
    history.push({
      userId,
      action: "approved",
      comment: args.comment,
      timestamp: Date.now(),
    })

    await ctx.db.patch(args.requestId, {
      status: "approved",
      approvalHistory: history,
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "approvals.request.approved",
      resourceType: "approvalRequest",
      resourceId: String(args.requestId),
      metadata: { title: request.title, comment: args.comment },
    })

    return { success: true }
  },
})

export const updateRequest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    requestId: v.id("approvalRequests"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("normal"),
        v.literal("high"),
        v.literal("urgent"),
      ),
    ),
    dueDate: v.optional(v.number()),
    data: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.APPROVALS_VIEW)
    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")
    const userId = candidateIds[0] as Id<"users">

    const request = await ctx.db.get(args.requestId)
    if (!request || request.workspaceId !== args.workspaceId) {
      throw new Error("Request not found")
    }
    if (request.requesterId !== userId) {
      throw new Error("Only the submitter can edit this request")
    }
    if (request.status !== "pending") {
      throw new Error(`Cannot edit: request status is ${request.status}`)
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() }
    if (args.title !== undefined) patch.title = args.title
    if (args.description !== undefined) patch.description = args.description
    if (args.priority !== undefined) patch.priority = args.priority
    if (args.dueDate !== undefined) patch.dueDate = args.dueDate
    if (args.data !== undefined) patch.data = args.data
    await ctx.db.patch(args.requestId, patch as any)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "approvals.request.updated",
      resourceType: "approvalRequest",
      resourceId: String(args.requestId),
      changes: patch,
    })
    return { success: true }
  },
})

export const deleteRequest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    requestId: v.id("approvalRequests"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.APPROVALS_VIEW)
    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")
    const userId = candidateIds[0] as Id<"users">

    const request = await ctx.db.get(args.requestId)
    if (!request || request.workspaceId !== args.workspaceId) {
      throw new Error("Request not found")
    }
    if (request.requesterId !== userId) {
      throw new Error("Only the submitter can delete this request")
    }

    await ctx.db.delete(args.requestId)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "approvals.request.deleted",
      resourceType: "approvalRequest",
      resourceId: String(args.requestId),
      metadata: { title: request.title, status: request.status, type: request.type },
    })
    return { success: true }
  },
})

export const rejectRequest = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    requestId: v.id("approvalRequests"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.APPROVALS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const request = await ctx.db.get(args.requestId)
    if (!request || request.workspaceId !== args.workspaceId) {
      throw new Error("Request not found")
    }

    if (!request.approvers?.includes(userId)) {
      throw new Error("Not authorized to reject this request")
    }

    const history = request.approvalHistory || []
    history.push({
      userId,
      action: "rejected",
      comment: args.reason,
      timestamp: Date.now(),
    })

    await ctx.db.patch(args.requestId, {
      status: "rejected",
      approvalHistory: history,
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "approvals.request.rejected",
      resourceType: "approvalRequest",
      resourceId: String(args.requestId),
      metadata: { title: request.title, reason: args.reason },
    })

    return { success: true }
  },
})
