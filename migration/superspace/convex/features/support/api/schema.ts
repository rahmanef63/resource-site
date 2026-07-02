import { defineTable } from "convex/server";
import { v } from "convex/values";

export const supportTickets = defineTable({
  workspaceId: v.id("workspaces"),
  ticketNumber: v.string(),
  title: v.string(),
  description: v.string(),
  status: v.union(
    v.literal("open"),
    v.literal("pending"),
    v.literal("resolved"),
    v.literal("closed"),
  ),
  priority: v.union(
    v.literal("low"),
    v.literal("medium"),
    v.literal("high"),
    v.literal("urgent"),
  ),
  customerId: v.id("users"),
  assignedTo: v.optional(v.id("users")),
  category: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  conversationId: v.id("conversations"),
  createdBy: v.id("users"),
  resolvedAt: v.optional(v.number()),
  closedAt: v.optional(v.number()),
  metadata: v.optional(
    v.object({
      customerInfo: v.optional(
        v.object({
          email: v.optional(v.string()),
          phone: v.optional(v.string()),
          company: v.optional(v.string()),
        }),
      ),
      internalNotes: v.optional(
        v.array(
          v.object({
            note: v.string(),
            authorId: v.id("users"),
            createdAt: v.number(),
          }),
        ),
      ),
    }),
  ),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_customer", ["customerId"])
  .index("by_assigned", ["assignedTo"])
  .index("by_status", ["status"])
  .index("by_conversation", ["conversationId"])
  .index("by_ticket_number", ["ticketNumber"])
  .searchIndex("search_tickets", {
    searchField: "title",
    filterFields: ["workspaceId", "status"],
  });

export const supportTables = {
  supportTickets,
};
