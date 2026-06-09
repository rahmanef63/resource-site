import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STATUS = v.union(
  v.literal("uploaded"),
  v.literal("indexed"),
  v.literal("reviewed"),
);

export const list = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("risetDocuments").withIndex("by_uploadedAt").order("desc").take(500),
});

export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("risetDocuments").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("risetDocuments")),
    title: v.string(),
    authors: v.string(),
    year: v.number(),
    fileLabel: v.string(),
    abstract: v.string(),
    tag: v.string(),
    status: STATUS,
    uploadedAt: v.number(),
    pages: v.number(),
    highlights: v.number(),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("risetDocuments", data);
  },
});

export const remove = mutation({
  args: { id: v.id("risetDocuments") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
