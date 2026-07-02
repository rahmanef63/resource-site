import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Sales Queries
 * Read operations with workspace isolation and RBAC
 */

export const getQuotes = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return ctx.db
      .query("quotes")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(args.limit ?? 50)
  },
})

export const getQuote = query({
  args: { quoteId: v.id("quotes") },
  handler: async (ctx, args) => {
    const quote = await ctx.db.get(args.quoteId)
    if (!quote) return null
    await requireActiveMembership(ctx, quote.workspaceId)
    return quote
  },
})

export const getInvoices = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return ctx.db
      .query("invoices")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(args.limit ?? 50)
  },
})

export const getInvoice = query({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.invoiceId)
    if (!invoice) return null
    await requireActiveMembership(ctx, invoice.workspaceId)
    return invoice
  },
})

export const getPayments = query({
  args: { workspaceId: v.id("workspaces"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return ctx.db
      .query("payments")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(args.limit ?? 50)
  },
})

export const getSalesOrders = query({
  args: { workspaceId: v.id("workspaces"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return ctx.db
      .query("salesOrders")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(args.limit ?? 50)
  },
})

export const getCreditNotes = query({
  args: { workspaceId: v.id("workspaces"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return ctx.db
      .query("creditNotes")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(args.limit ?? 50)
  },
})

export const getRecurringInvoices = query({
  args: { workspaceId: v.id("workspaces"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return ctx.db
      .query("recurringInvoices")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(args.limit ?? 50)
  },
})
