import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STATUS = v.union(
  v.literal("kickoff"),
  v.literal("in-progress"),
  v.literal("review"),
  v.literal("delivered"),
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("konsultanProjects").take(500),
});

// Alias so the store can call either name (matches agency's `listAll`).
export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("konsultanProjects").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("konsultanProjects")),
    contractId: v.string(),
    clientId: v.string(),
    name: v.string(),
    description: v.string(),
    status: STATUS,
    progress: v.number(),
    startedAt: v.number(),
    endsAt: v.number(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("konsultanProjects", data);
  },
});

export const remove = mutation({
  args: { id: v.id("konsultanProjects") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
