import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasFeatures").take(50),
});

export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasFeatures").take(50),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("saasFeatures")),
    title: v.string(),
    blurb: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("saasFeatures", data);
  },
});

export const remove = mutation({
  args: { id: v.id("saasFeatures") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
