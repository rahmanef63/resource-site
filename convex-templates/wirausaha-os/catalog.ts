import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("wirausahaCatalog").take(500),
});
export const listAll = list;

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) =>
    ctx.db.query("wirausahaCatalog").withIndex("by_slug", (q) => q.eq("slug", slug)).first(),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("wirausahaCatalog")),
    productId: v.optional(v.string()),
    slug: v.string(),
    name: v.string(),
    category: v.string(),
    priceLabel: v.string(),
    blurb: v.string(),
    badge: v.optional(v.string()),
    emoji: v.string(),
    gradient: v.string(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("wirausahaCatalog", data);
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaCatalog") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
