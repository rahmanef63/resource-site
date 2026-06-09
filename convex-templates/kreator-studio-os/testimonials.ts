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
  handler: async (ctx) => ctx.db.query("kreatorTestimonials").take(200),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("kreatorTestimonials")),
    author: v.string(),
    role: v.string(),
    company: v.optional(v.string()),
    quote: v.string(),
    rating: v.number(),
    channel: v.optional(v.union(CHANNEL, v.literal("client"), v.literal("audience"))),
    avatar: v.string(),
    gradient: v.string(),
    featured: v.optional(v.boolean()),
    receivedAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("kreatorTestimonials", data);
  },
});

export const remove = mutation({
  args: { id: v.id("kreatorTestimonials") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
