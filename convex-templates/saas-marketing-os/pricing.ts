import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasPricing").take(50),
});

export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasPricing").take(50),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("saasPricing")),
    name: v.string(),
    price: v.string(),
    period: v.string(),
    blurb: v.string(),
    bullets: v.array(v.string()),
    cta: v.object({ label: v.string(), href: v.string() }),
    featured: v.boolean(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("saasPricing", data);
  },
});

export const remove = mutation({
  args: { id: v.id("saasPricing") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
