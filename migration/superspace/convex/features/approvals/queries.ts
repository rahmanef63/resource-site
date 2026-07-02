import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership, resolveCandidateUserIds } from "../../auth/helpers"
import type { Id } from "../../_generated/dataModel"

/**
 * Queries for approvals feature
 */

export const getData = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Get all approval requests (capped to prevent unbounded reads)
    const requests = await ctx.db
      .query("approvalRequests")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(500)

    const pendingCount = requests.filter(r => r.status === "pending").length
    const approvedCount = requests.filter(r => r.status === "approved").length
    const rejectedCount = requests.filter(r => r.status === "rejected").length

    // Format recent requests
    const recentRequests = requests.slice(0, 10).map(r => ({
      id: r._id,
      title: r.title || "Approval Request",
      requester: "User",
      department: "General",
      date: new Date(r._creationTime).toISOString().split("T")[0],
      type: r.type || "general",
      status: (r.status || "pending") as "pending" | "approved" | "rejected",
      priority: (r.priority || "medium") as "low" | "medium" | "high",
    }))

    const pendingRequests = requests
      .filter(r => r.status === "pending")
      .slice(0, 10)
      .map(r => ({
        id: r._id,
        title: r.title || "Approval Request",
        requester: "User",
        department: "General",
        date: new Date(r._creationTime).toISOString().split("T")[0],
        type: r.type || "general",
        status: "pending" as const,
        priority: (r.priority || "medium") as "low" | "medium" | "high",
      }))

    return {
      stats: {
        totalRequests: requests.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        avgTime: "2 days",
      },
      recentRequests,
      pendingRequests,
    }
  },
})

export const getPendingApprovals = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) return []

    const userId = candidateIds[0] as Id<"users">

    // Get approvals where current user is an approver (capped to prevent unbounded reads)
    const approvals = await ctx.db
      .query("approvalRequests")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .take(200)

    // Filter to only those where user is an approver
    return approvals.filter((a) => a.approvers?.includes(userId))
  },
})

export const getMyRequests = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) return []

    const userId = candidateIds[0] as Id<"users">

    const requests = await ctx.db
      .query("approvalRequests")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("requesterId"), userId))
      .take(200)

    return requests
  },
})

export const getRequestById = query({
  args: {
    workspaceId: v.id("workspaces"),
    requestId: v.id("approvalRequests"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const request = await ctx.db.get(args.requestId)
    if (!request || request.workspaceId !== args.workspaceId) {
      return null
    }

    return request
  },
})
