import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const KIND = v.union(
  v.literal("deliverable"),
  v.literal("memo"),
  v.literal("minutes"),
  v.literal("report"),
);
const STATUS = v.union(v.literal("draft"), v.literal("shared"));

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("konsultanDocuments").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("konsultanDocuments")),
    projectId: v.string(),
    title: v.string(),
    kind: KIND,
    status: STATUS,
    updatedAt: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("konsultanDocuments", data);
  },
});

export const remove = mutation({
  args: { id: v.id("konsultanDocuments") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
