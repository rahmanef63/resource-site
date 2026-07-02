import { defineTable } from "convex/server"
import { v } from "convex/values"

export const ownerTransfersTables = {
  ownerTransfers: defineTable({
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    type: v.union(
      v.literal("withdraw"),
      v.literal("inject"),
      v.literal("loan"),
      v.literal("repayment"),
    ),
    amount: v.number(),
    currency: v.string(),
    fromAccount: v.optional(v.string()),
    toAccount: v.optional(v.string()),
    ownerUserId: v.id("users"),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    transferDate: v.string(), // YYYY-MM-DD
    category: v.optional(v.string()),
    notes: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("reconciled"),
    ),
    reconciledAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_date", ["workspaceId", "transferDate"])
    .index("by_workspace_type", ["workspaceId", "type"])
    .index("by_owner", ["ownerUserId"]),
}

export default ownerTransfersTables
