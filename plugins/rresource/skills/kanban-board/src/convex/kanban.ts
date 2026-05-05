// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Schema fragment:
//
// kanbanCards: defineTable({
//   userId: v.id("users"),
//   boardId: v.string(),
//   title: v.string(),
//   column: v.string(),
//   order: v.number(),
// }).index("by_user_board", ["userId", "boardId"]),

export const list = query({
  args: { boardId: v.string() },
  handler: async (ctx, { boardId }) => {
    const id = await ctx.auth.getUserIdentity();
    if (!id) return [];
    const u = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", id.tokenIdentifier)).unique();
    if (!u) return [];
    return await ctx.db.query("kanbanCards").withIndex("by_user_board", (q) => q.eq("userId", u._id).eq("boardId", boardId)).take(500);
  },
});

export const move = mutation({
  args: { cardId: v.id("kanbanCards"), toColumn: v.string() },
  handler: async (ctx, { cardId, toColumn }) => {
    const id = await ctx.auth.getUserIdentity();
    if (!id) throw new Error("Tidak terautentikasi");
    const u = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", id.tokenIdentifier)).unique();
    if (!u) throw new Error("User tidak ditemukan");
    const card = await ctx.db.get(cardId);
    if (!card || card.userId !== u._id) throw new Error("Card tidak ditemukan");
    await ctx.db.patch(cardId, { column: toColumn });
  },
});

export const add = mutation({
  args: { boardId: v.string(), title: v.string(), column: v.string() },
  handler: async (ctx, args) => {
    const id = await ctx.auth.getUserIdentity();
    if (!id) throw new Error("Tidak terautentikasi");
    const u = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", id.tokenIdentifier)).unique();
    if (!u) throw new Error("User tidak ditemukan");
    await ctx.db.insert("kanbanCards", { userId: u._id, ...args, order: Date.now() });
  },
});
