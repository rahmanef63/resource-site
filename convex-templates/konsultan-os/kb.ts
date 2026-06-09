import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const CATEGORY = v.union(
  v.literal("Strategi"),
  v.literal("Operasi"),
  v.literal("Organisasi"),
  v.literal("M&A"),
  v.literal("Workshop"),
  v.literal("Template"),
);
const STATUS = v.union(v.literal("draft"), v.literal("published"), v.literal("archived"));

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("konsultanKbArticles").take(500),
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) =>
    ctx.db.query("konsultanKbArticles").withIndex("by_slug", (q) => q.eq("slug", slug)).first(),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("konsultanKbArticles")),
    slug: v.string(),
    title: v.string(),
    category: CATEGORY,
    summary: v.string(),
    body: v.string(),
    author: v.string(),
    updatedAt: v.number(),
    status: STATUS,
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("konsultanKbArticles", data);
  },
});

export const remove = mutation({
  args: { id: v.id("konsultanKbArticles") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
