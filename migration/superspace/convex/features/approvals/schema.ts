/**
 * Approvals Feature Schema
 * Provides approval workflow functionality
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const approvalsTables = {
  // Approval requests
  approvalRequests: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("expense"),
      v.literal("leave"),
      v.literal("document"),
      v.literal("purchase"),
      v.literal("custom")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    requesterId: v.id("users"),
    approvers: v.array(v.id("users")),
    currentApprover: v.optional(v.id("users")),
    approvalHistory: v.array(v.object({
      userId: v.id("users"),
      action: v.string(),
      comment: v.optional(v.string()),
      timestamp: v.number(),
    })),
    data: v.optional(v.record(v.string(), v.any())),
    attachments: v.optional(v.array(v.string())),
    dueDate: v.optional(v.number()),
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_requester", ["requesterId"])
    .index("by_status", ["status"]),
};

export default approvalsTables;
