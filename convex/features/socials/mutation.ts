import { mutation, internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "../../_shared/auth";

const shape = {
  platform: v.string(),
  url: v.string(),
  handle: v.optional(v.string()),
  label: v.optional(v.string()),
  order: v.number(),
  visible: v.boolean(),
  featured: v.optional(v.boolean()),
  relMe: v.optional(v.boolean()),
  sameAs: v.optional(v.boolean()),
};

export const create = mutation({
  args: shape,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const collision = await ctx.db
      .query("socialLinks")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();
    if (collision) throw new Error(`URL sudah terdaftar: ${args.url}`);
    return ctx.db.insert("socialLinks", { ...args, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    id: v.id("socialLinks"),
    patch: v.object({
      platform: v.optional(v.string()),
      url: v.optional(v.string()),
      handle: v.optional(v.string()),
      label: v.optional(v.string()),
      order: v.optional(v.number()),
      visible: v.optional(v.boolean()),
      featured: v.optional(v.boolean()),
      relMe: v.optional(v.boolean()),
      sameAs: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, patch }) => {
    await requireAdmin(ctx);
    if (patch.url) {
      const existing = await ctx.db
        .query("socialLinks")
        .withIndex("by_url", (q) => q.eq("url", patch.url as string))
        .first();
      if (existing && existing._id !== id) {
        throw new Error(`URL sudah terdaftar di row lain: ${patch.url}`);
      }
    }
    await ctx.db.patch(id, patch);
    return { success: true };
  },
});

export const remove = mutation({
  args: { id: v.id("socialLinks") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    return { success: true };
  },
});

// Idempotent batch seed — pass platform array via `npx convex run`.
// Consumer-defined defaults; the lift dropped the rahmanef.com personal
// list (github/linkedin/instagram/...) so each adopter ships their own.
// Re-runs skip rows whose URL is already present.
export const seed = internalMutation({
  args: { items: v.array(v.object(shape)) },
  handler: async (ctx, { items }) => {
    let inserted = 0;
    let skipped = 0;
    const now = Date.now();
    for (const item of items) {
      const existing = await ctx.db
        .query("socialLinks")
        .withIndex("by_url", (q) => q.eq("url", item.url))
        .first();
      if (existing) {
        skipped++;
        continue;
      }
      await ctx.db.insert("socialLinks", { ...item, createdAt: now });
      inserted++;
    }
    return { inserted, skipped };
  },
});
