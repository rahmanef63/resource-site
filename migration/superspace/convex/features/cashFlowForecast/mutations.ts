import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requireActiveMembership, requirePermission } from "../../auth/helpers"
import { logAuditEvent } from "../../shared/audit"

export const createForecast = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    horizonDays: v.number(),
    startDate: v.string(),
    endDate: v.string(),
    baseCash: v.number(),
    generationSource: v.optional(
      v.union(v.literal("manual"), v.literal("recurring-derived"), v.literal("ai-assisted")),
    ),
    aiNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "cashflow.create_forecast")
    const userId = await ensureUser(ctx)
    if (args.horizonDays <= 0) throw new Error("horizonDays must be > 0")

    const now = Date.now()
    const id = await ctx.db.insert("cashFlowForecasts", {
      workspaceId: args.workspaceId,
      branchId: args.branchId,
      horizonDays: args.horizonDays,
      startDate: args.startDate,
      endDate: args.endDate,
      baseCash: args.baseCash,
      projectedInflow: 0,
      projectedOutflow: 0,
      projectedClosing: args.baseCash,
      status: "draft",
      generatedBy: userId,
      generationSource: args.generationSource ?? "manual",
      aiNotes: args.aiNotes,
      createdAt: now,
      updatedAt: now,
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cashFlowForecast.created",
      resourceType: "cashFlowForecasts",
      resourceId: id,
    })
    return { id, success: true }
  },
})

export const addLineItem = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    forecastId: v.id("cashFlowForecasts"),
    bucket: v.union(
      v.literal("recurring-revenue"),
      v.literal("one-off-revenue"),
      v.literal("expense-fixed"),
      v.literal("expense-variable"),
      v.literal("capex"),
    ),
    label: v.string(),
    amount: v.number(),
    probability: v.optional(v.number()),
    expectedDate: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "cashflow.add_item")
    const userId = await ensureUser(ctx)
    const forecast = await ctx.db.get(args.forecastId)
    if (!forecast || forecast.workspaceId !== args.workspaceId)
      throw new Error("Forecast not found")
    if (forecast.status !== "draft") throw new Error("Can only edit draft forecasts")

    const itemId = await ctx.db.insert("cashFlowLineItems", {
      workspaceId: args.workspaceId,
      forecastId: args.forecastId,
      bucket: args.bucket,
      label: args.label,
      amount: args.amount,
      probability: args.probability,
      expectedDate: args.expectedDate,
      note: args.note,
    })
    await recalc(ctx, args.forecastId, args.workspaceId)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cashFlowForecast.item_added",
      resourceType: "cashFlowLineItems",
      resourceId: itemId,
    })
    return { itemId, success: true }
  },
})

export const publishForecast = mutation({
  args: { workspaceId: v.id("workspaces"), forecastId: v.id("cashFlowForecasts") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    await requirePermission(ctx, args.workspaceId, "cashflow.publish")
    const userId = await ensureUser(ctx)
    const row = await ctx.db.get(args.forecastId)
    if (!row || row.workspaceId !== args.workspaceId) throw new Error("Forecast not found")
    if (row.status !== "draft") throw new Error(`Cannot publish: status is ${row.status}`)

    await ctx.db.patch(args.forecastId, {
      status: "published",
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    })
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "cashFlowForecast.published",
      resourceType: "cashFlowForecasts",
      resourceId: args.forecastId,
    })
    return { success: true }
  },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recalc(ctx: any, forecastId: any, workspaceId: any) {
  const items = await ctx.db
    .query("cashFlowLineItems")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_forecast", (q: any) => q.eq("forecastId", forecastId))
    .take(5000)
  // probability is stored as a fraction 0–1 per frontend Zod schema
  // (cash-flow-forecast/types/index.ts addLineItemSchema). Default to 1.0
  // (= 100% certain) when absent. Previously divided by 100, which caused
  // line items to contribute 1/100th of their intended probability weight.
  const inflow = items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((i: any) => i.bucket === "recurring-revenue" || i.bucket === "one-off-revenue")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .reduce((a: number, i: any) => a + i.amount * (i.probability ?? 1), 0)
  const outflow = items
    .filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (i: any) =>
        i.bucket === "expense-fixed" || i.bucket === "expense-variable" || i.bucket === "capex",
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .reduce((a: number, i: any) => a + i.amount * (i.probability ?? 1), 0)
  const forecast = await ctx.db.get(forecastId)
  if (!forecast || forecast.workspaceId !== workspaceId) return
  await ctx.db.patch(forecastId, {
    projectedInflow: inflow,
    projectedOutflow: outflow,
    projectedClosing: forecast.baseCash + inflow - outflow,
    updatedAt: Date.now(),
  })
}
