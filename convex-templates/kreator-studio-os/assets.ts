import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const KIND = v.union(
  v.literal("photo"),
  v.literal("video"),
  v.literal("audio"),
  v.literal("graphic"),
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("kreatorAssets").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("kreatorAssets")),
    title: v.string(),
    kind: KIND,
    url: v.string(),
    fileLabel: v.string(),
    uploadedAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("kreatorAssets", data);
  },
});

export const remove = mutation({
  args: { id: v.id("kreatorAssets") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
