import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STATUS = v.union(v.literal("draft"), v.literal("signed"), v.literal("expired"));

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("konsultanContracts").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("konsultanContracts")),
    proposalId: v.string(),
    clientId: v.string(),
    title: v.string(),
    termsSummary: v.string(),
    status: STATUS,
    signedAt: v.number(),
    endsAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("konsultanContracts", data);
  },
});

export const remove = mutation({
  args: { id: v.id("konsultanContracts") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
