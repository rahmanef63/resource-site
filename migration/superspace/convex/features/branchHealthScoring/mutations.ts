import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership, requirePermission } from "../../auth/helpers"
import { logAuditEvent } from "../../shared/audit"

export const captureSnapshot = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    branchId: v.string(),
    period: v.string(),
    revenueScore: v.number(),
    expenseScore: v.number(),
    opsScore: v.number(),
    staffScore: v.number(),
    customerScore: v.number(),
    weights: v.object({
      revenue: v.number(),
      expense: v.number(),
      ops: v.number(),
      staff: v.number(),
      customer: v.number(),
    }),
    insights: v.optional(v.string()),
    insightsModel: v.optional(v.string()),
    metricsSnapshot: v.optional(
      v.object({
        revenue: v.optional(v.number()),
        grossMargin: v.optional(v.number()),
        attendanceRate: v.optional(v.number()),
        complaintCount: v.optional(v.number()),
        damageCount: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "branchhealth.capture_snapshot")
    const userId = await ensureUser(ctx)
    const totalWeight =
      args.weights.revenue +
      args.weights.expense +
      args.weights.ops +
      args.weights.staff +
      args.weights.customer
    if (totalWeight <= 0) throw new Error("Weights must sum > 0")
    const compositeScore =
      (args.revenueScore * args.weights.revenue +
        args.expenseScore * args.weights.expense +
        args.opsScore * args.weights.ops +
        args.staffScore * args.weights.staff +
        args.customerScore * args.weights.customer) /
      totalWeight

    const id = await ctx.db.insert("branchHealthSnapshots", {
      workspaceId: args.workspaceId,
      branchId: args.branchId,
      capturedAt: Date.now(),
      period: args.period,
      revenueScore: args.revenueScore,
      expenseScore: args.expenseScore,
      opsScore: args.opsScore,
      staffScore: args.staffScore,
      customerScore: args.customerScore,
      compositeScore,
      insights: args.insights,
      insightsModel: args.insightsModel,
      weights: args.weights,
      metricsSnapshot: args.metricsSnapshot,
      createdAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "branchHealth.snapshot_captured",
      resourceType: "branchHealthSnapshots",
      resourceId: id,
      metadata: { branchId: args.branchId, compositeScore },
    })
    return { id, success: true, compositeScore }
  },
})
