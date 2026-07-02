import { defineTable } from "convex/server"
import { v } from "convex/values"

export const assetManagementTables = {
  managedAssets: defineTable({
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    name: v.string(),
    category: v.string(), // kitchen|laundry-machine|hvac|furniture|computer|etc
    serialNumber: v.optional(v.string()),
    purchaseDate: v.optional(v.string()), // YYYY-MM-DD
    purchasePrice: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    depreciationMethod: v.optional(
      v.union(v.literal("straight-line"), v.literal("declining-balance"), v.literal("none")),
    ),
    usefulLifeYears: v.optional(v.number()),
    status: v.union(
      v.literal("active"),
      v.literal("maintenance"),
      v.literal("retired"),
      v.literal("lost"),
    ),
    location: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_workspace_category", ["workspaceId", "category"])
    .index("by_assigned", ["assignedTo"]),

  assetTransactions: defineTable({
    workspaceId: v.id("workspaces"),
    assetId: v.id("managedAssets"),
    type: v.union(
      v.literal("purchase"),
      v.literal("transfer"),
      v.literal("maintenance"),
      v.literal("depreciation"),
      v.literal("retirement"),
      v.literal("revaluation"),
    ),
    amount: v.optional(v.number()),
    date: v.string(),
    notes: v.optional(v.string()),
    performedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_asset", ["assetId"]),
}

export default assetManagementTables
