import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STATUS = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("qualified"),
  v.literal("won"),
  v.literal("lost"),
);

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    if (status) {
      return ctx.db
        .query("agencyLeads")
        .withIndex("by_status", (q) => q.eq("status", status as never))
        .take(200);
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
    status: v.optional(STATUS),
    ts: v.optional(v.number()),
  },
  handler: async (ctx, { status, ts, ...data }) =>
    ctx.db.insert("agencyLeads", { ...data, status: status ?? "new", ts: ts ?? Date.now() }),
});

export const update = mutation({
  args: {
    id: v.id("agencyLeads"),
    status: v.optional(STATUS),
    topic: v.optional(v.string()),
    budget: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const clean: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(patch)) if (val !== undefined) clean[k] = val;
    await ctx.db.patch(id, clean);
  },
});

export const remove = mutation({
  args: { id: v.id("agencyLeads") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
