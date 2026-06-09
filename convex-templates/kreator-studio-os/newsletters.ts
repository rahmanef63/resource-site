import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STATUS = v.union(v.literal("draft"), v.literal("scheduled"), v.literal("sent"));

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("kreatorNewsletters").order("desc").take(200),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("kreatorNewsletters")),
    subject: v.string(),
    preview: v.string(),
    status: STATUS,
    scheduledAt: v.number(),
    recipients: v.number(),
    openRate: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("kreatorNewsletters", data);
  },
});

export const remove = mutation({
  args: { id: v.id("kreatorNewsletters") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
