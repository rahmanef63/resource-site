import { defineTable } from "convex/server"
import { v } from "convex/values"

export const tasksTables = {
  tasks: defineTable({
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed"),
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
    ),
    dueDate: v.optional(v.number()),
    assigneeId: v.optional(v.id("users")),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_workspace_assignee", ["workspaceId", "assigneeId"])
    .searchIndex("search_tasks", {
      searchField: "title",
      filterFields: ["workspaceId"],
    }),
}
