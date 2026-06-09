import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("wirausahaCustomers").take(500),
});
export const listAll = list;

export const upsert = mutation({
  args: {
    id: v.optional(v.id("wirausahaCustomers")),
    name: v.string(),
    phone: v.string(),
    city: v.string(),
    totalSpentLabel: v.string(),
    orderCount: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("wirausahaCustomers", data);
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaCustomers") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
