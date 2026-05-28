import { query } from "../../_generated/server";

const MAX_SOCIALS = 200;

export const listAll = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("socialLinks").withIndex("by_order").take(MAX_SOCIALS),
});

export const listVisible = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("socialLinks")
      .withIndex("by_order")
      .take(MAX_SOCIALS);
    return rows.filter((r) => r.visible);
  },
});
