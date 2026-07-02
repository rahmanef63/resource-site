import { defineTable } from "convex/server"
import { v } from "convex/values"

export const dailyClosingTables = {
  dailyClosings: defineTable({
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    businessDate: v.string(), // YYYY-MM-DD
    openedAt: v.number(),
    openedBy: v.id("users"),
    closedAt: v.optional(v.number()),
    closedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    approvedBy: v.optional(v.id("users")),
    expectedCash: v.optional(v.number()),
    actualCash: v.optional(v.number()),
    difference: v.optional(v.number()),
    cashSales: v.optional(v.number()),
    cardSales: v.optional(v.number()),
    qrisSales: v.optional(v.number()),
    otherSales: v.optional(v.number()),
    totalSales: v.optional(v.number()),
    status: v.union(
      v.literal("open"),
      v.literal("recorded"),
      v.literal("closed"),
      v.literal("approved"),
      v.literal("disputed"),
    ),
    closingNotes: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_date", ["workspaceId", "businessDate"])
    .index("by_workspace_status", ["workspaceId", "status"]),

  dailyClosingItems: defineTable({
    workspaceId: v.id("workspaces"),
    closingId: v.id("dailyClosings"),
    paymentMethod: v.string(), // cash|card|qris|voucher|city-ledger|etc
    expectedAmount: v.number(),
    actualAmount: v.number(),
    variance: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_closing", ["closingId"]),
}

export default dailyClosingTables
