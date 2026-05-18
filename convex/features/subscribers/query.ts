import { query } from "../../_generated/server";
import { requireAdmin } from "../../_shared/auth";

const HARD_CAP = 2000;

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("subscribers")
      .withIndex("by_createdAt")
      .order("desc")
      .take(HARD_CAP);
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("subscribers").take(HARD_CAP);
    return {
      total: all.length,
      confirmed: all.filter((s) => s.confirmed && !s.unsubscribedAt).length,
      unsubscribed: all.filter((s) => s.unsubscribedAt != null).length,
    };
  },
});
