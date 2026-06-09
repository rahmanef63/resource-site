import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STATUS = v.union(v.literal("pending"), v.literal("approved"), v.literal("spam"));
const AIFLAG = v.optional(v.union(v.literal("spam"), v.literal("toxic"), v.null()));

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("agencyComments").order("desc").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("agencyComments")),
    postId: v.string(),
    postTitle: v.string(),
    author: v.string(),
    email: v.string(),
    body: v.string(),
    status: STATUS,
    aiFlag: AIFLAG,
    ts: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("agencyComments", data);
  },
});

export const moderate = mutation({
  args: { id: v.id("agencyComments"), status: STATUS },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
  },
});

export const remove = mutation({
  args: { id: v.id("agencyComments") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
