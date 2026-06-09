import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("wirausahaProducts").take(500),
});
export const listAll = list;

export const upsert = mutation({
  args: {
    id: v.optional(v.id("wirausahaProducts")),
    businessId: v.string(),
    name: v.string(),
    sku: v.string(),
    priceLabel: v.string(),
    stock: v.number(),
    unit: v.string(),
    icon: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("wirausahaProducts", data);
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaProducts") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
