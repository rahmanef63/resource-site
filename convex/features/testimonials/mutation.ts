import { mutation, internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "../../_shared/auth";

const shape = {
  quote: v.string(),
  name: v.string(),
  role: v.string(),
  order: v.number(),
};

export const create = mutation({
  args: shape,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.insert("testimonials", { ...args, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    id: v.id("testimonials"),
    patch: v.object({
      quote: v.optional(v.string()),
      name: v.optional(v.string()),
      role: v.optional(v.string()),
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
  args: { id: v.id("testimonials") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    return { success: true };
  },
});

// One-shot seeder. Internal-only — call via `npx convex run`
// internal.features.testimonials.mutation.seed '{"items":[...]}'.
export const seed = internalMutation({
  args: { items: v.array(v.object(shape)) },
  handler: async (ctx, { items }) => {
    const existing = await ctx.db.query("testimonials").first();
    if (existing) return { success: false, message: "Already seeded" };
    for (const item of items) {
      await ctx.db.insert("testimonials", { ...item, createdAt: Date.now() });
    }
    return { success: true, count: items.length };
  },
});
