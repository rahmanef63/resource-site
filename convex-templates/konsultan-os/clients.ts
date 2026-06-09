import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STATUS = v.union(v.literal("lead"), v.literal("active"), v.literal("completed"));

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("konsultanClients").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("konsultanClients")),
    name: v.string(),
    company: v.string(),
    industry: v.string(),
    email: v.string(),
    phone: v.string(),
    city: v.string(),
    status: STATUS,
    createdAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("konsultanClients", data);
  },
});

export const remove = mutation({
  args: { id: v.id("konsultanClients") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
