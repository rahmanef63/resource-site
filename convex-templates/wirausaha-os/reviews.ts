import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("wirausahaReviews").order("desc").take(500),
});
export const listAll = list;

export const upsert = mutation({
  args: {
    id: v.optional(v.id("wirausahaReviews")),
    author: v.string(),
    city: v.string(),
    category: v.string(),
    storeId: v.optional(v.string()),
    rating: v.number(),
    body: v.string(),
    emoji: v.string(),
    publishedAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("wirausahaReviews", data);
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaReviews") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
