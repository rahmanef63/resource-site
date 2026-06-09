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
  handler: async (ctx) => ctx.db.query("kreatorScripts").take(200),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("kreatorScripts")),
    title: v.string(),
    channel: CHANNEL,
    durationSec: v.number(),
    hook: v.string(),
    beats: v.array(v.string()),
    cta: v.string(),
    updatedAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("kreatorScripts", data);
  },
});

export const remove = mutation({
  args: { id: v.id("kreatorScripts") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
