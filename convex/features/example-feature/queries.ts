import { query } from "../../_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return ctx.db
      .query("exampleItems")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit ?? 50);
  },
});

export const get = query({
  args: { id: v.id("exampleItems") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});
