// pages-cms slice — public + admin reads (copy-source).
//
// Paths assume the consumer mounts this under
// `convex/features/pages-cms/query.ts` and exposes it via their root
// `convex/_generated` barrel. All reads are index-bounded + capped (no
// bare `.collect()`).

import { query } from "../../_generated/server";
import { v } from "convex/values";

const LIST_CAP = 2000;

export const listAll = query({
  args: { publishedOnly: v.optional(v.boolean()) },
  handler: async (ctx, { publishedOnly }) => {
    const base = publishedOnly
      ? ctx.db.query("cmsPages").withIndex("by_status", (q) => q.eq("status", "published"))
      : ctx.db.query("cmsPages").withIndex("by_updated");
    const rows = await base.take(LIST_CAP);
    return rows.filter((r) => !r.deletedAt).sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("cmsPages")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .take(LIST_CAP);
    return rows.filter((r) => !r.deletedAt).sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const row = await ctx.db
      .query("cmsPages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!row || row.deletedAt) return null;
    return row;
  },
});

export const getById = query({
  args: { id: v.id("cmsPages") },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row || row.deletedAt) return null;
    return row;
  },
});
