import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const KIND = v.union(v.literal("feature"), v.literal("fix"), v.literal("chore"));

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasChangelog").order("desc").take(200),
});

export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasChangelog").order("desc").take(200),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("saasChangelog")),
    version: v.string(),
    date: v.number(),
    kind: KIND,
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("saasChangelog", data);
  },
});

export const remove = mutation({
  args: { id: v.id("saasChangelog") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
