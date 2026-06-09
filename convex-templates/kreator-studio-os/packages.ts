import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("kreatorPackages").take(100),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("kreatorPackages")),
    name: v.string(),
    tagline: v.string(),
    price: v.string(),
    period: v.optional(v.string()),
    bullets: v.array(v.string()),
    turnaroundDays: v.number(),
    featured: v.optional(v.boolean()),
    badge: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("kreatorPackages", data);
  },
});

export const remove = mutation({
  args: { id: v.id("kreatorPackages") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
