import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    if (status) {
      return await ctx.db.query("agencyProjects").withIndex("by_status", (q) => q.eq("status", status as any)).take(100);
    }
    return await ctx.db.query("agencyProjects").take(100);
  },
});

export const featured = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agencyProjects").withIndex("by_featured", (q) => q.eq("featured", true)).take(20);
  },
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db.query("agencyProjects").withIndex("by_slug", (q) => q.eq("slug", slug)).first();
  },
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("agencyProjects")),
    slug: v.string(),
    title: v.string(),
    client: v.string(),
    category: v.string(),
    cover: v.string(),
    blurb: v.string(),
    brief: v.string(),
    outcome: v.string(),
    status: v.string(),
    featured: v.boolean(),
  },
  handler: async (ctx, { id, ...patch }) => {
    if (id) {
      await ctx.db.patch(id, patch);
      return id;
    }
    return await ctx.db.insert("agencyProjects", { ...patch, status: patch.status as any, publishedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("agencyProjects") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
