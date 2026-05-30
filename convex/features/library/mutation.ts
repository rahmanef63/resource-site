// library slice — admin mutations.
//
// IMPORTANT: these mutations are NOT auth-gated. The slice ships
// portable CRUD primitives as `internalMutation`s; the consumer MUST
// wrap them with an auth-gated public `mutation` (or call from an
// `httpAction` after validating the request bearer / OAuth token).
// See the slice README "Install" section for the wrap pattern.

import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import {
  itemContentShape,
  itemPatchShape,
  collectionContentShape,
  collectionPatchShape,
} from "./_schema";

// Per-kind payload sanity check — rejects rows whose kind-specific
// required field is empty so the public render stays branchless.
const validatePayload = (
  kind: string,
  a: {
    promptText?: string;
    imageUrl?: string;
    videoUrl?: string;
    linkUrl?: string;
    fileStorageId?: string;
    snippetCode?: string;
  },
): void => {
  const need: Record<string, unknown> = {
    prompt: a.promptText,
    image: a.imageUrl,
    video: a.videoUrl,
    link: a.linkUrl,
    download: a.fileStorageId,
    snippet: a.snippetCode,
  };
  if (kind in need && !need[kind])
    throw new Error(`Missing required payload field for kind="${kind}"`);
};

export const create = internalMutation({
  args: itemContentShape,
  handler: async (ctx, args) => {
    validatePayload(args.kind, args);
    const collision = await ctx.db
      .query("libraryItems")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (collision) throw new Error(`Slug "${args.slug}" already in use`);
    const now = Date.now();
    return ctx.db.insert("libraryItems", {
      ...args,
      views: 0,
      upvotes: 0,
      createdAt: now,
      updatedAt: args.updatedAt ?? now,
      publishedAt: args.publishedAt ?? (args.published ? now : undefined),
    });
  },
});

export const update = internalMutation({
  args: { id: v.id("libraryItems"), patch: v.object(itemPatchShape) },
  handler: async (ctx, { id, patch }) => {
    if (patch.slug) {
      const existing = await ctx.db
        .query("libraryItems")
        .withIndex("by_slug", (q) => q.eq("slug", patch.slug as string))
        .first();
      if (existing && existing._id !== id)
        throw new Error(`Slug "${patch.slug}" already in use`);
    }
    const stamped: Record<string, unknown> = {
      ...patch,
      updatedAt: patch.updatedAt ?? Date.now(),
    };
    if (patch.published === true) {
      const row = await ctx.db.get(id);
      if (row && !(row as { publishedAt?: number }).publishedAt)
        stamped.publishedAt = Date.now();
    }
    await ctx.db.patch(id, stamped);
    return { success: true };
  },
});

export const remove = internalMutation({
  args: { id: v.id("libraryItems") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { deletedAt: Date.now() });
    return { success: true };
  },
});

export const createCollection = internalMutation({
  args: collectionContentShape,
  handler: async (ctx, args) => {
    const collision = await ctx.db
      .query("libraryCollections")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (collision) throw new Error(`Slug "${args.slug}" already in use`);
    return ctx.db.insert("libraryCollections", { ...args, createdAt: Date.now() });
  },
});

export const updateCollection = internalMutation({
  args: { id: v.id("libraryCollections"), patch: v.object(collectionPatchShape) },
  handler: async (ctx, { id, patch }) => {
    if (patch.slug) {
      const existing = await ctx.db
        .query("libraryCollections")
        .withIndex("by_slug", (q) => q.eq("slug", patch.slug as string))
        .first();
      if (existing && existing._id !== id)
        throw new Error(`Slug "${patch.slug}" already in use`);
    }
    await ctx.db.patch(id, patch);
    return { success: true };
  },
});

export const removeCollection = internalMutation({
  args: { id: v.id("libraryCollections") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { deletedAt: Date.now() });
    return { success: true };
  },
});

// Generic idempotent seed — inserts only when the items table is empty.
// Consumer passes its own demo collections + items (slug-collision skip
// keeps re-runs safe). Project-specific seed data is NOT bundled.
export const seed = internalMutation({
  args: {
    collections: v.array(v.object(collectionContentShape)),
    items: v.array(
      v.object({ ...itemContentShape, collectionSlug: v.optional(v.string()) }),
    ),
  },
  handler: async (ctx, { collections, items }) => {
    const existing = await ctx.db.query("libraryItems").first();
    if (existing) return { success: false, message: "Already seeded" };
    const now = Date.now();
    const idBySlug: Record<string, unknown> = {};
    for (const c of collections) {
      idBySlug[c.slug] = await ctx.db.insert("libraryCollections", {
        ...c,
        createdAt: now,
      });
    }
    for (const item of items) {
      const { collectionSlug, ...rest } = item;
      await ctx.db.insert("libraryItems", {
        ...rest,
        collectionId: (collectionSlug
          ? idBySlug[collectionSlug]
          : rest.collectionId) as never,
        views: 0,
        upvotes: 0,
        createdAt: now,
        publishedAt: rest.published ? now : undefined,
      });
    }
    return { success: true, collections: collections.length, items: items.length };
  },
});
