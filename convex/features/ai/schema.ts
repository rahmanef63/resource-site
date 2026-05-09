import { defineTable } from "convex/server";
import { v } from "convex/values";

export const aiTables = {
  aiUsage: defineTable({
    userId: v.optional(v.id("users")),
    feature: v.string(),
    tier: v.union(v.literal("nano"), v.literal("mid"), v.literal("flagship")),
    inputTokens: v.number(),
    outputTokens: v.number(),
    costUsd: v.optional(v.number()),
    at: v.number(),
  })
    .index("by_user_at", ["userId", "at"])
    .index("by_feature_at", ["feature", "at"]),
};
