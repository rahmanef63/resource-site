import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership, requirePermission } from "../../auth/helpers"
import { logAuditEvent } from "../../shared/audit"

export const enrollMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    contactId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    memberNumber: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    tier: v.optional(v.string()),
    joinDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "loyalty.enroll")
    const userId = await ensureUser(ctx)
    const now = Date.now()
    const id = await ctx.db.insert("loyaltyMembers", {
      workspaceId: args.workspaceId,
      contactId: args.contactId,
      userId: args.userId,
      memberNumber: args.memberNumber,
      name: args.name,
      email: args.email,
      phone: args.phone,
      tier: args.tier ?? "bronze",
      pointsBalance: 0,
      totalEarned: 0,
      totalRedeemed: 0,
      joinDate: args.joinDate ?? new Date().toISOString().split("T")[0],
      createdAt: now,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "loyalty.enrolled",
      resourceType: "loyaltyMembers",
      resourceId: id,
    })
    return { id, success: true }
  },
})

export const earnPoints = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    memberId: v.id("loyaltyMembers"),
    points: v.number(),
    referenceAmount: v.optional(v.number()),
    reference: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "loyalty.earn")
    const userId = await ensureUser(ctx)
    if (args.points <= 0) throw new Error("Points must be > 0")
    const m = await ctx.db.get(args.memberId)
    if (!m || m.workspaceId !== args.workspaceId) throw new Error("Member not found")

    const now = Date.now()
    await ctx.db.insert("loyaltyTransactions", {
      workspaceId: args.workspaceId,
      memberId: args.memberId,
      type: "earn",
      points: args.points,
      referenceAmount: args.referenceAmount,
      reference: args.reference,
      note: args.note,
      performedBy: userId,
      transactionDate: new Date().toISOString().split("T")[0],
      createdAt: now,
    })
    await ctx.db.patch(args.memberId, {
      pointsBalance: m.pointsBalance + args.points,
      totalEarned: m.totalEarned + args.points,
      lastActivityAt: now,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "loyalty.earned",
      resourceType: "loyaltyMembers",
      resourceId: args.memberId,
      metadata: { points: args.points },
    })
    return { success: true }
  },
})

export const redeemPoints = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    memberId: v.id("loyaltyMembers"),
    points: v.number(),
    reference: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "loyalty.redeem")
    const userId = await ensureUser(ctx)
    if (args.points <= 0) throw new Error("Points must be > 0")
    const m = await ctx.db.get(args.memberId)
    if (!m || m.workspaceId !== args.workspaceId) throw new Error("Member not found")
    if (m.pointsBalance < args.points) throw new Error("Insufficient points balance")

    const now = Date.now()
    await ctx.db.insert("loyaltyTransactions", {
      workspaceId: args.workspaceId,
      memberId: args.memberId,
      type: "redeem",
      points: -args.points,
      reference: args.reference,
      note: args.note,
      performedBy: userId,
      transactionDate: new Date().toISOString().split("T")[0],
      createdAt: now,
    })
    await ctx.db.patch(args.memberId, {
      pointsBalance: m.pointsBalance - args.points,
      totalRedeemed: m.totalRedeemed + args.points,
      lastActivityAt: now,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "loyalty.redeemed",
      resourceType: "loyaltyMembers",
      resourceId: args.memberId,
      metadata: { points: args.points },
    })
    return { success: true }
  },
})

export const upsertTier = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    minPoints: v.number(),
    pointsMultiplier: v.number(),
    benefits: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "loyalty.upsert_tier")
    const userId = await ensureUser(ctx)

    const existing = await ctx.db
      .query("loyaltyTiers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        minPoints: args.minPoints,
        pointsMultiplier: args.pointsMultiplier,
        benefits: args.benefits,
        isActive: true,
      })
    } else {
      await ctx.db.insert("loyaltyTiers", {
        workspaceId: args.workspaceId,
        name: args.name,
        minPoints: args.minPoints,
        pointsMultiplier: args.pointsMultiplier,
        benefits: args.benefits,
        isActive: true,
      })
    }
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "loyalty.tier_upserted",
      resourceType: "loyaltyTiers",
      resourceId: args.name,
    })
    return { success: true }
  },
})
