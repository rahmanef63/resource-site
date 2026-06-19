// pages-cms slice — admin mutations (copy-source).
//
// IMPORTANT: these mutations are NOT auth-gated. The slice ships
// portable CRUD primitives as `internalMutation`s; the consumer MUST
// wrap them with an auth-gated public `mutation` (or call from an
// `httpAction` after validating the request bearer / OAuth token).
// See the slice README "Wiring to your own backend" section.

import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { pageContentShape, pagePatchShape } from "./_schema";

export const create = internalMutation({
  args: pageContentShape,
  handler: async (ctx, args) => {
    const collision = await ctx.db
      .query("cmsPages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (collision && !collision.deletedAt)
      throw new Error(`Slug "${args.slug}" already in use`);
    const now = Date.now();
    return ctx.db.insert("cmsPages", { ...args, createdAt: now, updatedAt: now });
  },
});

export const update = internalMutation({
  args: { id: v.id("cmsPages"), patch: v.object(pagePatchShape) },
  handler: async (ctx, { id, patch }) => {
    const row = await ctx.db.get(id);
    if (!row || row.deletedAt) throw new Error("Page not found");
    if (row.systemPage) throw new Error("System pages are read-only");
    if (patch.slug) {
      const existing = await ctx.db
        .query("cmsPages")
        .withIndex("by_slug", (q) => q.eq("slug", patch.slug as string))
        .first();
      if (existing && existing._id !== id && !existing.deletedAt)
        throw new Error(`Slug "${patch.slug}" already in use`);
    }
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
    return { success: true };
  },
});

export const reorderBlock = internalMutation({
  args: { id: v.id("cmsPages"), from: v.number(), to: v.number() },
  handler: async (ctx, { id, from, to }) => {
    const row = await ctx.db.get(id);
    if (!row || row.deletedAt) throw new Error("Page not found");
    if (row.systemPage) throw new Error("System pages are read-only");
    const blocks = (row.blocks as unknown[]).slice();
    if (from === to) return { success: true };
    if (from < 0 || to < 0 || from >= blocks.length || to >= blocks.length)
      throw new Error("Block index out of range");
    const [moved] = blocks.splice(from, 1);
    blocks.splice(to, 0, moved);
    await ctx.db.patch(id, { blocks, updatedAt: Date.now() });
    return { success: true };
  },
});

export const remove = internalMutation({
  args: { id: v.id("cmsPages") },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) throw new Error("Page not found");
    if (row.systemPage) throw new Error("System pages can't be deleted");
    await ctx.db.patch(id, { deletedAt: Date.now() });
    return { success: true };
  },
});

// Generic idempotent seed — inserts only when the pages table is empty.
// Consumer passes its own demo pages (slug-collision skip keeps re-runs
// safe). Project-specific seed data is NOT bundled.
export const seed = internalMutation({
  args: { pages: v.array(v.object(pageContentShape)) },
  handler: async (ctx, { pages }) => {
    const existing = await ctx.db.query("cmsPages").first();
    if (existing) return { success: false, message: "Already seeded" };
    const now = Date.now();
    for (const page of pages) {
      await ctx.db.insert("cmsPages", { ...page, createdAt: now, updatedAt: now });
    }
    return { success: true, pages: pages.length };
  },
});
