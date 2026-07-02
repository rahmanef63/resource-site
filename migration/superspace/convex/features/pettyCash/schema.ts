import { defineTable } from "convex/server"
import { v } from "convex/values"

export const pettyCashTables = {
  pettyCashRequests: defineTable({
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    requesterId: v.id("users"),
    amount: v.number(),
    currency: v.string(),
    purpose: v.string(),
    category: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("disbursed"),
      v.literal("closed"),
      v.literal("cancelled"),
    ),
    approverId: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    rejectedReason: v.optional(v.string()),
    disbursementId: v.optional(v.id("pettyCashDisbursements")),
    closedAt: v.optional(v.number()),
    closedBy: v.optional(v.id("users")),
    attachments: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_requester", ["requesterId"]),

  pettyCashDisbursements: defineTable({
    workspaceId: v.id("workspaces"),
    requestId: v.id("pettyCashRequests"),
    amount: v.number(),
    currency: v.string(),
    method: v.union(v.literal("cash"), v.literal("transfer"), v.literal("card")),
    disbursedBy: v.id("users"),
    disbursedAt: v.number(),
    receiptUrl: v.optional(v.string()),
    actualAmount: v.optional(v.number()),
    variance: v.optional(v.number()),
    closingNotes: v.optional(v.string()),
    closedAt: v.optional(v.number()),
    closedBy: v.optional(v.id("users")),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_request", ["requestId"]),
}

export default pettyCashTables
