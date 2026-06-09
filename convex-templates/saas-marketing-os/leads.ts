import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const SOURCE = v.union(
  v.literal("website"),
  v.literal("referral"),
  v.literal("ad"),
  v.literal("event"),
);
const STATUS = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("qualified"),
  v.literal("won"),
  v.literal("lost"),
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasLeads").order("desc").take(500),
});

export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("saasLeads").order("desc").take(500),
});

export const upsert = mutation({
  args: {
    id: v.optional(v.id("saasLeads")),
    email: v.string(),
    name: v.string(),
    source: SOURCE,
    status: STATUS,
    ts: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return ctx.db.insert("saasLeads", data);
  },
});

export const remove = mutation({
  args: { id: v.id("saasLeads") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
