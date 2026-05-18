import { defineTable } from "convex/server";
import { v } from "convex/values";

export const newsletterTables = {
  newsletterSubscribers: defineTable({
    email: v.string(),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("unsubscribed")),
    confirmToken: v.optional(v.string()),
    subscribedAt: v.number(),
    confirmedAt: v.optional(v.number()),
    unsubscribedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status_subscribedAt", ["status", "subscribedAt"]),

  newsletterIssues: defineTable({
    subject: v.string(),
    body: v.string(),
    status: v.union(v.literal("draft"), v.literal("sending"), v.literal("sent")),
    createdAt: v.number(),
    sentAt: v.optional(v.number()),
    sentCount: v.optional(v.number()),
  }).index("by_status_createdAt", ["status", "createdAt"]),
};
