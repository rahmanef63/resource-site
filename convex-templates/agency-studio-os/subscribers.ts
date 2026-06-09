import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STATUS = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("unsubscribed"),
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("agencySubscribers").order("desc").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("agencySubscribers")),
    email: v.string(),
    status: STATUS,
    source: v.string(),
    ts: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("agencySubscribers", data);
  },
});

export const remove = mutation({
  args: { id: v.id("agencySubscribers") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
