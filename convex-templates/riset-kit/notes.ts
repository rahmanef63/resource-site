import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("risetNotes").withIndex("by_updatedAt").order("desc").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("risetNotes")),
    title: v.string(),
    body: v.string(),
    tags: v.array(v.string()),
    linkedDocIds: v.array(v.string()),
    updatedAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("risetNotes", data);
  },
});

export const remove = mutation({
  args: { id: v.id("risetNotes") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
