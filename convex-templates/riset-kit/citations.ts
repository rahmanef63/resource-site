import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STYLE = v.union(
  v.literal("APA"),
  v.literal("MLA"),
  v.literal("Chicago"),
  v.literal("IEEE"),
  v.literal("BibTeX"),
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("risetCitations").order("desc").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("risetCitations")),
    docId: v.string(),
    style: STYLE,
    rendered: v.string(),
    bibKey: v.string(),
    addedAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("risetCitations", data);
  },
});

export const remove = mutation({
  args: { id: v.id("risetCitations") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
