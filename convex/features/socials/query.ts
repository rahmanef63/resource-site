import { query } from "../../_generated/server";

export const listAll = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("socialLinks").withIndex("by_order").collect(),
});

export const listVisible = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("socialLinks")
      .withIndex("by_order")
      .collect();
    return rows.filter((r) => r.visible);
  },
});
