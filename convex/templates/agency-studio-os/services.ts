import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("agencyServices").take(50),
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) =>
    ctx.db.query("agencyServices").withIndex("by_slug", (q) => q.eq("slug", slug)).first(),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("agencyServices")),
    slug: v.string(),
    name: v.string(),
    blurb: v.string(),
    priceLabel: v.string(),
    duration: v.string(),
    bullets: v.array(v.string()),
    featured: v.boolean(),
  },
  handler: async (ctx, { id, ...patch }) => {
    if (id) {
      await ctx.db.patch(id, patch);
      return id;
    }
    return await ctx.db.insert("agencyServices", patch);
  },
});

export const remove = mutation({
  args: { id: v.id("agencyServices") },
  handler: async (ctx, { id }) => { await ctx.db.delete(id); },
});
