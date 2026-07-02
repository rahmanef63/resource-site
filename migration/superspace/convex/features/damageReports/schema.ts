import { defineTable } from "convex/server"
import { v } from "convex/values"

export const damageReportsTables = {
  damageReports: defineTable({
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    category: v.string(), // equipment|inventory|facility|customer-item|room-fixture|amenity|structure
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    title: v.string(),
    description: v.string(),
    photos: v.optional(v.array(v.string())),
    location: v.optional(v.string()), // room number, station, etc.
    relatedEntityType: v.optional(v.string()), // asset|guest|order|null
    relatedEntityId: v.optional(v.string()),
    reporterId: v.id("users"),
    assignedTo: v.optional(v.id("users")),
    status: v.union(
      v.literal("reported"),
      v.literal("triaged"),
      v.literal("investigating"),
      v.literal("resolved"),
      v.literal("written-off"),
    ),
    resolution: v.optional(
      v.union(v.literal("repaired"), v.literal("replaced"), v.literal("written-off"), v.literal("ignored")),
    ),
    resolvedBy: v.optional(v.id("users")),
    resolvedAt: v.optional(v.number()),
    costEstimate: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    insuranceClaimRef: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_workspace_severity", ["workspaceId", "severity"])
    .index("by_assigned", ["assignedTo"]),
}

export default damageReportsTables
