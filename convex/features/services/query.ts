import { query } from "../../_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("services").withIndex("by_order").collect(),
});

export const get = query({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});
