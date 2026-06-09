import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("kreatorFeaturedClients").take(100),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("kreatorFeaturedClients")),
    name: v.string(),
    initial: v.string(),
    gradient: v.string(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("kreatorFeaturedClients", data);
  },
});

export const remove = mutation({
  args: { id: v.id("kreatorFeaturedClients") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
