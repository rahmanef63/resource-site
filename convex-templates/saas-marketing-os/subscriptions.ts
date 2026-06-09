import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const PLAN = v.union(v.literal("team"), v.literal("scale"));
const STATUS = v.union(
  v.literal("active"),
  v.literal("trialing"),
  v.literal("past_due"),
  v.literal("canceled"),
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasSubscriptions").take(500),
});

export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasSubscriptions").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("saasSubscriptions")),
    customerId: v.string(),
    customerEmail: v.string(),
    plan: PLAN,
    mrrCents: v.number(),
    status: STATUS,
    renewsAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("saasSubscriptions", data);
  },
});

export const remove = mutation({
  args: { id: v.id("saasSubscriptions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
