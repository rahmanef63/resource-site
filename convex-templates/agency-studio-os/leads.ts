import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    if (status) {
      return ctx.db.query("agencyLeads").withIndex("by_status", (q) => q.eq("status", status as any)).take(200);
    }
    return ctx.db.query("agencyLeads").take(200);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    company: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    topic: v.string(),
    source: v.string(),
    budget: v.optional(v.string()),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("agencyLeads", { ...args, status: "new", ts: Date.now() }),
});

export const update = mutation({
  args: { id: v.id("agencyLeads"), patch: v.object({ status: v.optional(v.string()) }) },
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, patch as any);
  },
});

export const remove = mutation({
  args: { id: v.id("agencyLeads") },
  handler: async (ctx, { id }) => { await ctx.db.delete(id); },
});
