import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const KIND = v.union(v.literal("income"), v.literal("expense"));

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("wirausahaFinance").order("desc").take(500),
});
export const listAll = list;

export const upsert = mutation({
  args: {
    id: v.optional(v.id("wirausahaFinance")),
    businessId: v.string(),
    kind: KIND,
    category: v.string(),
    amountLabel: v.string(),
    note: v.string(),
    ts: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("wirausahaFinance", data);
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaFinance") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
