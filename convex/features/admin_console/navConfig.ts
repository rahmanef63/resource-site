import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "../../_shared/auth";

// Nav is public read (it renders the site menu); writes are admin-gated.
export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("ac_nav_items").withIndex("by_order").take(200),
});

const shape = {
  label: v.string(),
  href: v.string(),
  icon: v.optional(v.string()),
  parentId: v.optional(v.id("ac_nav_items")),
  order: v.number(),
  visible: v.boolean(),
  target: v.optional(v.string()),
};

export const upsert = mutation({
  args: { id: v.optional(v.id("ac_nav_items")), ...shape },
  handler: async (ctx, { id, ...data }) => {
    await requireAdmin(ctx);
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("ac_nav_items", data);
  },
});

export const remove = mutation({
  args: { id: v.id("ac_nav_items") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    return { success: true };
  },
});

export const reorder = mutation({
  args: { ids: v.array(v.id("ac_nav_items")) },
  handler: async (ctx, { ids }) => {
    await requireAdmin(ctx);
    await Promise.all(ids.map((id, order) => ctx.db.patch(id, { order })));
    return { success: true };
  },
});
