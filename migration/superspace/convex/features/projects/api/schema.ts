import { defineTable } from "convex/server";
import { v } from "convex/values";

export const projects = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  status: v.union(
    v.literal("planning"),
    v.literal("active"),
    v.literal("on_hold"),
    v.literal("completed"),
    v.literal("archived"),
  ),
  priority: v.optional(
    v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  ),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  conversationId: v.optional(v.id("conversations")),
  createdBy: v.id("users"),
  ownerId: v.id("users"),
  metadata: v.optional(
    v.object({
      color: v.optional(v.string()),
      icon: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      milestones: v.optional(
        v.array(
          v.object({
            name: v.string(),
            dueDate: v.number(),
            completed: v.boolean(),
          }),
        ),
      ),
    }),
  ),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_owner", ["ownerId"])
  .index("by_status", ["status"])
  .index("by_workspace_status", ["workspaceId", "status"])
  .index("by_conversation", ["conversationId"])
  .searchIndex("search_projects", {
    searchField: "name",
    filterFields: ["workspaceId"],
  });

export const projectMembers = defineTable({
  projectId: v.id("projects"),
  userId: v.id("users"),
  role: v.union(
    v.literal("owner"),
    v.literal("admin"),
    v.literal("member"),
    v.literal("viewer"),
  ),
  joinedAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_user", ["userId"])
  .index("by_project_user", ["projectId", "userId"]);

export const projectTables = {
  projects,
  projectMembers,
};
