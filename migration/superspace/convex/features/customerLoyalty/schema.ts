import { defineTable } from "convex/server"
import { v } from "convex/values"

export const customerLoyaltyTables = {
  loyaltyMembers: defineTable({
    workspaceId: v.id("workspaces"),
    contactId: v.optional(v.string()), // soft link to contacts feature
    userId: v.optional(v.id("users")),
    memberNumber: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    tier: v.string(), // bronze|silver|gold|platinum (configurable)
    pointsBalance: v.number(),
    totalEarned: v.number(),
    totalRedeemed: v.number(),
    joinDate: v.string(), // YYYY-MM-DD
    lastActivityAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_member_number", ["workspaceId", "memberNumber"])
    .index("by_workspace_tier", ["workspaceId", "tier"]),

  loyaltyTransactions: defineTable({
    workspaceId: v.id("workspaces"),
    memberId: v.id("loyaltyMembers"),
    type: v.union(
      v.literal("earn"),
      v.literal("redeem"),
      v.literal("adjust"),
      v.literal("expire"),
    ),
    points: v.number(), // positive earn/adjust(+), negative redeem/expire/adjust(-)
    referenceAmount: v.optional(v.number()), // monetary amount tied to earn/redeem
    reference: v.optional(v.string()), // order/invoice id
    note: v.optional(v.string()),
    performedBy: v.id("users"),
    transactionDate: v.string(),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_member", ["memberId"]),

  loyaltyTiers: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    minPoints: v.number(),
    pointsMultiplier: v.number(), // 1.0 = base
    benefits: v.optional(v.array(v.string())),
    isActive: v.boolean(),
  }).index("by_workspace", ["workspaceId"]),
}

export default customerLoyaltyTables
