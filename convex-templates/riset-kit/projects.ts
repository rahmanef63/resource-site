import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STATUS = v.union(
  v.literal("exploring"),
  v.literal("active"),
  v.literal("writing"),
  v.literal("submitted"),
  v.literal("archived"),
);

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    if (status) {
      return ctx.db
        .query("risetProjects")
        .withIndex("by_status", (q) => q.eq("status", status as never))
        .take(200);
    }
    return ctx.db.query("risetProjects").take(200);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("risetProjects").take(200),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("risetProjects")),
    title: v.string(),
    hypothesis: v.string(),
    status: STATUS,
    startedAt: v.number(),
    updatedAt: v.number(),
    targetVenue: v.string(),
    linkedDocIds: v.array(v.string()),
    linkedNoteIds: v.array(v.string()),
    collaboratorIds: v.array(v.string()),
    progress: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("risetProjects", data);
  },
});

export const remove = mutation({
  args: { id: v.id("risetProjects") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
