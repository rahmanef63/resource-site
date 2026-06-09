import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STATUS = v.union(
  v.literal("discovery"),
  v.literal("design"),
  v.literal("build"),
  v.literal("delivered"),
  v.literal("archived"),
);

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    if (status) {
      return ctx.db
        .query("agencyProjects")
        .withIndex("by_status", (q) => q.eq("status", status as never))
        .take(100);
    }
    return ctx.db.query("agencyProjects").take(100);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("agencyProjects").take(200),
});

export const featured = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("agencyProjects").withIndex("by_featured", (q) => q.eq("featured", true)).take(20),
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) =>
    ctx.db.query("agencyProjects").withIndex("by_slug", (q) => q.eq("slug", slug)).first(),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("agencyProjects")),
    slug: v.string(),
    title: v.string(),
    client: v.string(),
    category: v.string(),
    cover: v.string(),
    icon: v.optional(v.string()),
    blurb: v.string(),
    brief: v.string(),
    outcome: v.string(),
    status: STATUS,
    publishedAt: v.number(),
    featured: v.boolean(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("agencyProjects", data);
  },
});

export const remove = mutation({
  args: { id: v.id("agencyProjects") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
