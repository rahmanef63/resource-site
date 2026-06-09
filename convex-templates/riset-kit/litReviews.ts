import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MATRIX = v.array(
  v.object({
    docId: v.string(),
    method: v.string(),
    finding: v.string(),
    gap: v.string(),
  }),
);

export const list = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("risetLitReviews").withIndex("by_updatedAt").order("desc").take(200),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("risetLitReviews")),
    topic: v.string(),
    question: v.string(),
    docIds: v.array(v.string()),
    matrix: MATRIX,
    updatedAt: v.number(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("risetLitReviews", data);
  },
});

export const remove = mutation({
  args: { id: v.id("risetLitReviews") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
