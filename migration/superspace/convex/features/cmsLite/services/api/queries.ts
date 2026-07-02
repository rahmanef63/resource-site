import { query } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin } from "../../../lib/rbac";
import type { QueryCtx } from "../../_generated";

export const serviceObject = v.object({
  _id: v.id("services"),
  slug: v.string(),
  displayOrder: v.number(),
  labelId: v.string(),
  labelEn: v.string(),
  labelAr: v.string(),
  active: v.boolean(),
});

export const listServices = query({
  args: {},
  returns: v.object({
    services: v.array(serviceObject),
  }),
  handler: async (ctx: QueryCtx) => {
    const services = await ctx.db
      .query("services")
      .withIndex("by_active_order", (q: any) => q.eq("active", true))
      .order("asc")
      .take(2000);

    return { services };
  },
});

export const listAllServices = query({
  args: {},
  returns: v.object({
    services: v.array(serviceObject),
  }),
  handler: async (ctx: QueryCtx) => {
    await requireAdmin(ctx);

    const services = await ctx.db
      .query("services")
      .withIndex("by_display_order")
      .order("asc")
      .take(2000);

    return { services };
  },
});


