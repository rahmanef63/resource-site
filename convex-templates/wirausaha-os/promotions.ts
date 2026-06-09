import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const KIND = v.union(v.literal("percent"), v.literal("rupiah"));
const STATUS = v.union(
  v.literal("active"),
  v.literal("scheduled"),
  v.literal("expired"),
  v.literal("paused"),
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("wirausahaPromotions").take(200),
});
export const listAll = list;

export const upsert = mutation({
  args: {
    id: v.optional(v.id("wirausahaPromotions")),
    code: v.string(),
    label: v.string(),
    kind: KIND,
    value: v.number(),
    startAt: v.number(),
    endAt: v.number(),
    usageLimit: v.number(),
    usedCount: v.number(),
    targetSku: v.optional(v.string()),
    targetCategory: v.optional(v.string()),
    status: STATUS,
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("wirausahaPromotions", data);
  },
});

export const remove = mutation({
  args: { id: v.id("wirausahaPromotions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
