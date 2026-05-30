// library slice — public + admin reads.
//
// Paths assume the consumer mounts this file under
// `convex/features/library/query.ts` and exposes it via their root
// `convex/_generated` barrel. All reads are index-bounded + capped
// (no bare `.collect()`).

import { query } from "../../_generated/server";
import { v } from "convex/values";

const LIST_CAP = 2000;

export const listAll = query({
  args: {
    publishedOnly: v.optional(v.boolean()),
    kind: v.optional(v.string()),
  },
  handler: async (ctx, { publishedOnly, kind }) => {
    const base = publishedOnly
      ? ctx.db
          .query("libraryItems")
          .withIndex("by_published", (q) => q.eq("published", true))
      : ctx.db.query("libraryItems").withIndex("by_order");
    let rows = (await base.take(LIST_CAP)).filter((r) => !r.deletedAt);
    if (kind) rows = rows.filter((r) => r.kind === kind);
    return rows.sort((a, b) => a.order - b.order);
  },
});

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("libraryItems")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(LIST_CAP);
    return rows.filter((r) => !r.deletedAt).sort((a, b) => a.order - b.order);
  },
});

export const listByCollection = query({
  args: { collectionSlug: v.string() },
  handler: async (ctx, { collectionSlug }) => {
    const collection = await ctx.db
      .query("libraryCollections")
      .withIndex("by_slug", (q) => q.eq("slug", collectionSlug))
      .first();
    if (!collection || collection.deletedAt) return null;
    const rows = await ctx.db
      .query("libraryItems")
      .withIndex("by_collection", (q) => q.eq("collectionId", collection._id))
      .take(LIST_CAP);
    return {
      collection,
      items: rows
        .filter((r) => r.published && !r.deletedAt)
        .sort((a, b) => a.order - b.order),
    };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const row = await ctx.db
      .query("libraryItems")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!row || row.deletedAt) return null;
    return row;
  },
});

export const listFeatured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db
      .query("libraryItems")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .take(LIST_CAP);
    return rows
      .filter((r) => r.published && !r.deletedAt)
      .sort((a, b) => a.order - b.order)
      .slice(0, limit ?? 6);
  },
});

export const listCollections = query({
  args: { publishedOnly: v.optional(v.boolean()) },
  handler: async (ctx, { publishedOnly }) => {
    const rows = await ctx.db
      .query("libraryCollections")
      .withIndex("by_order")
      .take(LIST_CAP);
    return rows
      .filter((r) => !r.deletedAt && (!publishedOnly || r.published))
      .sort((a, b) => a.order - b.order);
  },
});

export const getCollectionBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const row = await ctx.db
      .query("libraryCollections")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!row || row.deletedAt) return null;
    return row;
  },
});
