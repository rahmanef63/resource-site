import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STATUS = v.union(
  v.literal("draft"),
  v.literal("sent"),
  v.literal("accepted"),
  v.literal("rejected"),
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("konsultanProposals").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("konsultanProposals")),
    clientId: v.string(),
    title: v.string(),
    scope: v.string(),
    valueLabel: v.string(),
    durationLabel: v.string(),
    status: STATUS,
    createdAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("konsultanProposals", data);
  },
});

export const remove = mutation({
  args: { id: v.id("konsultanProposals") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
