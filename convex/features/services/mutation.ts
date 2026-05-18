import { mutation, internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "../../_shared/auth";

const shape = {
  title: v.string(),
  summary: v.string(),
  deliverables: v.array(v.string()),
  order: v.number(),
};

export const create = mutation({
  args: shape,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.insert("services", { ...args, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    patch: v.object({
      title: v.optional(v.string()),
      summary: v.optional(v.string()),
      deliverables: v.optional(v.array(v.string())),
      order: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { id, patch }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, patch);
    return { success: true };
  },
});

export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    return { success: true };
  },
});

export const seed = internalMutation({
  args: { items: v.array(v.object(shape)) },
  handler: async (ctx, { items }) => {
    const existing = await ctx.db.query("services").first();
    if (existing) return { success: false, message: "Already seeded" };
    for (const item of items) {
      await ctx.db.insert("services", { ...item, createdAt: Date.now() });
    }
    return { success: true, count: items.length };
  },
});
