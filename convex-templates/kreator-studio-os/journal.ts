import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const CATEGORY = v.union(
  v.literal("behind-the-scenes"),
  v.literal("lesson"),
  v.literal("experiment"),
  v.literal("essay"),
);

export const list = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("kreatorJournal").withIndex("by_publishedAt").order("desc").take(200),
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) =>
    ctx.db.query("kreatorJournal").withIndex("by_slug", (q) => q.eq("slug", slug)).first(),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("kreatorJournal")),
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    category: CATEGORY,
    readMinutes: v.number(),
    publishedAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("kreatorJournal", data);
  },
});

export const remove = mutation({
  args: { id: v.id("kreatorJournal") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
