// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Schema fragment to add to consumer's convex/schema.ts:
//
// markdownDocs: defineTable({
//   userId: v.id("users"),
//   key: v.string(),
//   value: v.string(),
// }).index("by_user_key", ["userId", "key"]),

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const id = await ctx.auth.getUserIdentity();
    if (!id) return null;
    const u = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", id.tokenIdentifier)).unique();
    if (!u) return null;
    const doc = await ctx.db.query("markdownDocs")
      .withIndex("by_user_key", (q) => q.eq("userId", u._id).eq("key", key)).unique();
    return doc?.value ?? null;
  },
});

export const save = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, { key, value }) => {
    const id = await ctx.auth.getUserIdentity();
    if (!id) throw new Error("Tidak terautentikasi");
    const u = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", id.tokenIdentifier)).unique();
    if (!u) throw new Error("User tidak ditemukan");
    const existing = await ctx.db.query("markdownDocs")
      .withIndex("by_user_key", (q) => q.eq("userId", u._id).eq("key", key)).unique();
    if (existing) await ctx.db.patch(existing._id, { value });
    else await ctx.db.insert("markdownDocs", { userId: u._id, key, value });
  },
});
