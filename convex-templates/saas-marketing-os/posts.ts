import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STATUS = v.union(
  v.literal("draft"),
  v.literal("scheduled"),
  v.literal("published"),
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasPosts").order("desc").take(200),
});

export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasPosts").order("desc").take(200),
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) =>
    ctx.db.query("saasPosts").withIndex("by_slug", (q) => q.eq("slug", slug)).first(),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("saasPosts")),
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    author: v.string(),
    publishedAt: v.number(),
    tags: v.array(v.string()),
    cover: v.optional(v.string()),
    status: v.optional(STATUS),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("saasPosts", data);
  },
});

export const remove = mutation({
  args: { id: v.id("saasPosts") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
