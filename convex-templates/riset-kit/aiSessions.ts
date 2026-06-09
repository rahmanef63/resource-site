import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("risetAiSessions").withIndex("by_ts").order("desc").take(500),
});

export const create = mutation({
  args: {
    docId: v.string(),
    question: v.string(),
    answer: v.string(),
    ts: v.optional(v.number()),
  },
  handler: async (ctx, { ts, ...data }) =>
    ctx.db.insert("risetAiSessions", { ...data, ts: ts ?? Date.now() }),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("risetAiSessions")),
    docId: v.string(),
    question: v.string(),
    answer: v.string(),
    ts: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("risetAiSessions", data);
  },
});

export const remove = mutation({
  args: { id: v.id("risetAiSessions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
