import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("wirausahaJournal").order("desc").take(200),
});
export const listAll = list;

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) =>
    ctx.db.query("wirausahaJournal").withIndex("by_slug", (q) => q.eq("slug", slug)).first(),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("wirausahaJournal")),
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    category: v.string(),
    author: v.string(),
    publishedAt: v.number(),
    emoji: v.string(),
    gradient: v.string(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("wirausahaJournal", data);
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaJournal") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
