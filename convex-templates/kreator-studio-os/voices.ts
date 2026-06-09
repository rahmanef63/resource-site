import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("kreatorVoices").take(200),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("kreatorVoices")),
    name: v.string(),
    description: v.string(),
    doExamples: v.array(v.string()),
    dontExamples: v.array(v.string()),
    tone: v.string(),
    trainedAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("kreatorVoices", data);
  },
});

export const remove = mutation({
  args: { id: v.id("kreatorVoices") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
