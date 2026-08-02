// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Schema fragment:
//
// auditLogs: defineTable({
//   userId: v.optional(v.id("users")),
//   action: v.string(),
//   targetId: v.optional(v.string()),
//   meta: v.optional(v.any()),
//   createdAt: v.number(),
// }).index("by_action_createdAt", ["action", "createdAt"])
//   .index("by_user_createdAt", ["userId", "createdAt"]),

export const append = mutation({
  args: { action: v.string(), targetId: v.optional(v.string()), meta: v.optional(v.any()) },
  handler: async (ctx, args) => {
    const id = await ctx.auth.getUserIdentity();
    let userId: any = undefined;
    if (id) {
      const u = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", id.tokenIdentifier)).unique();
      userId = u?._id;
    }
    await ctx.db.insert("auditLogs", { ...args, userId, createdAt: Date.now() });
  },
});

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 100 }) => {
    return await ctx.db.query("auditLogs").withIndex("by_action_createdAt").order("desc").take(limit);
  },
});
