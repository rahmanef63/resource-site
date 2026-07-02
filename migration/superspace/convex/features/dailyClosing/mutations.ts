import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership, requirePermission } from "../../auth/helpers"
import { logAuditEvent } from "../../shared/audit"

export const openDay = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    businessDate: v.string(),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "closing.open_day")
    const userId = await ensureUser(ctx)
    const existing = await ctx.db
      .query("dailyClosings")
      .withIndex("by_workspace_date", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("businessDate", args.businessDate),
      )
      .filter((q) =>
        args.branchId ? q.eq(q.field("branchId"), args.branchId) : q.eq(q.field("branchId"), undefined),
      )
      .first()
    if (existing) throw new Error(`Day already open for ${args.businessDate}`)

    const now = Date.now()
    const id = await ctx.db.insert("dailyClosings", {
      workspaceId: args.workspaceId,
      branchId: args.branchId,
      businessDate: args.businessDate,
      openedAt: now,
      openedBy: userId,
      status: "open",
      createdAt: now,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "dailyClosing.opened",
      resourceType: "dailyClosings",
      resourceId: id,
    })
    return { id, success: true }
  },
})

export const recordSales = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    closingId: v.id("dailyClosings"),
    cashSales: v.optional(v.number()),
    cardSales: v.optional(v.number()),
    qrisSales: v.optional(v.number()),
    otherSales: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "closing.record_sales")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.closingId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Closing not found")
    if (row.status !== "open" && row.status !== "recorded")
      throw new Error(`Cannot record: status is ${row.status}`)

    const cash = args.cashSales ?? row.cashSales ?? 0
    const card = args.cardSales ?? row.cardSales ?? 0
    const qris = args.qrisSales ?? row.qrisSales ?? 0
    const other = args.otherSales ?? row.otherSales ?? 0
    await ctx.db.patch(args.closingId, {
      cashSales: cash,
      cardSales: card,
      qrisSales: qris,
      otherSales: other,
      totalSales: cash + card + qris + other,
      expectedCash: cash,
      status: "recorded",
      updatedAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "dailyClosing.sales_recorded",
      resourceType: "dailyClosings",
      resourceId: args.closingId,
    })
    return { success: true }
  },
})

export const closeDay = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    closingId: v.id("dailyClosings"),
    actualCash: v.number(),
    closingNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "closing.close_day")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.closingId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Closing not found")
    if (row.status !== "recorded") throw new Error(`Cannot close: status is ${row.status}`)

    const expected = row.expectedCash ?? 0
    const difference = args.actualCash - expected
    const now = Date.now()
    await ctx.db.patch(args.closingId, {
      actualCash: args.actualCash,
      difference,
      closingNotes: args.closingNotes,
      closedAt: now,
      closedBy: userId,
      status: "closed",
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "dailyClosing.closed",
      resourceType: "dailyClosings",
      resourceId: args.closingId,
      metadata: { difference },
    })
    return { success: true, difference }
  },
})

export const approveClosing = mutation({
  args: { workspaceId: v.id("workspaces"), closingId: v.id("dailyClosings") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "closing.approve")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.closingId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Closing not found")
    if (row.status !== "closed") throw new Error(`Cannot approve: status is ${row.status}`)

    await ctx.db.patch(args.closingId, {
      approvedAt: Date.now(),
      approvedBy: userId,
      status: "approved",
      updatedAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "dailyClosing.approved",
      resourceType: "dailyClosings",
      resourceId: args.closingId,
    })
    return { success: true }
  },
})

export const upsertItem = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    closingId: v.id("dailyClosings"),
    paymentMethod: v.string(),
    expectedAmount: v.number(),
    actualAmount: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "closing.upsert_item")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.closingId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Closing not found")
    if (row.status === "approved") throw new Error("Cannot edit items on an approved closing")

    const existing = await ctx.db
      .query("dailyClosingItems")
      .withIndex("by_closing", (q) => q.eq("closingId", args.closingId))
      .filter((q) => q.eq(q.field("paymentMethod"), args.paymentMethod))
      .first()

    const variance = args.actualAmount - args.expectedAmount
    if (existing) {
      await ctx.db.patch(existing._id, {
        expectedAmount: args.expectedAmount,
        actualAmount: args.actualAmount,
        variance,
        notes: args.notes,
      })
    } else {
      await ctx.db.insert("dailyClosingItems", {
        workspaceId: args.workspaceId,
        closingId: args.closingId,
        paymentMethod: args.paymentMethod,
        expectedAmount: args.expectedAmount,
        actualAmount: args.actualAmount,
        variance,
        notes: args.notes,
      })
    }
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "dailyClosing.item_upserted",
      resourceType: "dailyClosingItems",
      resourceId: args.closingId,
      metadata: { paymentMethod: args.paymentMethod, variance },
    })
    return { success: true, variance }
  },
})

export const deleteClosing = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    closingId: v.id("dailyClosings"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "closing.close_day")
    const userId = await ensureUser(ctx)

    const closing = await ctx.db.get(args.closingId)
    if (!closing || closing.workspaceId !== args.workspaceId) throw new Error("Closing not found")
    if (closing.status === "approved") throw new Error("Cannot delete approved closing")

    const items = await ctx.db
      .query("dailyClosingItems")
      .withIndex("by_closing", (q) => q.eq("closingId", args.closingId))
      .take(500)
    for (const item of items) await ctx.db.delete(item._id)

    await ctx.db.delete(args.closingId)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "dailyClosing.deleted",
      resourceType: "dailyClosings",
      resourceId: args.closingId,
    })
    return { success: true }
  },
})
