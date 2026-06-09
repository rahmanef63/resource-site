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
const STATUS = v.union(v.literal("draft"), v.literal("sent"));

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("kreatorComments").order("desc").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("kreatorComments")),
    channel: CHANNEL,
    postRef: v.string(),
    comment: v.string(),
    reply: v.string(),
    status: STATUS,
    ts: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("kreatorComments", data);
  },
});

export const remove = mutation({
  args: { id: v.id("kreatorComments") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
