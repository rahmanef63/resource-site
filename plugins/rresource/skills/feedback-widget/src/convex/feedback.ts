// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Schema fragment:
//
// feedback: defineTable({
//   userId: v.optional(v.id("users")),
//   text: v.string(),
//   createdAt: v.number(),
//   resolved: v.boolean(),
// }).index("by_resolved_createdAt", ["resolved", "createdAt"]),

export const submit = mutation({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    if (text.trim().length < 3) throw new Error("Feedback terlalu pendek");
    const id = await ctx.auth.getUserIdentity();
    let userId: any = undefined;
    if (id) {
      const u = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", id.tokenIdentifier)).unique();
      userId = u?._id;
    }
    await ctx.db.insert("feedback", { userId, text, createdAt: Date.now(), resolved: false });
  },
});

export const listInbox = query({
  args: { resolved: v.boolean() },
  handler: async (ctx, { resolved }) => {
    return await ctx.db.query("feedback").withIndex("by_resolved_createdAt", (q) => q.eq("resolved", resolved)).order("desc").take(100);
  },
});
