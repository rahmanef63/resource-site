import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const KIND = v.union(
  v.literal("carousel"),
  v.literal("video"),
  v.literal("campaign"),
  v.literal("newsletter"),
);

export const list = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("kreatorShowcase").withIndex("by_publishedAt").order("desc").take(200),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("kreatorShowcase")),
    title: v.string(),
    kind: KIND,
    client: v.string(),
    blurb: v.string(),
    metric: v.string(),
    gradient: v.string(),
    emoji: v.string(),
    publishedAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("kreatorShowcase", data);
  },
});

export const remove = mutation({
  args: { id: v.id("kreatorShowcase") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
