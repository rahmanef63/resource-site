import { query } from "../../_generated";
import type { QueryCtx } from "../../_generated";
import type { Doc } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin } from "../../../lib/rbac";

const quicklinkObject = v.object({
  id: v.id("quicklinks"),
  title: v.string(),
  url: v.string(),
  icon: v.optional(v.union(v.string(), v.null())),
  displayOrder: v.number(),
  active: v.boolean(),
});

type QuicklinkDoc = Doc<"quicklinks">;

function serializeQuicklink(row: QuicklinkDoc) {
  return {
    id: row._id,
    title: row.title,
    url: row.url,
    icon: row.icon ?? null,
    displayOrder: row.displayOrder,
    active: row.active,
  };
}

export const listQuicklinks = query({
  args: {},
  returns: v.object({
    quicklinks: v.array(quicklinkObject),
  }),
  handler: async (ctx: QueryCtx) => {
    const rows = (await ctx.db
      .query("quicklinks")
      .withIndex("by_active_order", (q: any) => q.eq("active", true))
      .order("asc")
      .take(2000)) as QuicklinkDoc[];

    const quicklinks = rows.map(serializeQuicklink);

    return { quicklinks };
  },
});

export const listAllQuicklinks = query({
  args: {},
  returns: v.object({
    quicklinks: v.array(quicklinkObject),
  }),
  handler: async (ctx: QueryCtx) => {
    await requireAdmin(ctx);

    const rows = (await ctx.db
      .query("quicklinks")
      .withIndex("by_active_order")
      .order("asc")
      .take(2000)) as QuicklinkDoc[];

    const quicklinks = rows.map(serializeQuicklink);

    return { quicklinks };
  },
});
