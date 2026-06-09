import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("wirausahaStores").take(200),
});
export const listAll = list;

export const upsert = mutation({
  args: {
    id: v.optional(v.id("wirausahaStores")),
    name: v.string(),
    businessId: v.optional(v.string()),
    city: v.string(),
    address: v.string(),
    phone: v.string(),
    hours: v.string(),
    mapsUrl: v.optional(v.string()),
    emoji: v.string(),
    gradient: v.string(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("wirausahaStores", data);
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaStores") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
