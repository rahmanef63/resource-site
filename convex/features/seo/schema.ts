import { defineTable } from "convex/server";
import { v } from "convex/values";

// Cost guard for AI-driven SEO metadata generation.
// Mirror the classroom refiner pattern — each call logs user + tokens.
// Action consults this within a 24h window before hitting Anthropic.
export const tables = {
  seoGeneratorCalls: defineTable({
    userEmail: v.string(),
    table: v.string(),
    rowId: v.string(),
    titleLen: v.number(),
    contentLen: v.number(),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
    calledAt: v.number(),
  }).index("by_user_time", ["userEmail", "calledAt"]),
};
