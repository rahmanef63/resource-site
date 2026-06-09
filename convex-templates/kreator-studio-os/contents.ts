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
const STATUS = v.union(
  v.literal("idea"),
  v.literal("draft"),
  v.literal("scheduled"),
  v.literal("published"),
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("kreatorContents").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("kreatorContents")),
    title: v.string(),
    channel: CHANNEL,
    status: STATUS,
    hook: v.string(),
    body: v.string(),
    scheduledAt: v.number(),
    views: v.number(),
    likes: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("kreatorContents", data);
  },
});

export const remove = mutation({
  args: { id: v.id("kreatorContents") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
