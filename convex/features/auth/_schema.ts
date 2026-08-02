// Auth schema extension — extends @convex-dev/auth's built-in `authTables`
// with kitab-specific user metadata. Spread this AFTER `authTables` in the
// root schema so column augments take effect.

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const authTablesExt = {
  // Optional: per-user profile metadata that the kitab convention assumes.
  userProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    timezone: v.optional(v.string()),
    locale: v.optional(v.string()),
    role: v.optional(v.union(v.literal("owner"), v.literal("admin"), v.literal("member"))),
  }).index("by_user", ["userId"]),
};
