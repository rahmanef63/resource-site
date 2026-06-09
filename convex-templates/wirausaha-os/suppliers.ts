import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("wirausahaSuppliers").take(200),
});
export const listAll = list;

export const upsert = mutation({
  args: {
    id: v.optional(v.id("wirausahaSuppliers")),
    name: v.string(),
    contactPerson: v.string(),
    phone: v.string(),
    city: v.string(),
    leadTimeDays: v.number(),
    terms: v.string(),
    category: v.string(),
    linkedSkus: v.array(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("wirausahaSuppliers", data);
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaSuppliers") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
