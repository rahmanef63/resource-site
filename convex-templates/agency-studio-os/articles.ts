import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const CATEGORY = v.union(
  v.literal("case-study"),
  v.literal("essay"),
  v.literal("field-notes"),
);

export const list = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("agencyArticles").withIndex("by_publishedAt").order("desc").take(200),
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) =>
    ctx.db.query("agencyArticles").withIndex("by_slug", (q) => q.eq("slug", slug)).first(),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("agencyArticles")),
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    category: CATEGORY,
    author: v.string(),
    readMinutes: v.number(),
    publishedAt: v.number(),
    cover: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    heroEmoji: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("agencyArticles", data);
  },
});

export const remove = mutation({
  args: { id: v.id("agencyArticles") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
