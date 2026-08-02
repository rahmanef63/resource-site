import { query } from "../../_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("testimonials").withIndex("by_order").take(500),
});

export const get = query({
  args: { id: v.id("testimonials") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});
