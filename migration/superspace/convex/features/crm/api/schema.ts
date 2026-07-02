import { defineTable } from "convex/server";
import { v } from "convex/values";

export const crmCustomers = defineTable({
  workspaceId: v.id("workspaces"),
  userId: v.optional(v.id("users")),
  name: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  company: v.optional(v.string()),
  status: v.union(
    v.literal("lead"),
    v.literal("prospect"),
    v.literal("customer"),
    v.literal("inactive"),
  ),
  conversationId: v.optional(v.id("conversations")),
  assignedTo: v.optional(v.id("users")),
  tags: v.optional(v.array(v.string())),
  metadata: v.optional(
    v.object({
      source: v.optional(v.string()),
      industry: v.optional(v.string()),
      website: v.optional(v.string()),
      address: v.optional(v.string()),
      notes: v.optional(v.string()),
      customFields: v.optional(v.record(v.string(), v.any())),
    }),
  ),
  createdBy: v.id("users"),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_user", ["userId"])
  .index("by_assigned", ["assignedTo"])
  .index("by_status", ["status"])
  .index("by_conversation", ["conversationId"])
  .index("by_email", ["email"]);

export const crmTables = {
  crmCustomers,
};
