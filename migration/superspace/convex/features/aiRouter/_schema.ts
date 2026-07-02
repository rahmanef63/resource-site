import { defineTable } from "convex/server";
import { v } from "convex/values";

// Export renamed `aiTables` -> `aiRouterTables`: the first-party AI engine
// (convex/features/ai/api/schema.ts, barreled from convex/platform/ai/schema)
// already exports `aiTables`, and convex/features/_schema.ts imports that one.
// The `aiUsage` table name itself is unique (platform ai uses `aiUsageStats`),
// so only the export identifier had to change to compose both without clash.
export const aiRouterTables = {
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
