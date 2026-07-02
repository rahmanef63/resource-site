import { defineTable } from "convex/server"
import { v } from "convex/values"

export const operationalChecklistTables = {
  checklistTemplates: defineTable({
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    scope: v.union(
      v.literal("opening"),
      v.literal("closing"),
      v.literal("shift-change"),
      v.literal("audit"),
      v.literal("custom"),
    ),
    items: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        order: v.number(),
        required: v.boolean(),
        photoRequired: v.optional(v.boolean()),
        notesRequired: v.optional(v.boolean()),
      }),
    ),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_scope", ["workspaceId", "scope"]),

  checklistRuns: defineTable({
    workspaceId: v.id("workspaces"),
    templateId: v.id("checklistTemplates"),
    branchId: v.optional(v.string()),
    runDate: v.string(), // YYYY-MM-DD
    assignedTo: v.optional(v.id("users")),
    completedItems: v.array(
      v.object({
        itemId: v.string(),
        completed: v.boolean(),
        completedAt: v.optional(v.number()),
        photoUrl: v.optional(v.string()),
        notes: v.optional(v.string()),
      }),
    ),
    overallStatus: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("review"),
      v.literal("approved"),
      v.literal("failed"),
    ),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    reviewNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_template", ["templateId"])
    .index("by_workspace_date", ["workspaceId", "runDate"])
    .index("by_assigned", ["assignedTo"]),
}

export default operationalChecklistTables
