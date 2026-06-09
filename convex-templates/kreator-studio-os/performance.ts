import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const CHANNEL = v.union(
  v.literal("instagram"),
  v.literal("tiktok"),
  v.literal("youtube"),
  v.literal("twitter"),
  v.literal("newsletter"),
  v.literal("linkedin"),
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("kreatorPerformance").take(200),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("kreatorPerformance")),
    channel: CHANNEL,
    period: v.string(),
    views: v.number(),
    followers: v.number(),
    engagementRate: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("kreatorPerformance", data);
  },
});

export const remove = mutation({
  args: { id: v.id("kreatorPerformance") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
