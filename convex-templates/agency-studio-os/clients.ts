import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("agencyClients").take(200),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("agencyClients")),
    name: v.string(),
    industry: v.string(),
    contact: v.string(),
    email: v.string(),
    status: v.string(),
    notes: v.string(),
  },
  handler: async (ctx, { id, ...patch }) => {
    if (id) {
      await ctx.db.patch(id, patch);
      return id;
    }
    return await ctx.db.insert("agencyClients", { ...patch, status: patch.status as any, startedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("agencyClients") },
  handler: async (ctx, { id }) => { await ctx.db.delete(id); },
});
