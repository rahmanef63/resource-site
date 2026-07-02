import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"
import { assertDocWorkspace } from "../lib/rbac"

const JOURNAL_LIST_LIMIT = 200

/**
 * Queries for accounting feature
 */

export const getData = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Return default accounting data structure
    // In a real implementation, this would query actual accounting tables
    return {
      stats: {
        totalRevenue: 0,
        netProfit: 0,
        pendingInvoices: 0,
        expenses: 0,
        cashBalance: 0,
      },
      recentTransactions: [],
      recentInvoices: [],
    }
  },
})

export const listJournalEntries = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("posted"),
        v.literal("reversed"),
        v.literal("void"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const limit = Math.min(args.limit ?? JOURNAL_LIST_LIMIT, JOURNAL_LIST_LIMIT)
    const base = ctx.db
      .query("journalEntries")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
    const rows = args.status
      ? await base.filter((q) => q.eq(q.field("status"), args.status)).take(limit)
      : await base.take(limit)
    return rows
  },
})

export const getJournalEntry = query({
  args: { workspaceId: v.id("workspaces"), entryId: v.id("journalEntries") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const entry = await ctx.db.get(args.entryId)
    assertDocWorkspace(entry, args.workspaceId, "journalEntry")
    return entry
  },
})

export const listBills = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("pending"),
        v.literal("approved"),
        v.literal("paid"),
        v.literal("partial"),
        v.literal("overdue"),
        v.literal("void"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    const limit = Math.min(args.limit ?? JOURNAL_LIST_LIMIT, JOURNAL_LIST_LIMIT)
    const base = ctx.db
      .query("bills")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
    return args.status
      ? await base.filter((q) => q.eq(q.field("status"), args.status)).take(limit)
      : await base.take(limit)
  },
})
